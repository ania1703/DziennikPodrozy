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
[Route("api/trips/{tripId}/stops/{stopId}/recordings")]
[Authorize]
public class StopRecordingsController : ControllerBase
{
    private const int MaxRecordingsPerStop = 10;
    private const int MaxDurationSeconds = 300;
    private const long MaxRecordingSizeBytes = 10 * 1024 * 1024;

    private readonly AppDbContext _context;
    private readonly FileStorageService _fileStorage;

    public StopRecordingsController(AppDbContext context, FileStorageService fileStorage)
    {
        _context = context;
        _fileStorage = fileStorage;
    }

    private string OwnerId => User.FindFirstValue(ClaimTypes.NameIdentifier)!;

    [HttpPost]
    public async Task<IActionResult> UploadRecording(
        int tripId,
        int stopId,
        IFormFile file,
        [FromForm] int durationSeconds)
    {
        var stop = await _context.TripStops
            .Include(s => s.Recordings)
            .FirstOrDefaultAsync(s =>
                s.Id == stopId && s.TripId == tripId && s.Trip!.OwnerId == OwnerId);

        if (stop == null)
        {
            return NotFound();
        }

        if (durationSeconds < 1 || durationSeconds > MaxDurationSeconds)
        {
            return BadRequest(new { message = "Nagranie może trwać od 1 sekundy do 5 minut." });
        }

        if (stop.Recordings.Count >= MaxRecordingsPerStop)
        {
            return BadRequest(new
            {
                message = $"Przystanek może mieć maksymalnie {MaxRecordingsPerStop} nagrań."
            });
        }

        var saved = await _fileStorage.SaveAudioAsync(file, "stop-recordings", MaxRecordingSizeBytes);

        if (saved.Error != null)
        {
            return BadRequest(new { message = saved.Error });
        }

        var recording = new StopRecording
        {
            TripStopId = stopId,
            Url = saved.Url!,
            DurationSeconds = durationSeconds,
            CreatedAt = DateTime.UtcNow
        };

        _context.StopRecordings.Add(recording);
        await _context.SaveChangesAsync();

        return Ok(StopRecordingDto.From(recording));
    }

    [HttpDelete("{recordingId}")]
    public async Task<IActionResult> DeleteRecording(int tripId, int stopId, int recordingId)
    {
        var recording = await _context.StopRecordings
            .FirstOrDefaultAsync(r =>
                r.Id == recordingId
                && r.TripStopId == stopId
                && r.TripStop!.TripId == tripId
                && r.TripStop.Trip!.OwnerId == OwnerId);

        if (recording == null)
        {
            return NotFound();
        }

        _context.StopRecordings.Remove(recording);
        await _context.SaveChangesAsync();

        _fileStorage.Delete(recording.Url);

        return NoContent();
    }
}