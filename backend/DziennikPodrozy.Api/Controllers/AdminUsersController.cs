using System.Security.Claims;
using DziennikPodrozy.Api.Data;
using DziennikPodrozy.Api.DTOs;
using DziennikPodrozy.Api.Models;
using DziennikPodrozy.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DziennikPodrozy.Api.Controllers;

[ApiController]
[Route("api/admin/users")]
[Authorize(Roles = "Admin")]
public class AdminUsersController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly FileStorageService _fileStorage;
    private readonly int _deletionWaitDays;

    public AdminUsersController(
        AppDbContext context,
        UserManager<ApplicationUser> userManager,
        FileStorageService fileStorage,
        IConfiguration configuration)
    {
        _context = context;
        _userManager = userManager;
        _fileStorage = fileStorage;
        _deletionWaitDays = configuration.GetValue("Admin:DeletionWaitDays", 7);
    }

    [HttpGet]
    public async Task<IActionResult> GetUsers()
    {
        var users = await _context.Users
            .AsNoTracking()
            .OrderBy(u => u.CreatedAt)
            .ToListAsync();

        var adminIds = (await _userManager.GetUsersInRoleAsync("Admin"))
            .Select(u => u.Id)
            .ToHashSet();

        var tripCounts = await _context.Trips
            .GroupBy(t => t.OwnerId)
            .Select(g => new { OwnerId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.OwnerId, x => x.Count);

        var stopCounts = await _context.TripStops
            .GroupBy(s => s.Trip!.OwnerId)
            .Select(g => new { OwnerId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.OwnerId, x => x.Count);

        var now = DateTimeOffset.UtcNow;

        var result = users.Select(user => new AdminUserDto
        {
            Id = user.Id,
            UserName = user.UserName!,
            Email = user.Email!,
            AvatarUrl = user.AvatarUrl,
            CreatedAt = user.CreatedAt,
            LastActiveAt = user.LastActiveAt,
            IsSuspended = user.LockoutEnd.HasValue && user.LockoutEnd > now,
            DeletionRequestedAt = user.DeletionRequestedAt,
            DeletionAllowedAt = user.DeletionRequestedAt?.AddDays(_deletionWaitDays),
            IsAdmin = adminIds.Contains(user.Id),
            TripCount = tripCounts.GetValueOrDefault(user.Id),
            StopCount = stopCounts.GetValueOrDefault(user.Id)
        });

        return Ok(result);
    }

    [HttpPost("{id}/suspend")]
    public async Task<IActionResult> Suspend(string id)
    {
        var (user, error) = await FindManageableUserAsync(id);

        if (user == null)
        {
            return error!;
        }

        await SuspendAsync(user);

        return NoContent();
    }

    [HttpPost("{id}/unsuspend")]
    public async Task<IActionResult> Unsuspend(string id)
    {
        var (user, error) = await FindManageableUserAsync(id);

        if (user == null)
        {
            return error!;
        }

        user.DeletionRequestedAt = null;
        await _userManager.SetLockoutEndDateAsync(user, null);

        return NoContent();
    }

    [HttpPost("{id}/request-deletion")]
    public async Task<IActionResult> RequestDeletion(string id)
    {
        var (user, error) = await FindManageableUserAsync(id);

        if (user == null)
        {
            return error!;
        }

        user.DeletionRequestedAt ??= DateTime.UtcNow;
        await SuspendAsync(user);

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUser(string id)
    {
        var (user, error) = await FindManageableUserAsync(id);

        if (user == null)
        {
            return error!;
        }

        if (user.DeletionRequestedAt == null
            || DateTime.UtcNow - user.DeletionRequestedAt.Value < TimeSpan.FromDays(_deletionWaitDays))
        {
            return BadRequest(new
            {
                message = $"Konto można usunąć dopiero po {_deletionWaitDays} dniach od zaplanowania usunięcia."
            });
        }

        var fileUrls = await CollectFileUrlsAsync(user);

        var result = await _userManager.DeleteAsync(user);

        if (!result.Succeeded)
        {
            return StatusCode(500, new { message = "Nie udało się usunąć konta." });
        }

        foreach (var url in fileUrls)
        {
            _fileStorage.Delete(url);
        }

        return NoContent();
    }

    private async Task SuspendAsync(ApplicationUser user)
    {
        await _userManager.SetLockoutEnabledAsync(user, true);
        await _userManager.SetLockoutEndDateAsync(user, DateTimeOffset.MaxValue);
    }

    private async Task<(ApplicationUser? User, IActionResult? Error)> FindManageableUserAsync(string id)
    {
        var user = await _userManager.FindByIdAsync(id);

        if (user == null)
        {
            return (null, NotFound());
        }

        if (user.Id == User.FindFirstValue(ClaimTypes.NameIdentifier))
        {
            return (null, BadRequest(new { message = "Nie możesz wykonać tej operacji na własnym koncie." }));
        }

        if (await _userManager.IsInRoleAsync(user, "Admin"))
        {
            return (null, BadRequest(new { message = "Nie można zawiesić ani usunąć administratora." }));
        }

        return (user, null);
    }

    private async Task<List<string?>> CollectFileUrlsAsync(ApplicationUser user)
    {
        var urls = new List<string?> { user.AvatarUrl };

        urls.AddRange(await _context.Trips
            .Where(t => t.OwnerId == user.Id)
            .Select(t => t.CoverPhotoUrl)
            .ToListAsync());

        urls.AddRange(await _context.StopPhotos
            .Where(p => p.TripStop!.Trip!.OwnerId == user.Id)
            .Select(p => (string?)p.Url)
            .ToListAsync());

        urls.AddRange(await _context.StopRecordings
            .Where(r => r.TripStop!.Trip!.OwnerId == user.Id)
            .Select(r => (string?)r.Url)
            .ToListAsync());

        return urls;
    }
}