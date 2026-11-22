using DziennikPodrozy.Api.Services;
using Microsoft.AspNetCore.Identity;

namespace DziennikPodrozy.Tests.Unit;

public class IdentityErrorTranslatorTests
{
    [Theory]
    [InlineData("DuplicateUserName", "Ten login jest już zajęty.")]
    [InlineData("DuplicateEmail", "Konto z tym adresem e-mail już istnieje.")]
    [InlineData("InvalidEmail", "Adres e-mail jest nieprawidłowy.")]
    [InlineData("PasswordTooShort", "Hasło musi mieć co najmniej 8 znaków.")]
    [InlineData("PasswordRequiresDigit", "Hasło musi zawierać cyfrę.")]
    [InlineData("PasswordRequiresUpper", "Hasło musi zawierać wielką literę.")]
    [InlineData("PasswordMismatch", "Obecne hasło jest nieprawidłowe.")]
    public void Describe_KnownCode_ReturnsPolishMessage(string code, string expected)
    {
        var error = new IdentityError { Code = code, Description = "English description" };

        Assert.Equal(expected, IdentityErrorTranslator.Describe(error));
    }

    [Fact]
    public void Describe_InvalidUserName_ListsAllowedCharacters()
    {
        var error = new IdentityError { Code = "InvalidUserName", Description = "x" };

        Assert.Contains("litery, cyfry", IdentityErrorTranslator.Describe(error));
    }

    [Fact]
    public void Describe_UnknownCode_FallsBackToOriginalDescription()
    {
        var error = new IdentityError { Code = "SomethingNew", Description = "Original text" };

        Assert.Equal("Original text", IdentityErrorTranslator.Describe(error));
    }
}
