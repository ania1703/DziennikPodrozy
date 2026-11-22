using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using DziennikPodrozy.Api.Models;
using DziennikPodrozy.Tests.Infrastructure;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace DziennikPodrozy.Tests.Api;

[Collection(ApiCollection.Name)]
public class AdminApiTests
{
    private readonly ApiFactory _factory;

    public AdminApiTests(ApiFactory factory)
    {
        _factory = factory;
    }

    private async Task<JsonElement> FindUserAsync(HttpClient admin, string userName)
    {
        var response = await admin.GetAsync("/api/admin/users");

        await response.ShouldBeAsync(HttpStatusCode.OK);

        return (await response.ReadJsonAsync()).EnumerateArray().Single(u => u.GetProperty("userName").GetString() == userName);
    }

    private static string IdOf(JsonElement user) => user.GetProperty("id").GetString()!;

    [Fact]
    public async Task UserList_WithoutToken_IsUnauthorized()
    {
        await (await _factory.CreateClient().GetAsync("/api/admin/users")).ShouldBeAsync(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task UserList_AsRegularUser_IsForbidden()
    {
        var user = await _factory.CreateUserAsync();

        await (await user.Client.GetAsync("/api/admin/users")).ShouldBeAsync(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async Task UserList_ShowsAccountsWithDatesCountsAndRoles()
    {
        var admin = await _factory.CreateAdminClientAsync();
        var user = await _factory.CreateUserAsync();
        var trip = await user.Client.CreateTripAsync();
        var tripId = trip.GetProperty("id").GetInt32();
        await user.Client.CreateTripAsync("Druga");
        await user.Client.CreateStopAsync(tripId, "Wawel", 50.05, 19.93, ApiHelpers.DaysFromToday(-9));

        var listed = await FindUserAsync(admin, user.UserName);
        var seededAdmin = await FindUserAsync(admin, "admin");

        Assert.Equal(user.Email, listed.GetProperty("email").GetString());
        Assert.False(listed.GetProperty("isAdmin").GetBoolean());
        Assert.False(listed.GetProperty("isSuspended").GetBoolean());
        Assert.Equal(2, listed.GetProperty("tripCount").GetInt32());
        Assert.Equal(1, listed.GetProperty("stopCount").GetInt32());
        Assert.True(DateTime.Parse(listed.GetProperty("createdAt").GetString()!).Year >= 2026);
        Assert.Equal(JsonValueKind.Null, listed.GetProperty("deletionRequestedAt").ValueKind);
        Assert.True(seededAdmin.GetProperty("isAdmin").GetBoolean());
    }

    [Fact]
    public async Task UserList_ShowsLastActivityAfterLogin()
    {
        var admin = await _factory.CreateAdminClientAsync();
        var user = await _factory.CreateUserAsync();

        var listed = await FindUserAsync(admin, user.UserName);

        Assert.NotEqual(JsonValueKind.Null, listed.GetProperty("lastActiveAt").ValueKind);
    }

    [Fact]
    public async Task Suspend_BlocksLoginWithAdminContactMessage()
    {
        var admin = await _factory.CreateAdminClientAsync();
        var user = await _factory.CreateUserAsync();
        var id = IdOf(await FindUserAsync(admin, user.UserName));

        await (await admin.PostAsync($"/api/admin/users/{id}/suspend", null)).ShouldBeAsync(HttpStatusCode.NoContent);

        var login = await _factory.CreateClient().PostAsJsonAsync("/api/auth/login", new { user.Email, user.Password });

        await login.ShouldBeAsync(HttpStatusCode.Forbidden);

        var body = await login.ReadJsonAsync();

        Assert.Equal("Konto zostało zawieszone.", body.GetProperty("message").GetString());
        Assert.Equal("Skontaktuj się z administratorem.", body.GetProperty("hint").GetString());
        Assert.Equal(ApiFactory.ContactEmail, body.GetProperty("contactEmail").GetString());
    }

    [Fact]
    public async Task Suspend_CutsOffAnAlreadyIssuedToken()
    {
        var admin = await _factory.CreateAdminClientAsync();
        var user = await _factory.CreateUserAsync();
        await (await user.Client.GetAsync("/api/trips")).ShouldBeAsync(HttpStatusCode.OK);
        var id = IdOf(await FindUserAsync(admin, user.UserName));

        await admin.PostAsync($"/api/admin/users/{id}/suspend", null);

        await (await user.Client.GetAsync("/api/trips")).ShouldBeAsync(HttpStatusCode.Unauthorized);
        Assert.True((await FindUserAsync(admin, user.UserName)).GetProperty("isSuspended").GetBoolean());
    }

    [Fact]
    public async Task Unsuspend_RestoresLoginAndTheOldToken()
    {
        var admin = await _factory.CreateAdminClientAsync();
        var user = await _factory.CreateUserAsync();
        var id = IdOf(await FindUserAsync(admin, user.UserName));
        await admin.PostAsync($"/api/admin/users/{id}/suspend", null);

        await (await admin.PostAsync($"/api/admin/users/{id}/unsuspend", null)).ShouldBeAsync(HttpStatusCode.NoContent);

        await (await _factory.CreateClient().PostAsJsonAsync("/api/auth/login", new { user.Email, user.Password }))
            .ShouldBeAsync(HttpStatusCode.OK);
        await (await user.Client.GetAsync("/api/trips")).ShouldBeAsync(HttpStatusCode.OK);
        Assert.False((await FindUserAsync(admin, user.UserName)).GetProperty("isSuspended").GetBoolean());
    }

    [Fact]
    public async Task RequestDeletion_SuspendsTheAccountAndSetsTheEarliestDeletionDate()
    {
        var admin = await _factory.CreateAdminClientAsync();
        var user = await _factory.CreateUserAsync();
        var id = IdOf(await FindUserAsync(admin, user.UserName));

        await (await admin.PostAsync($"/api/admin/users/{id}/request-deletion", null)).ShouldBeAsync(HttpStatusCode.NoContent);

        var listed = await FindUserAsync(admin, user.UserName);
        var requested = DateTime.Parse(listed.GetProperty("deletionRequestedAt").GetString()!);
        var allowed = DateTime.Parse(listed.GetProperty("deletionAllowedAt").GetString()!);

        Assert.True(listed.GetProperty("isSuspended").GetBoolean());
        Assert.Equal(7, (allowed - requested).TotalDays, precision: 3);
        await (await user.Client.GetAsync("/api/trips")).ShouldBeAsync(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task Delete_BeforeTheWaitingPeriodEnds_IsRejected()
    {
        var admin = await _factory.CreateAdminClientAsync();
        var user = await _factory.CreateUserAsync();
        var id = IdOf(await FindUserAsync(admin, user.UserName));
        await admin.PostAsync($"/api/admin/users/{id}/request-deletion", null);

        var response = await admin.DeleteAsync($"/api/admin/users/{id}");

        await response.ShouldBeAsync(HttpStatusCode.BadRequest);
        Assert.Contains("po 7 dniach", (await response.ReadJsonAsync()).GetProperty("message").GetString());
        Assert.NotNull(await FindUserAsync(admin, user.UserName).ContinueWith(t => t.Result.GetProperty("id").GetString()));
    }

    [Fact]
    public async Task Delete_WithoutPlanningItFirst_IsRejected()
    {
        var admin = await _factory.CreateAdminClientAsync();
        var user = await _factory.CreateUserAsync();
        var id = IdOf(await FindUserAsync(admin, user.UserName));

        await (await admin.DeleteAsync($"/api/admin/users/{id}")).ShouldBeAsync(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Unsuspend_CancelsAPlannedDeletion()
    {
        var admin = await _factory.CreateAdminClientAsync();
        var user = await _factory.CreateUserAsync();
        var id = IdOf(await FindUserAsync(admin, user.UserName));
        await admin.PostAsync($"/api/admin/users/{id}/request-deletion", null);

        await admin.PostAsync($"/api/admin/users/{id}/unsuspend", null);

        var listed = await FindUserAsync(admin, user.UserName);

        Assert.False(listed.GetProperty("isSuspended").GetBoolean());
        Assert.Equal(JsonValueKind.Null, listed.GetProperty("deletionRequestedAt").ValueKind);
    }

    [Fact]
    public async Task Delete_AfterTheWaitingPeriod_RemovesTheAccountItsDataAndFiles()
    {
        var admin = await _factory.CreateAdminClientAsync();
        var user = await _factory.CreateUserAsync();
        var tripId = (await user.Client.CreateTripAsync()).GetProperty("id").GetInt32();
        var stopId = (await user.Client.CreateStopAsync(tripId, "Wawel", 50.05, 19.93, ApiHelpers.DaysFromToday(-9)))
            .GetProperty("id").GetInt32();
        await user.Client.PutAsJsonAsync($"/api/trips/{tripId}/day-notes/{ApiHelpers.DaysFromToday(-9)}", new { text = "Notatka" });
        await user.Client.PostAsJsonAsync("/api/wishlist", new { title = "Rzym", latitude = 41.9, longitude = 12.5 });

        var cover = await user.Client.PostAsync($"/api/trips/{tripId}/cover-photo", ApiHelpers.FileContent(TestFiles.Png(), "c.png"));
        var avatar = await user.Client.PostAsync("/api/profile/avatar", ApiHelpers.FileContent(TestFiles.Jpeg(), "a.jpg"));
        var photo = await user.Client.PostAsync(
            $"/api/trips/{tripId}/stops/{stopId}/photos",
            ApiHelpers.FileContent(TestFiles.Png(), "p.png", "files"));
        var recording = ApiHelpers.FileContent(TestFiles.Webm(), "n.webm");
        recording.Add(new StringContent("4"), "durationSeconds");
        var recordingResponse = await user.Client.PostAsync($"/api/trips/{tripId}/stops/{stopId}/recordings", recording);

        var paths = new[]
        {
            (await cover.ReadJsonAsync()).GetProperty("coverPhotoUrl").GetString()!,
            (await avatar.ReadJsonAsync()).GetProperty("avatarUrl").GetString()!,
            (await photo.ReadJsonAsync())[0].GetProperty("url").GetString()!,
            (await recordingResponse.ReadJsonAsync()).GetProperty("url").GetString()!
        }.Select(url => Path.Combine(_factory.WebRoot, url.TrimStart('/'))).ToList();

        Assert.All(paths, path => Assert.True(File.Exists(path)));

        var id = IdOf(await FindUserAsync(admin, user.UserName));
        await admin.PostAsync($"/api/admin/users/{id}/request-deletion", null);

        await _factory.WithDbAsync(async db =>
        {
            var account = await db.Users.SingleAsync(u => u.Id == id);
            account.DeletionRequestedAt = DateTime.UtcNow.AddDays(-8);
            await db.SaveChangesAsync();
        });

        await (await admin.DeleteAsync($"/api/admin/users/{id}")).ShouldBeAsync(HttpStatusCode.NoContent);

        await _factory.WithDbAsync(async db =>
        {
            Assert.False(await db.Users.AnyAsync(u => u.Id == id));
            Assert.False(await db.Trips.AnyAsync(t => t.OwnerId == id));
            Assert.False(await db.TripStops.AnyAsync(s => s.TripId == tripId));
            Assert.False(await db.DayNotes.AnyAsync(n => n.TripId == tripId));
            Assert.False(await db.WishlistItems.AnyAsync(w => w.OwnerId == id));
        });

        Assert.All(paths, path => Assert.False(File.Exists(path)));
        await (await _factory.CreateClient().PostAsJsonAsync("/api/auth/login", new { user.Email, user.Password }))
            .ShouldBeAsync(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task Admin_CannotSuspendOrDeleteHisOwnAccount()
    {
        var admin = await _factory.CreateAdminClientAsync();
        var ownId = IdOf(await FindUserAsync(admin, "admin"));

        var suspend = await admin.PostAsync($"/api/admin/users/{ownId}/suspend", null);
        var delete = await admin.PostAsync($"/api/admin/users/{ownId}/request-deletion", null);

        await suspend.ShouldBeAsync(HttpStatusCode.BadRequest);
        await delete.ShouldBeAsync(HttpStatusCode.BadRequest);
        Assert.Contains("własnym koncie", (await suspend.ReadJsonAsync()).GetProperty("message").GetString());
    }

    [Fact]
    public async Task Admin_CannotSuspendAnotherAdministrator()
    {
        var admin = await _factory.CreateAdminClientAsync();
        var other = await _factory.CreateUserAsync();
        var id = IdOf(await FindUserAsync(admin, other.UserName));

        using (var scope = _factory.Services.CreateScope())
        {
            var users = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
            await users.AddToRoleAsync((await users.FindByIdAsync(id))!, "Admin");
        }

        var response = await admin.PostAsync($"/api/admin/users/{id}/suspend", null);

        await response.ShouldBeAsync(HttpStatusCode.BadRequest);
        Assert.Contains("administratora", (await response.ReadJsonAsync()).GetProperty("message").GetString());
    }

    [Fact]
    public async Task Actions_OnUnknownAccount_AreNotFound()
    {
        var admin = await _factory.CreateAdminClientAsync();

        await (await admin.PostAsync("/api/admin/users/nie-ma-takiego/suspend", null)).ShouldBeAsync(HttpStatusCode.NotFound);
        await (await admin.PostAsync("/api/admin/users/nie-ma-takiego/unsuspend", null)).ShouldBeAsync(HttpStatusCode.NotFound);
        await (await admin.DeleteAsync("/api/admin/users/nie-ma-takiego")).ShouldBeAsync(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task Actions_AsRegularUser_AreForbidden()
    {
        var admin = await _factory.CreateAdminClientAsync();
        var victim = await _factory.CreateUserAsync();
        var intruder = await _factory.CreateUserAsync();
        var id = IdOf(await FindUserAsync(admin, victim.UserName));

        await (await intruder.Client.PostAsync($"/api/admin/users/{id}/suspend", null)).ShouldBeAsync(HttpStatusCode.Forbidden);
        await (await intruder.Client.DeleteAsync($"/api/admin/users/{id}")).ShouldBeAsync(HttpStatusCode.Forbidden);
        await (await victim.Client.GetAsync("/api/trips")).ShouldBeAsync(HttpStatusCode.OK);
    }
}
