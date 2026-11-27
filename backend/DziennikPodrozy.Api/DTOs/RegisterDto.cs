using System.ComponentModel.DataAnnotations;

namespace DziennikPodrozy.Api.DTOs;

public class RegisterDto
{
    [Required(ErrorMessage = "Podaj login.")]
    [MinLength(3, ErrorMessage = "Login musi mieć co najmniej 3 znaki.")]
    public string UserName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Podaj adres e-mail.")]
    [EmailAddress(ErrorMessage = "Adres e-mail jest nieprawidłowy.")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "Podaj hasło.")]
    public string Password { get; set; } = string.Empty;
}