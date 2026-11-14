using System.Security.Claims;
using DziennikPodrozy.Api.Data;
using DziennikPodrozy.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DziennikPodrozy.Api.Controllers;

[ApiController]
[Route("api/trips/{tripId}/export")]
[Authorize]
public class TripExportController : ControllerBase
{
    private readonly AppDbContext _context;

    public TripExportController(AppDbContext context)
    {
        _context = context;
    }

    private string OwnerId => User.FindFirstValue(ClaimTypes.NameIdentifier)!;

    [HttpGet]
    public async Task<IActionResult> Export(int tripId, [FromQuery] string format = "json")
    {
        if (format != "json" && format != "txt")
        {
            return BadRequest(new { message = "Nieobsługiwany format. Dozwolone: json, txt." });
        }

        var trip = await _context.Trips
            .FirstOrDefaultAsync(t => t.Id == tripId && t.OwnerId == OwnerId);

        if (trip == null)
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

        var dayNotes = await _context.DayNotes
            .Where(n => n.TripId == tripId)
            .ToDictionaryAsync(n => n.Date, n => n.Text);

        var baseUrl = $"{Request.Scheme}://{Request.Host}";
        var export = TripExportBuilder.Build(trip, stops, dayNotes, baseUrl);
        var fileName = TripExportBuilder.BuildFileName(trip, format);

        return format == "txt"
            ? File(TripExportBuilder.ToTextBytes(export), "text/plain; charset=utf-8", fileName)
            : File(TripExportBuilder.ToJsonBytes(export), "application/json", fileName);
    }
}