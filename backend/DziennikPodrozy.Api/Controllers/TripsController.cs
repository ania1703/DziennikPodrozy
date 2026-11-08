using System.Security.Claims;
using DziennikPodrozy.Api.Data;
using DziennikPodrozy.Api.DTOs;
using DziennikPodrozy.Api.Models;
using DziennikPodrozy.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DziennikPodrozy.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TripsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly FileStorageService _fileStorage;

    public TripsController(AppDbContext context, FileStorageService fileStorage)
    {
        _context = context;
        _fileStorage = fileStorage;
    }

    private string OwnerId => User.FindFirstValue(ClaimTypes.NameIdentifier)!;

    private async Task FinishExpiredTripsAsync()
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        var expired = await _context.Trips
            .Where(t => t.OwnerId == OwnerId
                && t.Status == TripStatus.InProgress
                && t.EndDate != null
                && t.EndDate < today)
            .ToListAsync();

        foreach (var trip in expired)
        {
            trip.Status = TripStatus.Finished;
        }

        if (expired.Count > 0)
        {
            await _context.SaveChangesAsync();
        }
    }

    [HttpGet]
    public async Task<IActionResult> GetTrips(
        [FromQuery] int? year,
        [FromQuery] string? status,
        [FromQuery] string sort = "newest")
    {
        await FinishExpiredTripsAsync();

        var query = _context.Trips.Where(t => t.OwnerId == OwnerId);

        if (year.HasValue)
        {
            query = query.Where(t => t.StartDate.Year == year.Value);
        }

        if (!string.IsNullOrEmpty(status) && Enum.TryParse<TripStatus>(status, out var statusFilter))
        {
            query = query.Where(t => t.Status == statusFilter);
        }

        query = sort == "oldest"
            ? query.OrderBy(t => t.StartDate)
            : query.OrderByDescending(t => t.StartDate);

        var trips = await query.ToListAsync();
        var counts = await GetCountsAsync(trips.Select(t => t.Id).ToList());

        return Ok(trips.Select(t => ToDto(t, counts[t.Id])));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetTrip(int id)
    {
        await FinishExpiredTripsAsync();

        var trip = await _context.Trips
            .FirstOrDefaultAsync(t => t.Id == id && t.OwnerId == OwnerId);

        if (trip == null)
        {
            return NotFound();
        }

        return Ok(await ToDtoAsync(trip));
    }

    [HttpPost]
    public async Task<IActionResult> CreateTrip(CreateTripDto dto)
    {
        if (dto.EndDate.HasValue && dto.EndDate.Value < dto.StartDate)
        {
            return BadRequest(new { message = "Data zakończenia nie może być wcześniejsza niż data rozpoczęcia." });
        }

        var status = TripStatus.Planned;

        if (!string.IsNullOrEmpty(dto.Status))
        {
            if (!Enum.TryParse<TripStatus>(dto.Status, out status) || !Enum.IsDefined(status))
            {
                return BadRequest(new { message = "Nieprawidłowy status. Dozwolone wartości: Planned, InProgress, Finished." });
            }
        }

        var trip = new Trip
        {
            Title = dto.Title,
            Description = dto.Description,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            Status = status,
            OwnerId = OwnerId
        };

        _context.Trips.Add(trip);
        await _context.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetTrip),
            new { id = trip.Id },
            ToDto(trip, new TripCounts(0, 0, 0)));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateTrip(int id, UpdateTripDto dto)
    {
        if (dto.EndDate.HasValue && dto.EndDate.Value < dto.StartDate)
        {
            return BadRequest(new { message = "Data zakończenia nie może być wcześniejsza niż data rozpoczęcia." });
        }

        var trip = await _context.Trips
            .FirstOrDefaultAsync(t => t.Id == id && t.OwnerId == OwnerId);

        if (trip == null)
        {
            return NotFound();
        }

        trip.Title = dto.Title;
        trip.Description = dto.Description;
        trip.StartDate = dto.StartDate;
        trip.EndDate = dto.EndDate;

        await _context.SaveChangesAsync();

        return Ok(await ToDtoAsync(trip));
    }

    [HttpPatch("{id}/status")]
    public async Task<IActionResult> ChangeTripStatus(int id, ChangeTripStatusDto dto)
    {
        var trip = await _context.Trips
            .FirstOrDefaultAsync(t => t.Id == id && t.OwnerId == OwnerId);

        if (trip == null)
        {
            return NotFound();
        }

        if (!Enum.TryParse<TripStatus>(dto.Status, out var newStatus) || !Enum.IsDefined(newStatus))
        {
            return BadRequest(new { message = "Nieprawidłowy status. Dozwolone wartości: Planned, InProgress, Finished." });
        }

        trip.Status = newStatus;
        if (newStatus != TripStatus.Finished)
        {
            trip.IsDescribed = false;
        }
        await _context.SaveChangesAsync();

        return Ok(await ToDtoAsync(trip));
    }

    [HttpPost("{id}/cover-photo")]
    public async Task<IActionResult> UploadCoverPhoto(int id, IFormFile file)
    {
        var trip = await _context.Trips
            .FirstOrDefaultAsync(t => t.Id == id && t.OwnerId == OwnerId);

        if (trip == null)
        {
            return NotFound();
        }

        var saved = await _fileStorage.SaveImageAsync(file, "trip-covers", 2 * 1024 * 1024);

        if (saved.Error != null)
        {
            return BadRequest(new { message = saved.Error });
        }

        _fileStorage.Delete(trip.CoverPhotoUrl);

        trip.CoverPhotoUrl = saved.Url;
        await _context.SaveChangesAsync();

        return Ok(await ToDtoAsync(trip));
    }

    [HttpPut("{id}/next-time-note")]
    public async Task<IActionResult> SaveNextTimeNote(int id, SaveNextTimeNoteDto dto)
    {
        var trip = await _context.Trips
            .FirstOrDefaultAsync(t => t.Id == id && t.OwnerId == OwnerId);

        if (trip == null)
        {
            return NotFound();
        }

        var text = dto.Text?.Trim();
        trip.NextTimeNote = string.IsNullOrEmpty(text) ? null : text;

        await _context.SaveChangesAsync();

        return Ok(await ToDtoAsync(trip));
    }

    [HttpPut("{id}/described")]
    public async Task<IActionResult> SetDescribed(int id, SetDescribedDto dto)
    {
        var trip = await _context.Trips
            .FirstOrDefaultAsync(t => t.Id == id && t.OwnerId == OwnerId);

        if (trip == null)
        {
            return NotFound();
        }

        if (dto.Described && trip.Status != TripStatus.Finished)
        {
            return BadRequest(new { message = "Tylko zakończoną podróż można oznaczyć jako opisaną." });
        }

        trip.IsDescribed = dto.Described;
        await _context.SaveChangesAsync();

        return Ok(await ToDtoAsync(trip));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTrip(int id)
    {
        var trip = await _context.Trips
            .FirstOrDefaultAsync(t => t.Id == id && t.OwnerId == OwnerId);

        if (trip == null)
        {
            return NotFound();
        }

        var photoUrls = await _context.StopPhotos
            .Where(p => p.TripStop!.TripId == id)
            .Select(p => p.Url)
            .ToListAsync();

        var recordingUrls = await _context.StopRecordings
            .Where(r => r.TripStop!.TripId == id)
            .Select(r => r.Url)
            .ToListAsync();

        _context.Trips.Remove(trip);
        await _context.SaveChangesAsync();

        _fileStorage.Delete(trip.CoverPhotoUrl);

        foreach (var url in photoUrls)
        {
            _fileStorage.Delete(url);
        }

        foreach (var url in recordingUrls)
        {
            _fileStorage.Delete(url);
        }

        return NoContent();
    }

    private record TripCounts(int Stops, int Photos, int Recordings);

    private async Task<Dictionary<int, TripCounts>> GetCountsAsync(List<int> tripIds)
    {
        var stops = await _context.TripStops
            .Where(s => tripIds.Contains(s.TripId))
            .GroupBy(s => s.TripId)
            .Select(g => new { TripId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.TripId, x => x.Count);

        var photos = await _context.StopPhotos
            .Where(p => tripIds.Contains(p.TripStop!.TripId))
            .GroupBy(p => p.TripStop!.TripId)
            .Select(g => new { TripId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.TripId, x => x.Count);

        var recordings = await _context.StopRecordings
            .Where(r => tripIds.Contains(r.TripStop!.TripId))
            .GroupBy(r => r.TripStop!.TripId)
            .Select(g => new { TripId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.TripId, x => x.Count);

        return tripIds.ToDictionary(
            id => id,
            id => new TripCounts(
                stops.GetValueOrDefault(id),
                photos.GetValueOrDefault(id),
                recordings.GetValueOrDefault(id)));
    }

    private async Task<TripDto> ToDtoAsync(Trip trip)
    {
        var counts = await GetCountsAsync(new List<int> { trip.Id });

        return ToDto(trip, counts[trip.Id]);
    }

    private static TripDto ToDto(Trip trip, TripCounts counts)
    {
        return new TripDto
        {
            Id = trip.Id,
            Title = trip.Title,
            Description = trip.Description,
            StartDate = trip.StartDate,
            EndDate = trip.EndDate,
            Status = trip.Status.ToString(),
            CoverPhotoUrl = trip.CoverPhotoUrl,
            NextTimeNote = trip.NextTimeNote,
            IsDescribed = trip.IsDescribed,
            DayCount = trip.EndDate.HasValue
                ? trip.EndDate.Value.DayNumber - trip.StartDate.DayNumber + 1
                : null,
            StopCount = counts.Stops,
            PhotoCount = counts.Photos,
            RecordingCount = counts.Recordings
        };
    }
}