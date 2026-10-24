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

    [HttpGet]
    public async Task<IActionResult> GetTrips(
        [FromQuery] int? year,
        [FromQuery] string? status,
        [FromQuery] string sort = "newest")
    {
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

        return Ok(trips.Select(ToDto));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetTrip(int id)
    {
        var trip = await _context.Trips
            .FirstOrDefaultAsync(t => t.Id == id && t.OwnerId == OwnerId);

        if (trip == null)
        {
            return NotFound();
        }

        return Ok(ToDto(trip));
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

        return CreatedAtAction(nameof(GetTrip), new { id = trip.Id }, ToDto(trip));
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

        return Ok(ToDto(trip));
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
        await _context.SaveChangesAsync();

        return Ok(ToDto(trip));
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

        return Ok(ToDto(trip));
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

        _context.Trips.Remove(trip);
        await _context.SaveChangesAsync();

        _fileStorage.Delete(trip.CoverPhotoUrl);

        foreach (var url in photoUrls)
        {
            _fileStorage.Delete(url);
        }

        return NoContent();
    }

    private static TripDto ToDto(Trip trip)
    {
        return new TripDto
        {
            Id = trip.Id,
            Title = trip.Title,
            Description = trip.Description,
            StartDate = trip.StartDate,
            EndDate = trip.EndDate,
            Status = trip.Status.ToString(),
            CoverPhotoUrl = trip.CoverPhotoUrl
        };
    }
}