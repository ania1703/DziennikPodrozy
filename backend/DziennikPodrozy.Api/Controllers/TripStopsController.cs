using System.Security.Claims;
using DziennikPodrozy.Api.Data;
using DziennikPodrozy.Api.DTOs;
using DziennikPodrozy.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DziennikPodrozy.Api.Controllers;

[ApiController]
[Route("api/trips/{tripId}/stops")]
[Authorize]
public class TripStopsController : ControllerBase
{
    private const string DateOutOfRangeMessage =
        "Data przystanku musi mieścić się w datach podróży.";

    private readonly AppDbContext _context;

    public TripStopsController(AppDbContext context)
    {
        _context = context;
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
            .Where(s => s.TripId == tripId)
            .OrderBy(s => s.Date)
            .ThenBy(s => s.SortOrder)
            .ToListAsync();

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
            Note = stop.Note
        };
    }
}