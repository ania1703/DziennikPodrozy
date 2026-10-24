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
[Route("api/trips/{tripId}/stops/{stopId}/photos")]
[Authorize]
public class StopPhotosController : ControllerBase
{
    private const int MaxPhotosPerStop = 20;
    private const long MaxPhotoSizeBytes = 8 * 1024 * 1024;

    private readonly AppDbContext _context;
    private readonly FileStorageService _fileStorage;

    public StopPhotosController(AppDbContext context, FileStorageService fileStorage)
    {
        _context = context;
        _fileStorage = fileStorage;
    }

    private string OwnerId => User.FindFirstValue(ClaimTypes.NameIdentifier)!;

    [HttpPost]
    public async Task<IActionResult> UploadPhotos(int tripId, int stopId, List<IFormFile> files)
    {
        var stop = await _context.TripStops
            .Include(s => s.Photos)
            .FirstOrDefaultAsync(s =>
                s.Id == stopId && s.TripId == tripId && s.Trip!.OwnerId == OwnerId);

        if (stop == null)
        {
            return NotFound();
        }

        if (files.Count == 0)
        {
            return BadRequest(new { message = "Nie przesłano plików." });
        }

        if (stop.Photos.Count + files.Count > MaxPhotosPerStop)
        {
            return BadRequest(new
            {
                message = $"Przystanek może mieć maksymalnie {MaxPhotosPerStop} zdjęć."
            });
        }

        var savedUrls = new List<string>();

        foreach (var file in files)
        {
            var saved = await _fileStorage.SaveImageAsync(file, "stop-photos", MaxPhotoSizeBytes);

            if (saved.Error != null)
            {
                foreach (var url in savedUrls)
                {
                    _fileStorage.Delete(url);
                }

                return BadRequest(new { message = saved.Error });
            }

            savedUrls.Add(saved.Url!);
        }

        var nextOrder = stop.Photos.Count == 0 ? 1 : stop.Photos.Max(p => p.SortOrder) + 1;

        var photos = savedUrls
            .Select((url, index) => new StopPhoto
            {
                TripStopId = stopId,
                Url = url,
                SortOrder = nextOrder + index
            })
            .ToList();

        _context.StopPhotos.AddRange(photos);
        await _context.SaveChangesAsync();

        return Ok(photos.Select(StopPhotoDto.From));
    }

    [HttpDelete("{photoId}")]
    public async Task<IActionResult> DeletePhoto(int tripId, int stopId, int photoId)
    {
        var photo = await _context.StopPhotos
            .FirstOrDefaultAsync(p =>
                p.Id == photoId
                && p.TripStopId == stopId
                && p.TripStop!.TripId == tripId
                && p.TripStop.Trip!.OwnerId == OwnerId);

        if (photo == null)
        {
            return NotFound();
        }

        _context.StopPhotos.Remove(photo);
        await _context.SaveChangesAsync();

        _fileStorage.Delete(photo.Url);

        return NoContent();
    }
}