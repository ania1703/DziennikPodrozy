using System.Net;
using System.Net.Http.Json;
using DziennikPodrozy.Tests.Infrastructure;

namespace DziennikPodrozy.Tests.Api;

[Collection(ApiCollection.Name)]
public class ProfileApiTests
{
    private readonly ApiFactory _factory;

    public ProfileApiTests(ApiFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task GetProfile_ReturnsOwnAccountWithoutHomeCity()
    {
        var user = await _factory.CreateUserAsync();

        var response = await user.Client.GetAsync("/api/profile");

        await response.ShouldBeAsync(HttpStatusCode.OK);

        var profile = await response.ReadJsonAsync();

        Assert.Equal(user.UserName, profile.GetProperty("userName").GetString());
        Assert.Equal(user.Email, profile.GetProperty("email").GetString());
        Assert.Equal(System.Text.Json.JsonValueKind.Null, profile.GetProperty("homeLatitude").ValueKind);
    }

    [Fact]
    public async Task GetProfile_WithoutToken_IsUnauthorized()
    {
        await (await _factory.CreateClient().GetAsync("/api/profile")).ShouldBeAsync(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task UpdateProfile_SavesBioAndHomeLocation()
    {
        var user = await _factory.CreateUserAsync();

        var response = await user.Client.PutAsJsonAsync("/api/profile", new
        {
            bio = "Kocham góry",
            homeCity = "Białystok",
            homeLatitude = 53.1325,
            homeLongitude = 23.1688
        });

        await response.ShouldBeAsync(HttpStatusCode.OK);

        var saved = await (await user.Client.GetAsync("/api/profile")).ReadJsonAsync();

        Assert.Equal("Kocham góry", saved.GetProperty("bio").GetString());
        Assert.Equal("Białystok", saved.GetProperty("homeCity").GetString());
        Assert.Equal(53.1325, saved.GetProperty("homeLatitude").GetDouble());
        Assert.Equal(23.1688, saved.GetProperty("homeLongitude").GetDouble());
    }

    [Fact]
    public async Task UpdateProfile_WithoutHomeLocation_ClearsIt()
    {
        var user = await _factory.CreateUserAsync();
        await user.Client.PutAsJsonAsync("/api/profile", new
        {
            homeCity = "Białystok",
            homeLatitude = 53.1325,
            homeLongitude = 23.1688
        });

        await user.Client.PutAsJsonAsync("/api/profile", new { bio = "Bez miasta" });

        var saved = await (await user.Client.GetAsync("/api/profile")).ReadJsonAsync();

        Assert.Equal(System.Text.Json.JsonValueKind.Null, saved.GetProperty("homeCity").ValueKind);
        Assert.Equal(System.Text.Json.JsonValueKind.Null, saved.GetProperty("homeLatitude").ValueKind);
    }

    [Fact]
    public async Task UpdateProfile_OnlyLatitude_IsRejected()
    {
        var user = await _factory.CreateUserAsync();

        var response = await user.Client.PutAsJsonAsync("/api/profile", new
        {
            homeCity = "Białystok",
            homeLatitude = 53.1325
        });

        await response.ShouldBeAsync(HttpStatusCode.BadRequest);
        Assert.Contains(
            "muszą być podane razem",
            (await response.ReadJsonAsync()).GetProperty("message").GetString());
    }

    [Theory]
    [InlineData(200, 10)]
    [InlineData(-91, 10)]
    [InlineData(10, 181)]
    public async Task UpdateProfile_CoordinatesOutOfRange_AreRejected(double latitude, double longitude)
    {
        var user = await _factory.CreateUserAsync();

        var response = await user.Client.PutAsJsonAsync("/api/profile", new
        {
            homeCity = "Nigdzie",
            homeLatitude = latitude,
            homeLongitude = longitude
        });

        await response.ShouldBeAsync(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task UpdateProfile_TooLongBio_IsRejected()
    {
        var user = await _factory.CreateUserAsync();

        var response = await user.Client.PutAsJsonAsync("/api/profile", new { bio = new string('a', 501) });

        await response.ShouldBeAsync(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task UploadAvatar_ValidImage_IsSavedAndReturnedInProfile()
    {
        var user = await _factory.CreateUserAsync();

        var response = await user.Client.PostAsync(
            "/api/profile/avatar",
            ApiHelpers.FileContent(TestFiles.Png(), "avatar.png"));

        await response.ShouldBeAsync(HttpStatusCode.OK);

        var url = (await response.ReadJsonAsync()).GetProperty("avatarUrl").GetString()!;

        Assert.StartsWith("/avatars/", url);
        Assert.True(File.Exists(Path.Combine(_factory.WebRoot, url.TrimStart('/'))));
    }

    [Fact]
    public async Task UploadAvatar_ReplacingImage_DeletesTheOldFile()
    {
        var user = await _factory.CreateUserAsync();
        var first = await user.Client.PostAsync("/api/profile/avatar", ApiHelpers.FileContent(TestFiles.Png(), "a.png"));
        var firstUrl = (await first.ReadJsonAsync()).GetProperty("avatarUrl").GetString()!;

        var second = await user.Client.PostAsync("/api/profile/avatar", ApiHelpers.FileContent(TestFiles.Jpeg(), "b.jpg"));
        var secondUrl = (await second.ReadJsonAsync()).GetProperty("avatarUrl").GetString()!;

        Assert.NotEqual(firstUrl, secondUrl);
        Assert.False(File.Exists(Path.Combine(_factory.WebRoot, firstUrl.TrimStart('/'))));
        Assert.True(File.Exists(Path.Combine(_factory.WebRoot, secondUrl.TrimStart('/'))));
    }

    [Fact]
    public async Task UploadAvatar_NotAnImage_IsRejected()
    {
        var user = await _factory.CreateUserAsync();

        var response = await user.Client.PostAsync(
            "/api/profile/avatar",
            ApiHelpers.FileContent(TestFiles.Text(), "avatar.png"));

        await response.ShouldBeAsync(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task ChangePassword_WrongCurrentPassword_IsRejectedInPolish()
    {
        var user = await _factory.CreateUserAsync();

        var response = await user.Client.PostAsJsonAsync("/api/profile/change-password", new
        {
            currentPassword = "Zle12345",
            newPassword = "Nowe12345"
        });

        await response.ShouldBeAsync(HttpStatusCode.BadRequest);
        Assert.Equal(
            "Obecne hasło jest nieprawidłowe.",
            (await response.ReadJsonAsync()).GetProperty("message").GetString());
    }

    [Fact]
    public async Task ChangePassword_WeakNewPassword_ListsAllReasons()
    {
        var user = await _factory.CreateUserAsync();

        var response = await user.Client.PostAsJsonAsync("/api/profile/change-password", new
        {
            currentPassword = user.Password,
            newPassword = "abc"
        });

        await response.ShouldBeAsync(HttpStatusCode.BadRequest);

        var message = (await response.ReadJsonAsync()).GetProperty("message").GetString()!;

        Assert.Contains("co najmniej 8 znaków", message);
        Assert.Contains("cyfrę", message);
        Assert.Contains("wielką literę", message);
    }

    [Fact]
    public async Task ChangePassword_Valid_NewPasswordWorksAndOldOneDoesNot()
    {
        var user = await _factory.CreateUserAsync();

        var change = await user.Client.PostAsJsonAsync("/api/profile/change-password", new
        {
            currentPassword = user.Password,
            newPassword = "Nowe12345"
        });

        await change.ShouldBeAsync(HttpStatusCode.NoContent);

        var anonymous = _factory.CreateClient();

        await (await anonymous.PostAsJsonAsync("/api/auth/login", new { user.Email, password = "Nowe12345" }))
            .ShouldBeAsync(HttpStatusCode.OK);
        await (await anonymous.PostAsJsonAsync("/api/auth/login", new { user.Email, password = user.Password }))
            .ShouldBeAsync(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task ChangePassword_WithoutToken_IsUnauthorized()
    {
        var response = await _factory.CreateClient().PostAsJsonAsync("/api/profile/change-password", new
        {
            currentPassword = "Test12345",
            newPassword = "Nowe12345"
        });

        await response.ShouldBeAsync(HttpStatusCode.Unauthorized);
    }
}
