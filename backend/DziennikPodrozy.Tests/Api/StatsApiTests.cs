using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using DziennikPodrozy.Tests.Infrastructure;

namespace DziennikPodrozy.Tests.Api;

[Collection(ApiCollection.Name)]
public class StatsApiTests
{
    private const double KrakowLat = 50.0647;
    private const double KrakowLon = 19.9450;
    private const double RomeLat = 41.9028;
    private const double RomeLon = 12.4964;

    private readonly ApiFactory _factory;

    public StatsApiTests(ApiFactory factory)
    {
        _factory = factory;
    }

    private static string Day(int offset) => ApiHelpers.DaysFromToday(offset);

    private static async Task<JsonElement> GetStatsAsync(TestUser user, string query = "")
    {
        var response = await user.Client.GetAsync("/api/stats" + query);

        await response.ShouldBeAsync(HttpStatusCode.OK);

        return await response.ReadJsonAsync();
    }

    /// <summary>Zakończona podróż sprzed 10-8 dni z przystankami w Krakowie (dzień 1) i Rzymie (dzień 2).</summary>
    private async Task<(TestUser User, int TripId, int KrakowStopId, int RomeStopId)> CreateFinishedTripAsync()
    {
        var user = await _factory.CreateUserAsync();
        var trip = await user.Client.CreateTripAsync("Europa", Day(-10), Day(-8), "Finished");
        var tripId = trip.GetProperty("id").GetInt32();
        var krakow = await user.Client.CreateStopAsync(tripId, "Kraków", KrakowLat, KrakowLon, Day(-10));
        var rome = await user.Client.CreateStopAsync(tripId, "Rzym", RomeLat, RomeLon, Day(-9));

        return (user, tripId, krakow.GetProperty("id").GetInt32(), rome.GetProperty("id").GetInt32());
    }

