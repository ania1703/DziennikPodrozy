using System.Security.Claims;
using DziennikPodrozy.Api.DTOs;
using DziennikPodrozy.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using DziennikPodrozy.Api.Services;

namespace DziennikPodrozy.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProfileController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly FileStorageService _fileStorage;

    public ProfileController(UserManager<ApplicationUser> userManager, FileStorageService fileStorage)
    {
        _userManager = userManager;
        _fileStorage = fileStorage;
    }

    [HttpGet]
    public async Task<IActionResult> GetProfile()
    {
        var user = await _userManager.GetUserAsync(User);

        if (user == null)
        {
            return Unauthorized();
        }

        return Ok(ToDto(user));
    }

    [HttpPut]
    public async Task<IActionResult> UpdateProfile(UpdateProfileDto dto)
    {
        var user = await _userManager.GetUserAsync(User);

        if (user == null)
        {
            return Unauthorized();
        }

        if (dto.HomeLatitude.HasValue != dto.HomeLongitude.HasValue)
        {
            return BadRequest(new { message = "Współrzędne miasta domowego muszą być podane razem." });
        }

        user.Bio = dto.Bio;
        user.HomeCity = dto.HomeCity;
        user.HomeLatitude = dto.HomeLatitude;
        user.HomeLongitude = dto.HomeLongitude;

        await _userManager.UpdateAsync(user);

        return Ok(ToDto(user));
    }

    [HttpPost("avatar")]
    public async Task<IActionResult> UploadAvatar(IFormFile file)
    {
        var user = await _userManager.GetUserAsync(User);

        if (user == null)
        {
            return Unauthorized();
        }

        var saved = await _fileStorage.SaveImageAsync(file, "avatars", 2 * 1024 * 1024);

        if (saved.Error != null)
        {
            return BadRequest(new { message = saved.Error });
        }

        _fileStorage.Delete(user.AvatarUrl);

        user.AvatarUrl = saved.Url;
        await _userManager.UpdateAsync(user);

        return Ok(ToDto(user));
    }

    private static ProfileDto ToDto(ApplicationUser user)
    {
        return new ProfileDto
        {
            UserName = user.UserName!,
            Email = user.Email!,
            AvatarUrl = user.AvatarUrl,
            Bio = user.Bio,
            HomeCity = user.HomeCity,
            HomeLatitude = user.HomeLatitude,
            HomeLongitude = user.HomeLongitude
        };
    }
}