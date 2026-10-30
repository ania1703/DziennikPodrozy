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
            var message = string.Join(" ", result.Errors.Select(DescribeIdentityError));

            return BadRequest(new { message });
        }

        await _userManager.AddToRoleAsync(user, "User");

        return Ok(new { message = "Konto zostało utworzone." });
    }

    private static string DescribeIdentityError(IdentityError error)
    {
        return error.Code switch
        {
            "DuplicateUserName" => "Ten login jest już zajęty.",
            "DuplicateEmail" => "Konto z tym adresem e-mail już istnieje.",
            "InvalidUserName" => "Login może zawierać tylko litery, cyfry oraz znaki - . _ @ +",
            "InvalidEmail" => "Adres e-mail jest nieprawidłowy.",
            "PasswordTooShort" => "Hasło musi mieć co najmniej 8 znaków.",
            "PasswordRequiresDigit" => "Hasło musi zawierać cyfrę.",
            "PasswordRequiresUpper" => "Hasło musi zawierać wielką literę.",
            _ => error.Description
        };
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