    [Fact]
    public async Task Stats_WithoutToken_AreUnauthorized()
    {
        await (await _factory.CreateClient().GetAsync("/api/stats")).ShouldBeAsync(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task Stats_ForNewUser_AreAllZero()
    {
        var user = await _factory.CreateUserAsync();

        var stats = await GetStatsAsync(user);

        Assert.Equal(0, stats.GetProperty("tripCount").GetInt32());
        Assert.Equal(0, stats.GetProperty("dayCount").GetInt32());
        Assert.Equal(0, stats.GetProperty("stopCount").GetInt32());
        Assert.Equal(0, stats.GetProperty("photoCount").GetInt32());
        Assert.Equal(0, stats.GetProperty("recordingCount").GetInt32());
        Assert.Equal(0, stats.GetProperty("distanceKm").GetInt32());
        Assert.Empty(stats.GetProperty("countryCodes").EnumerateArray());
        Assert.Empty(stats.GetProperty("years").EnumerateArray());
        Assert.False(stats.GetProperty("hasHome").GetBoolean());
        Assert.Equal(JsonValueKind.Null, stats.GetProperty("farthestPoint").ValueKind);
        Assert.Equal(JsonValueKind.Null, stats.GetProperty("firstDate").ValueKind);
    }

    [Fact]
    public async Task Stats_CountTripsDaysStopsAndCountries()
    {
        var (user, _, _, _) = await CreateFinishedTripAsync();

        var stats = await GetStatsAsync(user);

        Assert.Equal(1, stats.GetProperty("tripCount").GetInt32());
        Assert.Equal(3, stats.GetProperty("dayCount").GetInt32());
        Assert.Equal(2, stats.GetProperty("stopCount").GetInt32());
        Assert.Equal(new[] { "IT", "PL" }, stats.GetProperty("countryCodes").EnumerateArray().Select(c => c.GetString()));
    }

    [Fact]
    public async Task Stats_DistanceIsStraightLineBetweenConsecutiveStops()
    {
        var (user, _, _, _) = await CreateFinishedTripAsync();

        var distance = (await GetStatsAsync(user)).GetProperty("distanceKm").GetInt32();

        Assert.InRange(distance, 1060, 1090);
    }

    [Fact]
    public async Task Stats_DistanceDoesNotJoinStopsFromDifferentTrips()
    {
        var user = await _factory.CreateUserAsync();
        var first = (await user.Client.CreateTripAsync("Pierwsza", Day(-20), Day(-19), "Finished")).GetProperty("id").GetInt32();
        var second = (await user.Client.CreateTripAsync("Druga", Day(-10), Day(-9), "Finished")).GetProperty("id").GetInt32();
        await user.Client.CreateStopAsync(first, "Kraków", KrakowLat, KrakowLon, Day(-20));
        await user.Client.CreateStopAsync(second, "Rzym", RomeLat, RomeLon, Day(-10));

        var stats = await GetStatsAsync(user);

        Assert.Equal(0, stats.GetProperty("distanceKm").GetInt32());
        Assert.Equal(2, stats.GetProperty("tripCount").GetInt32());
    }

    [Fact]
    public async Task Stats_IgnorePlannedTrips()
    {
        var (user, _, _, _) = await CreateFinishedTripAsync();
        var planned = (await user.Client.CreateTripAsync("Plan", Day(20), Day(22), "Planned")).GetProperty("id").GetInt32();
        await user.Client.CreateStopAsync(planned, "Ateny", 37.98, 23.72, Day(21));

        var stats = await GetStatsAsync(user);

        Assert.Equal(1, stats.GetProperty("tripCount").GetInt32());
        Assert.Equal(2, stats.GetProperty("stopCount").GetInt32());
        Assert.DoesNotContain("GR", stats.GetProperty("countryCodes").EnumerateArray().Select(c => c.GetString()));
    }

    [Fact]
    public async Task Stats_InProgressTripCountsOnlyDaysThatAlreadyPassed()
    {
        var user = await _factory.CreateUserAsync();
        await user.Client.CreateTripAsync("Trwa", Day(-2), Day(5), "InProgress");

        var stats = await GetStatsAsync(user);

        Assert.Equal(1, stats.GetProperty("tripCount").GetInt32());
        Assert.Equal(3, stats.GetProperty("dayCount").GetInt32());
    }

    [Fact]
    public async Task Stats_OverlappingTripsDoNotCountDaysTwice()
    {
        var user = await _factory.CreateUserAsync();
        await user.Client.CreateTripAsync("A", Day(-10), Day(-6), "Finished");
        await user.Client.CreateTripAsync("B", Day(-8), Day(-5), "Finished");

        var stats = await GetStatsAsync(user);

        Assert.Equal(6, stats.GetProperty("dayCount").GetInt32());
    }

    [Fact]
    public async Task Stats_CountPhotosAndRecordings()
    {
        var (user, tripId, krakowStopId, romeStopId) = await CreateFinishedTripAsync();
        await user.Client.PostAsync(
            $"/api/trips/{tripId}/stops/{krakowStopId}/photos",
            ApiHelpers.FileContent(TestFiles.Png(), "1.png", "files"));
        var recording = ApiHelpers.FileContent(TestFiles.Webm(), "n.webm");
        recording.Add(new StringContent("4"), "durationSeconds");
        await user.Client.PostAsync($"/api/trips/{tripId}/stops/{romeStopId}/recordings", recording);

        var stats = await GetStatsAsync(user);

        Assert.Equal(1, stats.GetProperty("photoCount").GetInt32());
        Assert.Equal(1, stats.GetProperty("recordingCount").GetInt32());
    }

    [Fact]
    public async Task Stats_WithoutHomeCity_HaveNoFarthestPoint()
    {
        var (user, _, _, _) = await CreateFinishedTripAsync();

        var stats = await GetStatsAsync(user);

        Assert.False(stats.GetProperty("hasHome").GetBoolean());
        Assert.Equal(JsonValueKind.Null, stats.GetProperty("farthestPoint").ValueKind);
    }

    [Fact]
    public async Task Stats_WithHomeCity_FindFarthestStopFromHome()
    {
        var (user, tripId, _, _) = await CreateFinishedTripAsync();
        await user.Client.PutAsJsonAsync("/api/profile", new
        {
            homeCity = "Warszawa",
            homeLatitude = 52.2297,
            homeLongitude = 21.0122
        });

        var stats = await GetStatsAsync(user);
        var farthest = stats.GetProperty("farthestPoint");

        Assert.True(stats.GetProperty("hasHome").GetBoolean());
        Assert.Equal("Warszawa", stats.GetProperty("homeCity").GetString());
        Assert.Equal("Rzym", farthest.GetProperty("title").GetString());
        Assert.Equal(tripId, farthest.GetProperty("tripId").GetInt32());
        Assert.Equal("IT", farthest.GetProperty("countryCode").GetString());
        Assert.InRange(farthest.GetProperty("distanceKm").GetInt32(), 1300, 1330);
    }

    [Fact]
    public async Task Stats_ListYearsOfPastTripsAndTheAxisBounds()
    {
        var (user, _, _, _) = await CreateFinishedTripAsync();

        var stats = await GetStatsAsync(user);

        Assert.Contains(DateTime.UtcNow.AddDays(-10).Year, stats.GetProperty("years").EnumerateArray().Select(y => y.GetInt32()));
        Assert.Equal(Day(-10), stats.GetProperty("firstDate").GetString());
        Assert.Equal(Day(-8), stats.GetProperty("lastDate").GetString());
    }

    [Fact]
    public async Task Stats_ForSingleDay_CountOnlyThatDaysStops()
    {
        var (user, _, _, _) = await CreateFinishedTripAsync();

        var stats = await GetStatsAsync(user, $"?from={Day(-9)}&to={Day(-9)}");

        Assert.Equal(1, stats.GetProperty("tripCount").GetInt32());
        Assert.Equal(1, stats.GetProperty("dayCount").GetInt32());
        Assert.Equal(1, stats.GetProperty("stopCount").GetInt32());
        Assert.Equal(0, stats.GetProperty("distanceKm").GetInt32());
        Assert.Equal(new[] { "IT" }, stats.GetProperty("countryCodes").EnumerateArray().Select(c => c.GetString()));
    }

    [Fact]
    public async Task Stats_ForRange_AreRestrictedToStopsAndDaysInsideIt()
    {
        var (user, _, _, _) = await CreateFinishedTripAsync();

        var stats = await GetStatsAsync(user, $"?from={Day(-10)}&to={Day(-9)}");

        Assert.Equal(2, stats.GetProperty("dayCount").GetInt32());
        Assert.Equal(2, stats.GetProperty("stopCount").GetInt32());
    }

    [Fact]
    public async Task Stats_ForRangeWithOnlyLowerBound_IncludeEverythingFromThatDay()
    {
        var (user, _, _, _) = await CreateFinishedTripAsync();

        var stats = await GetStatsAsync(user, $"?from={Day(-9)}");

        Assert.Equal(1, stats.GetProperty("stopCount").GetInt32());
        Assert.Equal(2, stats.GetProperty("dayCount").GetInt32());
    }

    [Fact]
    public async Task Stats_ForRangeWithoutTrips_AreEmptyButKeepTheYearsList()
    {
        var (user, _, _, _) = await CreateFinishedTripAsync();

        var stats = await GetStatsAsync(user, "?from=1999-01-01&to=1999-12-31");

        Assert.Equal(0, stats.GetProperty("tripCount").GetInt32());
        Assert.Equal(0, stats.GetProperty("stopCount").GetInt32());
        Assert.Empty(stats.GetProperty("countryCodes").EnumerateArray());
        Assert.NotEmpty(stats.GetProperty("years").EnumerateArray());
    }

    [Fact]
    public async Task Stats_ForRangeEndingBeforeItStarts_IsRejected()
    {
        var user = await _factory.CreateUserAsync();

        var response = await user.Client.GetAsync($"/api/stats?from={Day(-1)}&to={Day(-5)}");

        await response.ShouldBeAsync(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Stats_DoNotIncludeAnotherUsersData()
    {
        await CreateFinishedTripAsync();
        var user = await _factory.CreateUserAsync();

        var stats = await GetStatsAsync(user);

        Assert.Equal(0, stats.GetProperty("tripCount").GetInt32());
        Assert.Equal(0, stats.GetProperty("stopCount").GetInt32());
    }
}
