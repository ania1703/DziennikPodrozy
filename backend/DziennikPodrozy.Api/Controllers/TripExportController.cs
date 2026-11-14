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
    private readonly FileStorageService _fileStorage;

    public TripExportController(AppDbContext context, FileStorageService fileStorage)
    {
        _context = context;
        _fileStorage = fileStorage;
    }

    private string OwnerId => User.FindFirstValue(ClaimTypes.NameIdentifier)!;

    [HttpGet]
    public async Task<IActionResult> Export(int tripId, [FromQuery] string format = "json")
    {
        if (format != "json" && format != "txt" && format != "zip")
        {
            return BadRequest(new { message = "Nieobsługiwany format. Dozwolone: json, txt, zip." });
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

        var result = TripExportBuilder.Build(trip, stops, dayNotes, withFiles: format == "zip");
        var fileName = TripExportBuilder.BuildFileName(trip, format);

        return format switch
        {
            "txt" => File(TripExportBuilder.ToTextBytes(result.Export), "text/plain; charset=utf-8", fileName),
            "zip" => File(
                await TripExportBuilder.ToZipBytesAsync(result, _fileStorage),
                "application/zip",
                fileName),
            _ => File(TripExportBuilder.ToJsonBytes(result.Export), "application/json", fileName)
        };
    }
}