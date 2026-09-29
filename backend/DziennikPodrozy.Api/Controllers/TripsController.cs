using System.Security.Claims;
using DziennikPodrozy.Api.Data;
using DziennikPodrozy.Api.DTOs;
using DziennikPodrozy.Api.Models;
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

    public TripsController(AppDbContext context)
    {
        _context = context;
    }

    private string OwnerId => User.FindFirstValue(ClaimTypes.NameIdentifier)!;

    [HttpGet]
    public async Task<IActionResult> GetTrips()
    {
        var trips = await _context.Trips
            .Where(t => t.OwnerId == OwnerId)
            .ToListAsync();

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
        var trip = new Trip
        {
            Title = dto.Title,
            Description = dto.Description,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            OwnerId = OwnerId
        };

        _context.Trips.Add(trip);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetTrip), new { id = trip.Id }, ToDto(trip));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateTrip(int id, UpdateTripDto dto)
    {
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

        if (!Enum.TryParse<TripStatus>(dto.Status, out var newStatus))
        {
            return BadRequest(new { message = "Nieprawidłowy status. Dozwolone wartości: InProgress, Finished." });
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

        if (file == null || file.Length == 0)
        {
            return BadRequest(new { message = "Nie przesłano pliku." });
        }

        var allowedTypes = new[] { "image/jpeg", "image/png" };

        if (!allowedTypes.Contains(file.ContentType))
        {
            return BadRequest(new { message = "Dozwolone są tylko pliki JPG i PNG." });
        }

        const long maxSizeBytes = 2 * 1024 * 1024; // 2 MB

        if (file.Length > maxSizeBytes)
        {
            return BadRequest(new { message = "Plik jest za duży (maks. 2 MB)." });
        }

        var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "trip-covers");
        Directory.CreateDirectory(uploadsFolder);

        var extension = Path.GetExtension(file.FileName);
        var fileName = $"{Guid.NewGuid()}{extension}";
        var filePath = Path.Combine(uploadsFolder, fileName);

        await using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        if (!string.IsNullOrEmpty(trip.CoverPhotoUrl))
        {
            var oldFilePath = Path.Combine(uploadsFolder, Path.GetFileName(trip.CoverPhotoUrl));

            if (System.IO.File.Exists(oldFilePath))
            {
                System.IO.File.Delete(oldFilePath);
            }
        }

        trip.CoverPhotoUrl = $"/trip-covers/{fileName}";
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

        _context.Trips.Remove(trip);
        await _context.SaveChangesAsync();

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