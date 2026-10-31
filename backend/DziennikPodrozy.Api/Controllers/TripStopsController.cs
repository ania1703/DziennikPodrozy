using System.Security.Claims;
using DziennikPodrozy.Api.Data;
using DziennikPodrozy.Api.DTOs;
using DziennikPodrozy.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DziennikPodrozy.Api.Services;

namespace DziennikPodrozy.Api.Controllers;

[ApiController]
[Route("api/trips/{tripId}/stops")]
[Authorize]
public class TripStopsController : ControllerBase
{
    private const string DateOutOfRangeMessage =
        "Data przystanku musi mieścić się w datach podróży.";

    private readonly AppDbContext _context;
    private readonly FileStorageService _fileStorage;
    private readonly WeatherService _weather;
    private readonly GeocodingService _geocoding;

    public TripStopsController(
        AppDbContext context,
        FileStorageService fileStorage,
        WeatherService weather,
        GeocodingService geocoding)
    {
        _context = context;
        _fileStorage = fileStorage;
        _weather = weather;
        _geocoding = geocoding;
    }

    private string OwnerId => User.FindFirstValue(ClaimTypes.NameIdentifier)!;

    [HttpGet]
    public async Task<IActionResult> GetStops(int tripId)
    {
        var tripExists = await _context.Trips
            .AnyAsync(t => t.Id == tripId && t.OwnerId == OwnerId);

        if (!tripExists)
        {
            return NotFound();
        }

        var stops = await _context.TripStops
            .Include(s => s.Photos)
            .Include(s => s.Recordings)
            .AsSplitQuery()
            .Where(s => s.TripId == tripId)
            .OrderBy(s => s.Date)
            .ThenBy(s => s.SortOrder)
            .ToListAsync();

        await RefreshWeatherAsync(stops);
        await _geocoding.FillMissingCountriesAsync(stops, 5);
        await _context.SaveChangesAsync();

        return Ok(stops.Select(ToDto));
    }

