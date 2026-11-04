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
[Route("api/wishlist")]
[Authorize]
public class WishlistController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly GeocodingService _geocoding;

    public WishlistController(AppDbContext context, GeocodingService geocoding)
    {
        _context = context;
        _geocoding = geocoding;
    }

    private string OwnerId => User.FindFirstValue(ClaimTypes.NameIdentifier)!;

    [HttpGet]
    public async Task<IActionResult> GetItems()
    {
        var items = await _context.WishlistItems
            .Where(i => i.OwnerId == OwnerId)
            .OrderByDescending(i => i.AddedOn)
            .ThenByDescending(i => i.Id)
            .ToListAsync();

        return Ok(items.Select(ToDto));
    }

    [HttpPost]
    public async Task<IActionResult> CreateItem(CreateWishlistItemDto dto)
    {
        var item = new WishlistItem
        {
            Title = dto.Title,
            Latitude = dto.Latitude,
            Longitude = dto.Longitude,
            CountryCode = await _geocoding.GetCountryCodeAsync(dto.Latitude, dto.Longitude),
            Note = dto.Note,
            AddedOn = DateOnly.FromDateTime(DateTime.UtcNow),
            OwnerId = OwnerId
        };

        _context.WishlistItems.Add(item);
        await _context.SaveChangesAsync();

        return Created($"/api/wishlist/{item.Id}", ToDto(item));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateItem(int id, UpdateWishlistItemDto dto)
    {
        var item = await _context.WishlistItems
            .FirstOrDefaultAsync(i => i.Id == id && i.OwnerId == OwnerId);

        if (item == null)
        {
            return NotFound();
        }

        item.Title = dto.Title;
        item.Note = dto.Note;

        await _context.SaveChangesAsync();

        return Ok(ToDto(item));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteItem(int id)
    {
        var item = await _context.WishlistItems
            .FirstOrDefaultAsync(i => i.Id == id && i.OwnerId == OwnerId);

        if (item == null)
        {
            return NotFound();
        }

        _context.WishlistItems.Remove(item);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private static WishlistItemDto ToDto(WishlistItem item)
    {
        return new WishlistItemDto
        {
            Id = item.Id,
            Title = item.Title,
            Latitude = item.Latitude,
            Longitude = item.Longitude,
            CountryCode = item.CountryCode,
            Note = item.Note,
            AddedOn = item.AddedOn
        };
    }
}