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
    private readonly TokenService _tokenService; // NOWE

    public AuthController(UserManager<ApplicationUser> userManager, TokenService tokenService)
    {
        _userManager = userManager;
        _tokenService = tokenService; // NOWE
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
            return BadRequest(result.Errors.Select(e => e.Description));
        }

        await _userManager.AddToRoleAsync(user, "User");

        return Ok(new { message = "Konto zostało utworzone." });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto dto)
    {
        var user = await _userManager.FindByEmailAsync(dto.Email);

        if (user == null || !await _userManager.CheckPasswordAsync(user, dto.Password))
        {
            return Unauthorized(new { message = "Nieprawidłowy e-mail lub hasło." });
        }

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