    [HttpPost]
    public async Task<IActionResult> CreateStop(int tripId, CreateTripStopDto dto)
    {
        var trip = await FindOwnTripAsync(tripId);

        if (trip == null)
        {
            return NotFound();
        }

        if (!IsDateWithinTrip(trip, dto.Date))
        {
            return BadRequest(new { message = DateOutOfRangeMessage });
        }

        var stop = new TripStop
        {
            TripId = tripId,
            Title = dto.Title,
            Latitude = dto.Latitude,
            Longitude = dto.Longitude,
            Date = dto.Date,
            SortOrder = await NextSortOrderAsync(tripId, dto.Date),
            Note = dto.Note
        };

        stop.CountryCode = await _geocoding.GetCountryCodeAsync(dto.Latitude, dto.Longitude);
        stop.CountryCheckedAt = DateTime.UtcNow;

        _context.TripStops.Add(stop);
        await _context.SaveChangesAsync();

        return Created($"/api/trips/{tripId}/stops/{stop.Id}", ToDto(stop));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateStop(int tripId, int id, UpdateTripStopDto dto)
    {
        var stop = await FindOwnStopAsync(tripId, id);

        if (stop == null)
        {
            return NotFound();
        }

        if (!IsDateWithinTrip(stop.Trip!, dto.Date))
        {
            return BadRequest(new { message = DateOutOfRangeMessage });
        }

        if (dto.Date != stop.Date)
        {
            stop.SortOrder = await NextSortOrderAsync(tripId, dto.Date);
        }

        if (dto.Date != stop.Date
            || dto.Latitude != stop.Latitude
            || dto.Longitude != stop.Longitude)
        {
            ClearWeather(stop);
        }

        if (dto.Latitude != stop.Latitude || dto.Longitude != stop.Longitude)
        {
            stop.CountryCode = await _geocoding.GetCountryCodeAsync(dto.Latitude, dto.Longitude);
            stop.CountryCheckedAt = DateTime.UtcNow;
        }

        stop.Title = dto.Title;
        stop.Latitude = dto.Latitude;
        stop.Longitude = dto.Longitude;
        stop.Date = dto.Date;
        stop.Note = dto.Note;

        await _context.SaveChangesAsync();

        return Ok(ToDto(stop));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteStop(int tripId, int id)
    {
        var stop = await FindOwnStopAsync(tripId, id);

        if (stop == null)
        {
            return NotFound();
        }

        _context.TripStops.Remove(stop);
        await _context.SaveChangesAsync();

        foreach (var photo in stop.Photos)
        {
            _fileStorage.Delete(photo.Url);
        }

        foreach (var recording in stop.Recordings)
        {
            _fileStorage.Delete(recording.Url);
        }

        return NoContent();
    }

    private Task<Trip?> FindOwnTripAsync(int tripId)
    {
        return _context.Trips
            .FirstOrDefaultAsync(t => t.Id == tripId && t.OwnerId == OwnerId);
    }

    private Task<TripStop?> FindOwnStopAsync(int tripId, int id)
    {
        return _context.TripStops
            .Include(s => s.Trip)
            .Include(s => s.Photos)
            .Include(s => s.Recordings)
            .AsSplitQuery()
            .FirstOrDefaultAsync(s =>
                s.Id == id && s.TripId == tripId && s.Trip!.OwnerId == OwnerId);
    }

    private static bool IsDateWithinTrip(Trip trip, DateOnly date)
    {
        return date >= trip.StartDate
            && (!trip.EndDate.HasValue || date <= trip.EndDate.Value);
    }

    private async Task<int> NextSortOrderAsync(int tripId, DateOnly date)
    {
        var lastOrder = await _context.TripStops
            .Where(s => s.TripId == tripId && s.Date == date)
            .MaxAsync(s => (int?)s.SortOrder);

        return (lastOrder ?? 0) + 1;
    }

    private async Task RefreshWeatherAsync(List<TripStop> stops)
    {
        var now = DateTime.UtcNow;
        var today = DateOnly.FromDateTime(now);

        var outdated = stops.Where(stop => NeedsWeather(stop, today, now)).ToList();

        if (outdated.Count == 0)
        {
            return;
        }

        var results = await Task.WhenAll(
            outdated.Select(stop =>
                _weather.GetDailyWeatherAsync(stop.Latitude, stop.Longitude, stop.Date)));

        for (var i = 0; i < outdated.Count; i++)
        {
            var stop = outdated[i];
            var weather = results[i];

            stop.WeatherCheckedAt = now;

            if (weather != null)
            {
                stop.WeatherCode = weather.WeatherCode;
                stop.TemperatureMax = weather.TemperatureMax;
                stop.TemperatureMin = weather.TemperatureMin;
                stop.PrecipitationMm = weather.PrecipitationMm;
            }
        }

        await _context.SaveChangesAsync();
    }

    private static bool NeedsWeather(TripStop stop, DateOnly today, DateTime now)
    {
        if (!WeatherService.IsInRange(stop.Date))
        {
            return false;
        }

        if (stop.WeatherCheckedAt == null)
        {
            return true;
        }

        var age = now - stop.WeatherCheckedAt.Value;

        if (stop.WeatherCode == null)
        {
            return age > TimeSpan.FromHours(1);
        }

        return stop.Date >= today && age > TimeSpan.FromHours(6);
    }

    private static void ClearWeather(TripStop stop)
    {
        stop.WeatherCode = null;
        stop.TemperatureMax = null;
        stop.TemperatureMin = null;
        stop.PrecipitationMm = null;
        stop.WeatherCheckedAt = null;
    }

    private static TripStopDto ToDto(TripStop stop)
    {
        return new TripStopDto
        {
            Id = stop.Id,
            Title = stop.Title,
            Latitude = stop.Latitude,
            Longitude = stop.Longitude,
            Date = stop.Date,
            SortOrder = stop.SortOrder,
            Note = stop.Note,
            CountryCode = stop.CountryCode,
            Photos = stop.Photos
                .OrderBy(p => p.SortOrder)
                .Select(StopPhotoDto.From)
                .ToList(),
            Weather = stop.WeatherCode.HasValue
                && stop.TemperatureMax.HasValue
                && stop.TemperatureMin.HasValue
                ? new WeatherDto
                {
                    WeatherCode = stop.WeatherCode.Value,
                    TemperatureMax = stop.TemperatureMax.Value,
                    TemperatureMin = stop.TemperatureMin.Value,
                    PrecipitationMm = stop.PrecipitationMm ?? 0
                }
                : null,
            Recordings = stop.Recordings
                .OrderBy(r => r.CreatedAt)
                .Select(StopRecordingDto.From)
                .ToList()
        };
    }
}