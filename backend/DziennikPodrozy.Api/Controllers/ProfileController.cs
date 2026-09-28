using System.Security.Claims;
using DziennikPodrozy.Api.DTOs;
using DziennikPodrozy.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace DziennikPodrozy.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProfileController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;

    public ProfileController(UserManager<ApplicationUser> userManager)
    {
        _userManager = userManager;
    }

    [HttpGet]
    public async Task<IActionResult> GetProfile()
    {
        var user = await _userManager.GetUserAsync(User);

        if (user == null)
        {
            return Unauthorized();
        }

        var profile = new ProfileDto
        {
            UserName = user.UserName!,
            Email = user.Email!,
            AvatarUrl = user.AvatarUrl,
            Bio = user.Bio,
            HomeCity = user.HomeCity
        };

        return Ok(profile);
    }

    [HttpPut]
    public async Task<IActionResult> UpdateProfile(UpdateProfileDto dto)
    {
        var user = await _userManager.GetUserAsync(User);

        if (user == null)
        {
            return Unauthorized();
        }

        user.Bio = dto.Bio;
        user.HomeCity = dto.HomeCity;

        await _userManager.UpdateAsync(user);

        return Ok(new { message = "Profil zaktualizowany." });
    }

        [HttpPost("avatar")]
    public async Task<IActionResult> UploadAvatar(IFormFile file)
    {
        var user = await _userManager.GetUserAsync(User);

        if (user == null)
        {
            return Unauthorized();
        }

        if (file == null || file.Length == 0)
        {
            return BadRequest(new { message = "Nie przesłano pliku." });
        }

        var allowedTypes = new[] { "image/jpeg", "image/png" };

        if (!allowedTypes.Contains(file.ContentType))
        {
            return BadRequest(new { message = "Dozwolone są tylko pliki JPG i PNG." });
        }

        const long maxSizeBytes = 2 * 1024 * 1024; // 2 MB

        if (file.Length > maxSizeBytes)
        {
            return BadRequest(new { message = "Plik jest za duży (maks. 2 MB)." });
        }

        var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "avatars");
        Directory.CreateDirectory(uploadsFolder);

        var extension = Path.GetExtension(file.FileName);
        var fileName = $"{Guid.NewGuid()}{extension}";
        var filePath = Path.Combine(uploadsFolder, fileName);

        await using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        if (!string.IsNullOrEmpty(user.AvatarUrl))
        {
            var oldFilePath = Path.Combine(uploadsFolder, Path.GetFileName(user.AvatarUrl));

            if (System.IO.File.Exists(oldFilePath))
            {
                System.IO.File.Delete(oldFilePath);
            }
        }

        user.AvatarUrl = $"/avatars/{fileName}";
        await _userManager.UpdateAsync(user);

        return Ok(new { avatarUrl = user.AvatarUrl });
    }
}