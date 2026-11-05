using System.Security.Claims;
using DziennikPodrozy.Api.Data;
using DziennikPodrozy.Api.DTOs;
using DziennikPodrozy.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DziennikPodrozy.Api.Controllers;

[ApiController]
[Route("api/trips/{tripId}/day-notes")]
[Authorize]
public class DayNotesController : ControllerBase
{
    private readonly AppDbContext _context;

    public DayNotesController(AppDbContext context)
    {
        _context = context;
    }

    private string OwnerId => User.FindFirstValue(ClaimTypes.NameIdentifier)!;

    [HttpGet]
    public async Task<IActionResult> GetNotes(int tripId)
    {
        var tripExists = await _context.Trips
            .AnyAsync(t => t.Id == tripId && t.OwnerId == OwnerId);

        if (!tripExists)
        {
            return NotFound();
        }

        var notes = await _context.DayNotes
            .Where(n => n.TripId == tripId)
            .OrderBy(n => n.Date)
            .ToListAsync();

        return Ok(notes.Select(ToDto));
    }

    [HttpPut("{date}")]
    public async Task<IActionResult> SaveNote(int tripId, DateOnly date, SaveDayNoteDto dto)
    {
        var trip = await _context.Trips
            .FirstOrDefaultAsync(t => t.Id == tripId && t.OwnerId == OwnerId);

        if (trip == null)
        {
            return NotFound();
        }

        if (date < trip.StartDate || (trip.EndDate.HasValue && date > trip.EndDate.Value))
        {
            return BadRequest(new { message = "Data musi mieścić się w datach podróży." });
        }

        var note = await _context.DayNotes
            .FirstOrDefaultAsync(n => n.TripId == tripId && n.Date == date);

        var text = dto.Text?.Trim();

        if (string.IsNullOrEmpty(text))
        {
            if (note != null)
            {
                _context.DayNotes.Remove(note);
                await _context.SaveChangesAsync();
            }

            return NoContent();
        }

        if (note == null)
        {
            note = new DayNote { TripId = tripId, Date = date };
            _context.DayNotes.Add(note);
        }

        note.Text = text;
        await _context.SaveChangesAsync();

        return Ok(ToDto(note));
    }

    private static DayNoteDto ToDto(DayNote note)
    {
        return new DayNoteDto
        {
            Date = note.Date,
            Text = note.Text
        };
    }
}