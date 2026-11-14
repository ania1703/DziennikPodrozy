using Microsoft.AspNetCore.Identity;

namespace DziennikPodrozy.Api.Services;

public static class IdentityErrorTranslator
{
    public static string Describe(IdentityError error)
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
            "PasswordMismatch" => "Obecne hasło jest nieprawidłowe.",
            _ => error.Description
        };
    }
}