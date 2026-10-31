using System.Security.Claims;
using DziennikPodrozy.Api.Data;
using DziennikPodrozy.Api.DTOs;
using DziennikPodrozy.Api.Models;
using DziennikPodrozy.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DziennikPodrozy.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class StatsController : ControllerBase
{
    private const int MaxCountryLookups = 8;

    private readonly AppDbContext _context;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly GeocodingService _geocoding;

    public StatsController(
        AppDbContext context,
        UserManager<ApplicationUser> userManager,
        GeocodingService geocoding)
    {
        _context = context;
        _userManager = userManager;
        _geocoding = geocoding;
    }

    private string OwnerId => User.FindFirstValue(ClaimTypes.NameIdentifier)!;

    [HttpGet]
    public async Task<IActionResult> GetStats()
    {
        var user = await _userManager.GetUserAsync(User);

        if (user == null)
        {
            return Unauthorized();
        }

        var trips = await _context.Trips
            .Where(t => t.OwnerId == OwnerId && t.Status != TripStatus.Planned)
            .ToListAsync();

        var tripIds = trips.Select(t => t.Id).ToList();

        var stops = await _context.TripStops
            .Where(s => tripIds.Contains(s.TripId))
            .ToListAsync();

        await _geocoding.FillMissingCountriesAsync(stops, MaxCountryLookups);
        await _context.SaveChangesAsync();

        var photoCount = await _context.StopPhotos
            .CountAsync(p => tripIds.Contains(p.TripStop!.TripId));

        var recordingCount = await _context.StopRecordings
            .CountAsync(r => tripIds.Contains(r.TripStop!.TripId));

        var stats = new StatsDto
        {
            TripCount = trips.Count,
            DayCount = CountTravelDays(trips),
            StopCount = stops.Count,
            PhotoCount = photoCount,
            RecordingCount = recordingCount,
            DistanceKm = (int)Math.Round(CountDistanceKm(stops)),
            CountryCodes = stops
                .Where(s => s.CountryCode != null)
                .Select(s => s.CountryCode!)
                .Distinct()
                .OrderBy(code => code)
                .ToList(),
            HasHome = user.HomeLatitude.HasValue && user.HomeLongitude.HasValue,
            HomeCity = user.HomeCity,
            FarthestPoint = FindFarthestPoint(stops, user)
        };

        return Ok(stats);
    }

    private static int CountTravelDays(List<Trip> trips)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var days = new HashSet<DateOnly>();

        foreach (var trip in trips)
        {
            var last = trip.EndDate ?? today;

            if (last > today)
            {
                last = today;
            }

            for (var day = trip.StartDate; day <= last; day = day.AddDays(1))
            {
                days.Add(day);
            }
        }

        return days.Count;
    }

    private static double CountDistanceKm(List<TripStop> stops)
    {
        var total = 0.0;

        foreach (var tripStops in stops.GroupBy(s => s.TripId))
        {
            var ordered = tripStops
                .OrderBy(s => s.Date)
                .ThenBy(s => s.SortOrder)
                .ToList();

            for (var i = 1; i < ordered.Count; i++)
            {
                total += GeoMath.DistanceKm(
                    ordered[i - 1].Latitude,
                    ordered[i - 1].Longitude,
                    ordered[i].Latitude,
                    ordered[i].Longitude);
            }
        }

        return total;
    }

    private static FarthestPointDto? FindFarthestPoint(List<TripStop> stops, ApplicationUser user)
    {
        if (user.HomeLatitude is not double homeLatitude
            || user.HomeLongitude is not double homeLongitude
            || stops.Count == 0)
        {
            return null;
        }

        var farthest = stops
            .Select(stop => new
            {
                Stop = stop,
                Distance = GeoMath.DistanceKm(
                    homeLatitude,
                    homeLongitude,
                    stop.Latitude,
                    stop.Longitude)
            })
            .MaxBy(item => item.Distance)!;

        return new FarthestPointDto
        {
            Title = farthest.Stop.Title,
            TripId = farthest.Stop.TripId,
            CountryCode = farthest.Stop.CountryCode,
            DistanceKm = (int)Math.Round(farthest.Distance)
        };
    }
}