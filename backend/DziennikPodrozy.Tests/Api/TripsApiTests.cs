using System.Net;
using System.Net.Http.Json;
using DziennikPodrozy.Tests.Infrastructure;

namespace DziennikPodrozy.Tests.Api;

[Collection(ApiCollection.Name)]
public class TripsApiTests
{
    private readonly ApiFactory _factory;

    public TripsApiTests(ApiFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task CreateTrip_WithoutStatus_IsPlannedWithZeroCounts()
    {
        var user = await _factory.CreateUserAsync();

        var trip = await user.Client.CreateTripAsync("Kraków", "2026-12-20", "2026-12-22");

        Assert.Equal("Kraków", trip.GetProperty("title").GetString());
        Assert.Equal("Planned", trip.GetProperty("status").GetString());
        Assert.Equal(3, trip.GetProperty("dayCount").GetInt32());
        Assert.Equal(0, trip.GetProperty("stopCount").GetInt32());
        Assert.Equal(0, trip.GetProperty("photoCount").GetInt32());
        Assert.Equal(0, trip.GetProperty("recordingCount").GetInt32());
        Assert.False(trip.GetProperty("isDescribed").GetBoolean());
    }

    [Fact]
    public async Task CreateTrip_WithoutEndDate_HasNoDayCount()
    {
        var user = await _factory.CreateUserAsync();

        var response = await user.Client.PostAsJsonAsync("/api/trips", new { title = "Bez końca", startDate = "2026-12-20" });

        await response.ShouldBeAsync(HttpStatusCode.Created);
        Assert.Equal(
            System.Text.Json.JsonValueKind.Null,
            (await response.ReadJsonAsync()).GetProperty("dayCount").ValueKind);
    }

    [Fact]
    public async Task CreateTrip_WithFinishedStatus_KeepsIt()
    {
        var user = await _factory.CreateUserAsync();

        var trip = await user.Client.CreateTripAsync(status: "Finished");

        Assert.Equal("Finished", trip.GetProperty("status").GetString());
    }

    [Fact]
    public async Task CreateTrip_EndBeforeStart_IsRejected()
    {
        var user = await _factory.CreateUserAsync();

        var response = await user.Client.PostAsJsonAsync("/api/trips", new
        {
            title = "Zły zakres",
            startDate = "2026-12-22",
            endDate = "2026-12-20"
        });

        await response.ShouldBeAsync(HttpStatusCode.BadRequest);
        Assert.Contains(
            "nie może być wcześniejsza",
            (await response.ReadJsonAsync()).GetProperty("message").GetString());
    }

    [Theory]
    [InlineData("5")]
    [InlineData("Nieznany")]
    public async Task CreateTrip_InvalidStatus_IsRejected(string status)
    {
        var user = await _factory.CreateUserAsync();

        var response = await user.Client.PostAsJsonAsync("/api/trips", new
        {
            title = "Zły status",
            startDate = "2026-12-20",
            status
        });

        await response.ShouldBeAsync(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task CreateTrip_MottoLongerThan300Characters_IsRejected()
    {
        var user = await _factory.CreateUserAsync();

        var response = await user.Client.PostAsJsonAsync("/api/trips", new
        {
            title = "Długie motto",
            description = new string('a', 301),
            startDate = "2026-12-20"
        });

        await response.ShouldBeAsync(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task CreateTrip_MottoOf300Characters_IsAccepted()
    {
        var user = await _factory.CreateUserAsync();

        var trip = await user.Client.CreateTripAsync(description: new string('a', 300));

        Assert.Equal(300, trip.GetProperty("description").GetString()!.Length);
    }

    [Fact]
    public async Task CreateTrip_EmptyTitle_IsRejected()
    {
        var user = await _factory.CreateUserAsync();

        var response = await user.Client.PostAsJsonAsync("/api/trips", new { title = "", startDate = "2026-12-20" });

        await response.ShouldBeAsync(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task GetTrip_OfAnotherUser_IsNotFound()
    {
        var owner = await _factory.CreateUserAsync();
        var other = await _factory.CreateUserAsync();
        var trip = await owner.Client.CreateTripAsync();

        var response = await other.Client.GetAsync($"/api/trips/{trip.GetProperty("id").GetInt32()}");

        await response.ShouldBeAsync(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task GetTrips_ReturnsOnlyOwnTrips()
    {
        var owner = await _factory.CreateUserAsync();
        var other = await _factory.CreateUserAsync();
        await owner.Client.CreateTripAsync("Moja");
        await other.Client.CreateTripAsync("Cudza");

        var list = await (await owner.Client.GetAsync("/api/trips")).ReadJsonAsync();

        Assert.Equal(new[] { "Moja" }, list.EnumerateArray().Select(t => t.GetProperty("title").GetString()));
    }

    [Fact]
    public async Task GetTrips_FiltersByStatusAndYear()
    {
        var user = await _factory.CreateUserAsync();
        await user.Client.CreateTripAsync("Planowana 2027", "2027-05-01", "2027-05-05", "Planned");
        await user.Client.CreateTripAsync("Zakończona 2025", "2025-05-01", "2025-05-05", "Finished");
        await user.Client.CreateTripAsync("Zakończona 2024", "2024-05-01", "2024-05-05", "Finished");

        var finished = await (await user.Client.GetAsync("/api/trips?status=Finished")).ReadJsonAsync();
        var from2025 = await (await user.Client.GetAsync("/api/trips?year=2025")).ReadJsonAsync();

        Assert.Equal(2, finished.GetArrayLength());
        Assert.Equal("Zakończona 2025", from2025.EnumerateArray().Single().GetProperty("title").GetString());
    }

    [Fact]
    public async Task GetTrips_SortsNewestFirstByDefaultAndOldestOnRequest()
    {
        var user = await _factory.CreateUserAsync();
        await user.Client.CreateTripAsync("Starsza", "2024-01-01", "2024-01-03", "Finished");
        await user.Client.CreateTripAsync("Nowsza", "2025-01-01", "2025-01-03", "Finished");

        var newest = await (await user.Client.GetAsync("/api/trips")).ReadJsonAsync();
        var oldest = await (await user.Client.GetAsync("/api/trips?sort=oldest")).ReadJsonAsync();

        Assert.Equal("Nowsza", newest[0].GetProperty("title").GetString());
        Assert.Equal("Starsza", oldest[0].GetProperty("title").GetString());
    }

    [Fact]
    public async Task UpdateTrip_ChangesFields()
    {
        var user = await _factory.CreateUserAsync();
        var trip = await user.Client.CreateTripAsync("Stara nazwa");
        var id = trip.GetProperty("id").GetInt32();

        var response = await user.Client.PutAsJsonAsync($"/api/trips/{id}", new
        {
            title = "Nowa nazwa",
            description = "Nowe motto",
            startDate = "2026-01-10",
            endDate = "2026-01-20"
        });

        await response.ShouldBeAsync(HttpStatusCode.OK);

        var updated = await response.ReadJsonAsync();

        Assert.Equal("Nowa nazwa", updated.GetProperty("title").GetString());
        Assert.Equal("Nowe motto", updated.GetProperty("description").GetString());
        Assert.Equal(11, updated.GetProperty("dayCount").GetInt32());
    }

    [Fact]
    public async Task UpdateTrip_EndBeforeStart_IsRejected()
    {
        var user = await _factory.CreateUserAsync();
        var id = (await user.Client.CreateTripAsync()).GetProperty("id").GetInt32();

        var response = await user.Client.PutAsJsonAsync($"/api/trips/{id}", new
        {
            title = "X",
            startDate = "2026-01-20",
            endDate = "2026-01-10"
        });

        await response.ShouldBeAsync(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task UpdateTrip_OfAnotherUser_IsNotFound()
    {
        var owner = await _factory.CreateUserAsync();
        var other = await _factory.CreateUserAsync();
        var id = (await owner.Client.CreateTripAsync()).GetProperty("id").GetInt32();

        var response = await other.Client.PutAsJsonAsync($"/api/trips/{id}", new { title = "Przejęta", startDate = "2026-01-01" });

        await response.ShouldBeAsync(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task ChangeStatus_ValidValue_IsApplied()
    {
        var user = await _factory.CreateUserAsync();
        var id = (await user.Client.CreateTripAsync(endDate: DateTime.UtcNow.AddDays(30).ToString("yyyy-MM-dd")))
            .GetProperty("id").GetInt32();

        var response = await user.Client.PatchAsJsonAsync($"/api/trips/{id}/status", new { status = "InProgress" });

        await response.ShouldBeAsync(HttpStatusCode.OK);
        Assert.Equal("InProgress", (await response.ReadJsonAsync()).GetProperty("status").GetString());
    }

    [Theory]
    [InlineData("5")]
    [InlineData("Cokolwiek")]
    public async Task ChangeStatus_InvalidValue_IsRejected(string status)
    {
        var user = await _factory.CreateUserAsync();
        var id = (await user.Client.CreateTripAsync()).GetProperty("id").GetInt32();

        var response = await user.Client.PatchAsJsonAsync($"/api/trips/{id}/status", new { status });

        await response.ShouldBeAsync(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task GetTrip_InProgressWithPastEndDate_IsFinishedAutomatically()
    {
        var user = await _factory.CreateUserAsync();
        var trip = await user.Client.CreateTripAsync(
            startDate: ApiHelpers.DaysFromToday(-10),
            endDate: ApiHelpers.DaysFromToday(-3),
            status: "InProgress");

        var response = await user.Client.GetAsync($"/api/trips/{trip.GetProperty("id").GetInt32()}");

        Assert.Equal("Finished", (await response.ReadJsonAsync()).GetProperty("status").GetString());
    }

    [Fact]
    public async Task GetTrips_InProgressWithFutureEndDate_IsLeftAlone()
    {
        var user = await _factory.CreateUserAsync();
        await user.Client.CreateTripAsync(
            startDate: ApiHelpers.DaysFromToday(-2),
            endDate: ApiHelpers.DaysFromToday(5),
            status: "InProgress");

        var list = await (await user.Client.GetAsync("/api/trips")).ReadJsonAsync();

        Assert.Equal("InProgress", list[0].GetProperty("status").GetString());
    }

    [Fact]
    public async Task GetTrips_InProgressWithoutEndDate_IsLeftAlone()
    {
        var user = await _factory.CreateUserAsync();
        await user.Client.PostAsJsonAsync("/api/trips", new
        {
            title = "Bez końca",
            startDate = ApiHelpers.DaysFromToday(-30),
            status = "InProgress"
        });

        var list = await (await user.Client.GetAsync("/api/trips")).ReadJsonAsync();

        Assert.Equal("InProgress", list[0].GetProperty("status").GetString());
    }

    [Fact]
    public async Task GetTrips_PlannedWithPastEndDate_IsLeftAlone()
    {
        var user = await _factory.CreateUserAsync();
        await user.Client.CreateTripAsync(status: "Planned");

        var list = await (await user.Client.GetAsync("/api/trips")).ReadJsonAsync();

        Assert.Equal("Planned", list[0].GetProperty("status").GetString());
    }

    [Fact]
    public async Task AutoFinish_OnlyAffectsTheOwnersTrips()
    {
        var owner = await _factory.CreateUserAsync();
        var other = await _factory.CreateUserAsync();
        var trip = await owner.Client.CreateTripAsync(status: "InProgress");
        var id = trip.GetProperty("id").GetInt32();

        await other.Client.GetAsync("/api/trips");

        var stored = await (await owner.Client.GetAsync($"/api/trips/{id}")).ReadJsonAsync();

        Assert.Equal("Finished", stored.GetProperty("status").GetString());
    }

    [Fact]
    public async Task SetDescribed_FinishedTrip_IsMarkedAndCanBeUnmarked()
    {
        var user = await _factory.CreateUserAsync();
        var id = (await user.Client.CreateTripAsync(status: "Finished")).GetProperty("id").GetInt32();

        var marked = await user.Client.PutAsJsonAsync($"/api/trips/{id}/described", new { described = true });
        await marked.ShouldBeAsync(HttpStatusCode.OK);
        Assert.True((await marked.ReadJsonAsync()).GetProperty("isDescribed").GetBoolean());

        var unmarked = await user.Client.PutAsJsonAsync($"/api/trips/{id}/described", new { described = false });
        await unmarked.ShouldBeAsync(HttpStatusCode.OK);
        Assert.False((await unmarked.ReadJsonAsync()).GetProperty("isDescribed").GetBoolean());
    }

    [Fact]
    public async Task SetDescribed_NotFinishedTrip_IsRejected()
    {
        var user = await _factory.CreateUserAsync();
        var id = (await user.Client.CreateTripAsync(status: "Planned")).GetProperty("id").GetInt32();

        var response = await user.Client.PutAsJsonAsync($"/api/trips/{id}/described", new { described = true });

        await response.ShouldBeAsync(HttpStatusCode.BadRequest);
        Assert.Contains(
            "zakończoną podróż",
            (await response.ReadJsonAsync()).GetProperty("message").GetString());
    }

    [Fact]
    public async Task ChangeStatus_AwayFromFinished_ClearsDescribedFlag()
    {
        var user = await _factory.CreateUserAsync();
        var id = (await user.Client.CreateTripAsync(status: "Finished")).GetProperty("id").GetInt32();
        await user.Client.PutAsJsonAsync($"/api/trips/{id}/described", new { described = true });

        var response = await user.Client.PatchAsJsonAsync($"/api/trips/{id}/status", new { status = "Planned" });

        Assert.False((await response.ReadJsonAsync()).GetProperty("isDescribed").GetBoolean());
    }

    [Fact]
    public async Task SetDescribed_OfAnotherUser_IsNotFound()
    {
        var owner = await _factory.CreateUserAsync();
        var other = await _factory.CreateUserAsync();
        var id = (await owner.Client.CreateTripAsync(status: "Finished")).GetProperty("id").GetInt32();

        var response = await other.Client.PutAsJsonAsync($"/api/trips/{id}/described", new { described = true });

        await response.ShouldBeAsync(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task NextTimeNote_IsSavedTrimmedAndClearedByEmptyText()
    {
        var user = await _factory.CreateUserAsync();
        var id = (await user.Client.CreateTripAsync()).GetProperty("id").GetInt32();

        var saved = await user.Client.PutAsJsonAsync($"/api/trips/{id}/next-time-note", new { text = "  Wyjechać wcześniej  " });
        await saved.ShouldBeAsync(HttpStatusCode.OK);
        Assert.Equal("Wyjechać wcześniej", (await saved.ReadJsonAsync()).GetProperty("nextTimeNote").GetString());

        var cleared = await user.Client.PutAsJsonAsync($"/api/trips/{id}/next-time-note", new { text = "   " });
        Assert.Equal(
            System.Text.Json.JsonValueKind.Null,
            (await cleared.ReadJsonAsync()).GetProperty("nextTimeNote").ValueKind);
    }

    [Fact]
    public async Task NextTimeNote_LongerThan2000Characters_IsRejected()
    {
        var user = await _factory.CreateUserAsync();
        var id = (await user.Client.CreateTripAsync()).GetProperty("id").GetInt32();

        var response = await user.Client.PutAsJsonAsync($"/api/trips/{id}/next-time-note", new { text = new string('a', 2001) });

        await response.ShouldBeAsync(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task NextTimeNote_OfAnotherUser_IsNotFound()
    {
        var owner = await _factory.CreateUserAsync();
        var other = await _factory.CreateUserAsync();
        var id = (await owner.Client.CreateTripAsync()).GetProperty("id").GetInt32();

        var response = await other.Client.PutAsJsonAsync($"/api/trips/{id}/next-time-note", new { text = "cudze" });

        await response.ShouldBeAsync(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task UploadCover_ValidImage_IsStoredAndReplacementDeletesOldFile()
    {
        var user = await _factory.CreateUserAsync();
        var id = (await user.Client.CreateTripAsync()).GetProperty("id").GetInt32();

        var first = await user.Client.PostAsync($"/api/trips/{id}/cover-photo", ApiHelpers.FileContent(TestFiles.Png(), "a.png"));
        await first.ShouldBeAsync(HttpStatusCode.OK);
        var firstUrl = (await first.ReadJsonAsync()).GetProperty("coverPhotoUrl").GetString()!;

        var second = await user.Client.PostAsync($"/api/trips/{id}/cover-photo", ApiHelpers.FileContent(TestFiles.Jpeg(), "b.jpg"));
        var secondUrl = (await second.ReadJsonAsync()).GetProperty("coverPhotoUrl").GetString()!;

        Assert.StartsWith("/trip-covers/", firstUrl);
        Assert.False(File.Exists(Path.Combine(_factory.WebRoot, firstUrl.TrimStart('/'))));
        Assert.True(File.Exists(Path.Combine(_factory.WebRoot, secondUrl.TrimStart('/'))));
    }

    [Fact]
    public async Task UploadCover_NotAnImage_IsRejected()
    {
        var user = await _factory.CreateUserAsync();
        var id = (await user.Client.CreateTripAsync()).GetProperty("id").GetInt32();

        var response = await user.Client.PostAsync($"/api/trips/{id}/cover-photo", ApiHelpers.FileContent(TestFiles.Text(), "a.jpg"));

        await response.ShouldBeAsync(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task UploadCover_OfAnotherUser_IsNotFound()
    {
        var owner = await _factory.CreateUserAsync();
        var other = await _factory.CreateUserAsync();
        var id = (await owner.Client.CreateTripAsync()).GetProperty("id").GetInt32();

        var response = await other.Client.PostAsync($"/api/trips/{id}/cover-photo", ApiHelpers.FileContent(TestFiles.Png(), "a.png"));

        await response.ShouldBeAsync(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task DeleteTrip_RemovesTripItsStopsAndAllFilesFromDisk()
    {
        var user = await _factory.CreateUserAsync();
        var tripId = (await user.Client.CreateTripAsync()).GetProperty("id").GetInt32();
        var stopId = (await user.Client.CreateStopAsync(tripId, "Wawel", 50.05, 19.93, ApiHelpers.DaysFromToday(-9)))
            .GetProperty("id").GetInt32();

        var cover = await user.Client.PostAsync($"/api/trips/{tripId}/cover-photo", ApiHelpers.FileContent(TestFiles.Png(), "c.png"));
        var photo = await user.Client.PostAsync(
            $"/api/trips/{tripId}/stops/{stopId}/photos",
            ApiHelpers.FileContent(TestFiles.Jpeg(), "p.jpg", "files"));
        var recording = await user.Client.PostAsync(
            $"/api/trips/{tripId}/stops/{stopId}/recordings",
            RecordingContent(TestFiles.Webm(), 5));

        var coverPath = Path.Combine(_factory.WebRoot, (await cover.ReadJsonAsync()).GetProperty("coverPhotoUrl").GetString()!.TrimStart('/'));
        var photoPath = Path.Combine(_factory.WebRoot, (await photo.ReadJsonAsync())[0].GetProperty("url").GetString()!.TrimStart('/'));
        var recordingPath = Path.Combine(_factory.WebRoot, (await recording.ReadJsonAsync()).GetProperty("url").GetString()!.TrimStart('/'));

        Assert.True(File.Exists(coverPath) && File.Exists(photoPath) && File.Exists(recordingPath));

        var deleted = await user.Client.DeleteAsync($"/api/trips/{tripId}");

        await deleted.ShouldBeAsync(HttpStatusCode.NoContent);
        await (await user.Client.GetAsync($"/api/trips/{tripId}")).ShouldBeAsync(HttpStatusCode.NotFound);
        await (await user.Client.GetAsync($"/api/trips/{tripId}/stops")).ShouldBeAsync(HttpStatusCode.NotFound);
        Assert.False(File.Exists(coverPath));
        Assert.False(File.Exists(photoPath));
        Assert.False(File.Exists(recordingPath));
    }

    [Fact]
    public async Task DeleteTrip_OfAnotherUser_IsNotFoundAndTripSurvives()
    {
        var owner = await _factory.CreateUserAsync();
        var other = await _factory.CreateUserAsync();
        var id = (await owner.Client.CreateTripAsync()).GetProperty("id").GetInt32();

        await (await other.Client.DeleteAsync($"/api/trips/{id}")).ShouldBeAsync(HttpStatusCode.NotFound);
        await (await owner.Client.GetAsync($"/api/trips/{id}")).ShouldBeAsync(HttpStatusCode.OK);
    }

    [Fact]
    public async Task TripCounts_ReflectStopsPhotosAndRecordings()
    {
        var user = await _factory.CreateUserAsync();
        var tripId = (await user.Client.CreateTripAsync()).GetProperty("id").GetInt32();
        var date = ApiHelpers.DaysFromToday(-9);
        var stopId = (await user.Client.CreateStopAsync(tripId, "Wawel", 50.05, 19.93, date)).GetProperty("id").GetInt32();
        await user.Client.CreateStopAsync(tripId, "Rynek", 50.06, 19.94, date);
        await user.Client.PostAsync(
            $"/api/trips/{tripId}/stops/{stopId}/photos",
            ApiHelpers.FileContent(TestFiles.Png(), "1.png", "files"));
        await user.Client.PostAsync(
            $"/api/trips/{tripId}/stops/{stopId}/recordings",
            RecordingContent(TestFiles.Webm(), 4));

        var trip = await (await user.Client.GetAsync($"/api/trips/{tripId}")).ReadJsonAsync();

        Assert.Equal(2, trip.GetProperty("stopCount").GetInt32());
        Assert.Equal(1, trip.GetProperty("photoCount").GetInt32());
        Assert.Equal(1, trip.GetProperty("recordingCount").GetInt32());
    }

    private static MultipartFormDataContent RecordingContent(byte[] bytes, int durationSeconds)
    {
        var content = ApiHelpers.FileContent(bytes, "nagranie.webm");
        content.Add(new StringContent(durationSeconds.ToString()), "durationSeconds");

        return content;
    }
}
