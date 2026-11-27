using DziennikPodrozy.Api.DTOs;
using DziennikPodrozy.Api.Models;
using DziennikPodrozy.Api.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace DziennikPodrozy.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly TokenService _tokenService;
    private readonly IConfiguration _configuration;

    public AuthController(
        UserManager<ApplicationUser> userManager,
        TokenService tokenService,
        IConfiguration configuration)
    {
        _userManager = userManager;
        _tokenService = tokenService;
        _configuration = configuration;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterDto dto)
    {
        var user = new ApplicationUser
        {
            UserName = dto.UserName,
            Email = dto.Email
        };

        var result = await _userManager.CreateAsync(user, dto.Password);

        if (!result.Succeeded)
        {
            var errors = result.Errors
                .GroupBy(error => FieldOf(error.Code))
                .ToDictionary(
                    group => group.Key,
                    group => group.Select(IdentityErrorTranslator.Describe).ToArray());

            var message = string.Join(" ", result.Errors.Select(IdentityErrorTranslator.Describe));

            return BadRequest(new { message, errors });
        }

        await _userManager.AddToRoleAsync(user, "User");

        return Ok(new { message = "Konto zostało utworzone." });
    }

    private static string FieldOf(string errorCode)
    {
        if (errorCode.Contains("Password"))
        {
            return "password";
        }

        return errorCode.Contains("Email") ? "email" : "userName";
    }

    private object LoginError(string message, string hint)
    {
        return new
        {
            message,
            hint,
            contactEmail = _configuration["Contact:AdminEmail"]
        };
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto dto)
    {
        var user = await _userManager.FindByEmailAsync(dto.Email);

        if (user == null || !await _userManager.CheckPasswordAsync(user, dto.Password))
        {
            return Unauthorized(LoginError(
                "Nieprawidłowy e-mail lub hasło.",
                "Jeśli nie pamiętasz hasła, skontaktuj się z administratorem."));
        }

        if (await _userManager.IsLockedOutAsync(user))
        {
            return StatusCode(403, LoginError(
                "Konto zostało zawieszone.",
                "Skontaktuj się z administratorem."));
        }

        user.LastActiveAt = DateTime.UtcNow;
        await _userManager.UpdateAsync(user);

        var roles = await _userManager.GetRolesAsync(user);
        var token = _tokenService.CreateToken(user, roles);

        return Ok(new
        {
            token,
            userName = user.UserName,
            email = user.Email,
            roles
        });
    }
}