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
            Status = trip.Status.ToString()
        };
    }
}