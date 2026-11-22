using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using DziennikPodrozy.Tests.Infrastructure;

namespace DziennikPodrozy.Tests.Api;

[Collection(ApiCollection.Name)]
public class AuthApiTests
{
    private readonly ApiFactory _factory;

    public AuthApiTests(ApiFactory factory)
    {
        _factory = factory;
    }

    private static string NewName() => "u" + Guid.NewGuid().ToString("N")[..10];

    private Task<HttpResponseMessage> RegisterAsync(string userName, string email, string password)
    {
        return _factory.CreateClient().PostAsJsonAsync("/api/auth/register", new { userName, email, password });
    }

    [Fact]
    public async Task Register_ValidData_CreatesAccount()
    {
        var name = NewName();

        var response = await RegisterAsync(name, $"{name}@test.local", "Test12345");

        await response.ShouldBeAsync(HttpStatusCode.OK);
        Assert.Equal("Konto zostało utworzone.", (await response.ReadJsonAsync()).GetProperty("message").GetString());
    }

    [Fact]
    public async Task Register_PasswordWithoutUpperCaseAndDigit_ReturnsPolishReasons()
    {
        var name = NewName();

        var response = await RegisterAsync(name, $"{name}@test.local", "abcdefghi");

        await response.ShouldBeAsync(HttpStatusCode.BadRequest);

        var message = (await response.ReadJsonAsync()).GetProperty("message").GetString()!;

        Assert.Contains("Hasło musi zawierać cyfrę.", message);
        Assert.Contains("Hasło musi zawierać wielką literę.", message);
    }

    [Fact]
    public async Task Register_TooShortPassword_ReturnsLengthMessage()
    {
        var name = NewName();

        var response = await RegisterAsync(name, $"{name}@test.local", "Ab1");

        await response.ShouldBeAsync(HttpStatusCode.BadRequest);
        Assert.Contains(
            "co najmniej 8 znaków",
            (await response.ReadJsonAsync()).GetProperty("message").GetString());
    }

    [Fact]
    public async Task Register_DuplicateEmail_IsRejected()
    {
        var name = NewName();
        await (await RegisterAsync(name, $"{name}@test.local", "Test12345")).ShouldBeAsync(HttpStatusCode.OK);

        var response = await RegisterAsync(NewName(), $"{name}@test.local", "Test12345");

        await response.ShouldBeAsync(HttpStatusCode.BadRequest);
        Assert.Contains(
            "adresem e-mail już istnieje",
            (await response.ReadJsonAsync()).GetProperty("message").GetString());
    }

    [Fact]
    public async Task Register_DuplicateUserName_IsRejected()
    {
        var name = NewName();
        await (await RegisterAsync(name, $"{name}@test.local", "Test12345")).ShouldBeAsync(HttpStatusCode.OK);

        var response = await RegisterAsync(name, $"inny-{name}@test.local", "Test12345");

        await response.ShouldBeAsync(HttpStatusCode.BadRequest);
        Assert.Contains(
            "login jest już zajęty",
            (await response.ReadJsonAsync()).GetProperty("message").GetString());
    }

    [Fact]
    public async Task Register_InvalidEmail_IsRejected()
    {
        var response = await RegisterAsync(NewName(), "to-nie-jest-email", "Test12345");

        await response.ShouldBeAsync(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Register_TooShortUserName_IsRejected()
    {
        var response = await RegisterAsync("ab", "ab@test.local", "Test12345");

        await response.ShouldBeAsync(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Login_CorrectCredentials_ReturnsTokenAndUserRole()
    {
        var user = await _factory.CreateUserAsync();

        var response = await _factory.CreateClient()
            .PostAsJsonAsync("/api/auth/login", new { user.Email, user.Password });

        await response.ShouldBeAsync(HttpStatusCode.OK);

        var body = await response.ReadJsonAsync();

        Assert.False(string.IsNullOrWhiteSpace(body.GetProperty("token").GetString()));
        Assert.Equal(user.UserName, body.GetProperty("userName").GetString());
        Assert.Contains("User", body.GetProperty("roles").EnumerateArray().Select(r => r.GetString()));
        Assert.DoesNotContain("Admin", body.GetProperty("roles").EnumerateArray().Select(r => r.GetString()));
    }

    [Fact]
    public async Task Login_SeededAdministrator_HasAdminRole()
    {
        var response = await _factory.CreateClient().PostAsJsonAsync(
            "/api/auth/login",
            new { email = ApiFactory.AdminEmail, password = ApiFactory.AdminPassword });

        await response.ShouldBeAsync(HttpStatusCode.OK);

        var roles = (await response.ReadJsonAsync()).GetProperty("roles").EnumerateArray().Select(r => r.GetString());

        Assert.Contains("Admin", roles);
    }

    [Fact]
    public async Task Login_WrongPassword_ReturnsHintAndAdminContact()
    {
        var user = await _factory.CreateUserAsync();

        var response = await _factory.CreateClient()
            .PostAsJsonAsync("/api/auth/login", new { user.Email, password = "ZleHaslo123" });

        await response.ShouldBeAsync(HttpStatusCode.Unauthorized);

        var body = await response.ReadJsonAsync();

        Assert.Equal("Nieprawidłowy e-mail lub hasło.", body.GetProperty("message").GetString());
        Assert.Contains("skontaktuj się z administratorem", body.GetProperty("hint").GetString());
        Assert.Equal(ApiFactory.ContactEmail, body.GetProperty("contactEmail").GetString());
    }

    [Fact]
    public async Task Login_UnknownEmail_GivesTheSameAnswerAsWrongPassword()
    {
        var response = await _factory.CreateClient()
            .PostAsJsonAsync("/api/auth/login", new { email = "nikt@test.local", password = "Test12345" });

        await response.ShouldBeAsync(HttpStatusCode.Unauthorized);
        Assert.Equal(
            "Nieprawidłowy e-mail lub hasło.",
            (await response.ReadJsonAsync()).GetProperty("message").GetString());
    }

    [Fact]
    public async Task ProtectedEndpoint_WithoutToken_IsUnauthorized()
    {
        var response = await _factory.CreateClient().GetAsync("/api/trips");

        await response.ShouldBeAsync(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task ProtectedEndpoint_WithGarbageToken_IsUnauthorized()
    {
        var client = _factory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", "to.nie.jest.token");

        await (await client.GetAsync("/api/trips")).ShouldBeAsync(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task AdminEndpoint_AsRegularUser_IsForbidden()
    {
        var user = await _factory.CreateUserAsync();

        await (await user.Client.GetAsync("/api/admin/ping")).ShouldBeAsync(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async Task AdminEndpoint_AsAdministrator_IsAllowed()
    {
        var admin = await _factory.CreateAdminClientAsync();

        await (await admin.GetAsync("/api/admin/ping")).ShouldBeAsync(HttpStatusCode.OK);
    }
}
