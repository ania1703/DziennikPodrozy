using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using DziennikPodrozy.Tests.Infrastructure;

namespace DziennikPodrozy.Tests.Api;

[Collection(ApiCollection.Name)]
public class StopsApiTests
{
    private readonly ApiFactory _factory;

    public StopsApiTests(ApiFactory factory)
    {
        _factory = factory;
    }

    private static string Day(int offset) => ApiHelpers.DaysFromToday(offset);

    private async Task<(TestUser User, int TripId)> CreateTripAsync(string? start = null, string? end = null)
    {
        var user = await _factory.CreateUserAsync();
        var trip = await user.Client.CreateTripAsync(startDate: start ?? Day(-10), endDate: end ?? Day(-8));

        return (user, trip.GetProperty("id").GetInt32());
    }

    [Fact]
    public async Task CreateStop_FirstStopOfTheDay_HasSortOrderOneAndCountryFromGeocoding()
    {
        var (user, tripId) = await CreateTripAsync();

        var stop = await user.Client.CreateStopAsync(tripId, "Wawel", 50.054, 19.9354, Day(-10), "<p>Zamek</p>");

        Assert.Equal("Wawel", stop.GetProperty("title").GetString());
        Assert.Equal(1, stop.GetProperty("sortOrder").GetInt32());
        Assert.Equal("PL", stop.GetProperty("countryCode").GetString());
        Assert.Equal("<p>Zamek</p>", stop.GetProperty("note").GetString());
    }

    [Fact]
    public async Task CreateStop_SecondStopOfTheSameDay_GoesToTheEnd()
    {
        var (user, tripId) = await CreateTripAsync();
        await user.Client.CreateStopAsync(tripId, "Wawel", 50.05, 19.93, Day(-10));

        var second = await user.Client.CreateStopAsync(tripId, "Rynek", 50.06, 19.94, Day(-10));
        var nextDay = await user.Client.CreateStopAsync(tripId, "Kopalnia", 49.98, 20.05, Day(-9));

        Assert.Equal(2, second.GetProperty("sortOrder").GetInt32());
        Assert.Equal(1, nextDay.GetProperty("sortOrder").GetInt32());
    }

    [Theory]
    [InlineData(50.05, 19.93, "PL")]
    [InlineData(41.89, 12.49, "IT")]
    [InlineData(37.98, 23.72, "GR")]
    public async Task CreateStop_DetectsCountryFromCoordinates(double latitude, double longitude, string expected)
    {
        var (user, tripId) = await CreateTripAsync();

        var stop = await user.Client.CreateStopAsync(tripId, "Miejsce", latitude, longitude, Day(-10));

        Assert.Equal(expected, stop.GetProperty("countryCode").GetString());
    }

    [Fact]
    public async Task CreateStop_PointWithoutCountry_HasNullCountryCode()
    {
        var (user, tripId) = await CreateTripAsync();

        var stop = await user.Client.CreateStopAsync(tripId, "Ocean", 0, 0, Day(-10));

        Assert.Equal(JsonValueKind.Null, stop.GetProperty("countryCode").ValueKind);
    }

    [Fact]
    public async Task CreateStop_DateOutsideTripDates_IsRejected()
    {
        var (user, tripId) = await CreateTripAsync();

        var before = await user.Client.PostAsJsonAsync($"/api/trips/{tripId}/stops",
            new { title = "Za wcześnie", latitude = 50, longitude = 19, date = Day(-11) });
        var after = await user.Client.PostAsJsonAsync($"/api/trips/{tripId}/stops",
            new { title = "Za późno", latitude = 50, longitude = 19, date = Day(-7) });

        await before.ShouldBeAsync(HttpStatusCode.BadRequest);
        await after.ShouldBeAsync(HttpStatusCode.BadRequest);
        Assert.Contains("mieścić się w datach podróży", (await after.ReadJsonAsync()).GetProperty("message").GetString());
    }

    [Fact]
    public async Task CreateStop_TripWithoutEndDate_AcceptsAnyLaterDate()
    {
        var user = await _factory.CreateUserAsync();
        var trip = await user.Client.PostAsJsonAsync("/api/trips", new { title = "Otwarta", startDate = Day(-10) });
        var tripId = (await trip.ReadJsonAsync()).GetProperty("id").GetInt32();

        var response = await user.Client.PostAsJsonAsync($"/api/trips/{tripId}/stops",
            new { title = "Później", latitude = 50, longitude = 19, date = Day(30) });

        await response.ShouldBeAsync(HttpStatusCode.Created);
    }

    [Theory]
    [InlineData("", 50, 19)]
    [InlineData("Miejsce", 200, 19)]
    [InlineData("Miejsce", -91, 19)]
    [InlineData("Miejsce", 50, 181)]
    public async Task CreateStop_InvalidData_IsRejected(string title, double latitude, double longitude)
    {
        var (user, tripId) = await CreateTripAsync();

        var response = await user.Client.PostAsJsonAsync($"/api/trips/{tripId}/stops",
            new { title, latitude, longitude, date = Day(-10) });

        await response.ShouldBeAsync(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task CreateStop_NoteLongerThan10000Characters_IsRejected()
    {
        var (user, tripId) = await CreateTripAsync();

        var response = await user.Client.PostAsJsonAsync($"/api/trips/{tripId}/stops",
            new { title = "Miejsce", latitude = 50, longitude = 19, date = Day(-10), note = new string('a', 10001) });

        await response.ShouldBeAsync(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Stops_OfAnotherUsersTrip_AreNotFound()
    {
        var (_, tripId) = await CreateTripAsync();
        var intruder = await _factory.CreateUserAsync();

        await (await intruder.Client.GetAsync($"/api/trips/{tripId}/stops")).ShouldBeAsync(HttpStatusCode.NotFound);
        await (await intruder.Client.PostAsJsonAsync($"/api/trips/{tripId}/stops",
            new { title = "Włam", latitude = 50, longitude = 19, date = Day(-10) })).ShouldBeAsync(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task GetStops_AreOrderedByDateThenSortOrder()
    {
        var (user, tripId) = await CreateTripAsync();
        await user.Client.CreateStopAsync(tripId, "Dzień 2", 50, 19, Day(-9));
        await user.Client.CreateStopAsync(tripId, "Dzień 1 - pierwszy", 50, 19, Day(-10));
        await user.Client.CreateStopAsync(tripId, "Dzień 1 - drugi", 50, 19, Day(-10));

        var list = await (await user.Client.GetAsync($"/api/trips/{tripId}/stops")).ReadJsonAsync();

        Assert.Equal(
            new[] { "Dzień 1 - pierwszy", "Dzień 1 - drugi", "Dzień 2" },
            list.EnumerateArray().Select(s => s.GetProperty("title").GetString()));
    }

    [Fact]
    public async Task UpdateStop_MovingToAnotherDay_PutsItAtTheEndOfThatDay()
    {
        var (user, tripId) = await CreateTripAsync();
        var first = await user.Client.CreateStopAsync(tripId, "Ruszany", 50, 19, Day(-10));
        await user.Client.CreateStopAsync(tripId, "Na dniu 2", 50, 19, Day(-9));

        var response = await user.Client.PutAsJsonAsync(
            $"/api/trips/{tripId}/stops/{first.GetProperty("id").GetInt32()}",
            new { title = "Ruszany", latitude = 50.0, longitude = 19.0, date = Day(-9), note = (string?)null });

        await response.ShouldBeAsync(HttpStatusCode.OK);
        Assert.Equal(2, (await response.ReadJsonAsync()).GetProperty("sortOrder").GetInt32());
    }

    [Fact]
    public async Task UpdateStop_ChangingPosition_DetectsTheNewCountry()
    {
        var (user, tripId) = await CreateTripAsync();
        var stop = await user.Client.CreateStopAsync(tripId, "Wawel", 50.05, 19.93, Day(-10));
        var id = stop.GetProperty("id").GetInt32();

        var response = await user.Client.PutAsJsonAsync(
            $"/api/trips/{tripId}/stops/{id}",
            new { title = "Koloseum", latitude = 41.89, longitude = 12.49, date = Day(-10), note = (string?)null });

        Assert.Equal("IT", (await response.ReadJsonAsync()).GetProperty("countryCode").GetString());
    }

    [Fact]
    public async Task UpdateStop_ChangingOnlyTitle_KeepsTheCountry()
    {
        var (user, tripId) = await CreateTripAsync();
        var id = (await user.Client.CreateStopAsync(tripId, "Wawel", 50.05, 19.93, Day(-10))).GetProperty("id").GetInt32();

        var response = await user.Client.PutAsJsonAsync(
            $"/api/trips/{tripId}/stops/{id}",
            new { title = "Zamek Królewski", latitude = 50.05, longitude = 19.93, date = Day(-10), note = "Nowy wpis" });

        var body = await response.ReadJsonAsync();

        Assert.Equal("Zamek Królewski", body.GetProperty("title").GetString());
        Assert.Equal("PL", body.GetProperty("countryCode").GetString());
        Assert.Equal("Nowy wpis", body.GetProperty("note").GetString());
    }

    [Fact]
    public async Task UpdateStop_DateOutsideTrip_IsRejected()
    {
        var (user, tripId) = await CreateTripAsync();
        var id = (await user.Client.CreateStopAsync(tripId, "Wawel", 50.05, 19.93, Day(-10))).GetProperty("id").GetInt32();

        var response = await user.Client.PutAsJsonAsync(
            $"/api/trips/{tripId}/stops/{id}",
            new { title = "Wawel", latitude = 50.05, longitude = 19.93, date = Day(-1), note = (string?)null });

        await response.ShouldBeAsync(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task UpdateAndDeleteStop_OfAnotherUser_AreNotFound()
    {
        var (owner, tripId) = await CreateTripAsync();
        var id = (await owner.Client.CreateStopAsync(tripId, "Wawel", 50.05, 19.93, Day(-10))).GetProperty("id").GetInt32();
        var intruder = await _factory.CreateUserAsync();

        await (await intruder.Client.PutAsJsonAsync(
            $"/api/trips/{tripId}/stops/{id}",
            new { title = "Przejęty", latitude = 50.05, longitude = 19.93, date = Day(-10) })).ShouldBeAsync(HttpStatusCode.NotFound);
        await (await intruder.Client.DeleteAsync($"/api/trips/{tripId}/stops/{id}")).ShouldBeAsync(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task GetStops_ForPastDate_FillsWeatherFromExternalService()
    {
        var (user, tripId) = await CreateTripAsync(Day(-30), Day(-28));
        await user.Client.CreateStopAsync(tripId, "Wawel", 50.05, 19.93, Day(-29));

        var list = await (await user.Client.GetAsync($"/api/trips/{tripId}/stops")).ReadJsonAsync();
        var weather = list[0].GetProperty("weather");

        Assert.Equal(3, weather.GetProperty("weatherCode").GetInt32());
        Assert.Equal(12.5, weather.GetProperty("temperatureMax").GetDouble());
        Assert.Equal(4.0, weather.GetProperty("temperatureMin").GetDouble());
        Assert.Equal(0.2, weather.GetProperty("precipitationMm").GetDouble());
    }

    [Fact]
    public async Task GetStops_ForDateBeyondForecastHorizon_HasNoWeather()
    {
        var (user, tripId) = await CreateTripAsync(Day(60), Day(62));
        await user.Client.CreateStopAsync(tripId, "Daleka przyszłość", 50.05, 19.93, Day(61));

        var list = await (await user.Client.GetAsync($"/api/trips/{tripId}/stops")).ReadJsonAsync();

        Assert.Equal(JsonValueKind.Null, list[0].GetProperty("weather").ValueKind);
    }

    [Fact]
    public async Task UpdateStop_ChangingDate_ClearsCachedWeatherAndRefetchesIt()
    {
        var (user, tripId) = await CreateTripAsync(Day(-30), Day(-20));
        var id = (await user.Client.CreateStopAsync(tripId, "Wawel", 50.05, 19.93, Day(-29))).GetProperty("id").GetInt32();
        await user.Client.GetAsync($"/api/trips/{tripId}/stops");

        var response = await user.Client.PutAsJsonAsync(
            $"/api/trips/{tripId}/stops/{id}",
            new { title = "Wawel", latitude = 50.05, longitude = 19.93, date = Day(-25), note = (string?)null });

        await response.ShouldBeAsync(HttpStatusCode.OK);
        Assert.Equal(JsonValueKind.Null, (await response.ReadJsonAsync()).GetProperty("weather").ValueKind);

        var list = await (await user.Client.GetAsync($"/api/trips/{tripId}/stops")).ReadJsonAsync();

        Assert.Equal(12.5, list[0].GetProperty("weather").GetProperty("temperatureMax").GetDouble());
    }

    [Fact]
    public async Task DeleteStop_RemovesItAndItsFiles()
    {
        var (user, tripId) = await CreateTripAsync();
        var id = (await user.Client.CreateStopAsync(tripId, "Wawel", 50.05, 19.93, Day(-10))).GetProperty("id").GetInt32();
        var photo = await user.Client.PostAsync(
            $"/api/trips/{tripId}/stops/{id}/photos",
            ApiHelpers.FileContent(TestFiles.Png(), "1.png", "files"));
        var photoPath = Path.Combine(_factory.WebRoot,
            (await photo.ReadJsonAsync())[0].GetProperty("url").GetString()!.TrimStart('/'));

        var deleted = await user.Client.DeleteAsync($"/api/trips/{tripId}/stops/{id}");

        await deleted.ShouldBeAsync(HttpStatusCode.NoContent);
        Assert.False(File.Exists(photoPath));
        Assert.Empty((await (await user.Client.GetAsync($"/api/trips/{tripId}/stops")).ReadJsonAsync()).EnumerateArray());
    }

    [Fact]
    public async Task UploadPhotos_ValidImages_AreSavedWithIncreasingSortOrder()
    {
        var (user, tripId) = await CreateTripAsync();
        var id = (await user.Client.CreateStopAsync(tripId, "Wawel", 50.05, 19.93, Day(-10))).GetProperty("id").GetInt32();
        var content = new MultipartFormDataContent();
        content.Add(new ByteArrayContent(TestFiles.Png()), "files", "1.png");
        content.Add(new ByteArrayContent(TestFiles.Jpeg()), "files", "2.jpg");

        var response = await user.Client.PostAsync($"/api/trips/{tripId}/stops/{id}/photos", content);

        await response.ShouldBeAsync(HttpStatusCode.OK);

        var photos = await response.ReadJsonAsync();

        Assert.Equal(2, photos.GetArrayLength());
        Assert.Equal(new[] { 1, 2 }, photos.EnumerateArray().Select(p => p.GetProperty("sortOrder").GetInt32()));
        Assert.All(photos.EnumerateArray(), p =>
            Assert.True(File.Exists(Path.Combine(_factory.WebRoot, p.GetProperty("url").GetString()!.TrimStart('/')))));
    }

    [Fact]
    public async Task UploadPhotos_NotAnImage_IsRejectedAndNothingIsKept()
    {
        var (user, tripId) = await CreateTripAsync();
        var id = (await user.Client.CreateStopAsync(tripId, "Wawel", 50.05, 19.93, Day(-10))).GetProperty("id").GetInt32();
        var content = new MultipartFormDataContent();
        content.Add(new ByteArrayContent(TestFiles.Png()), "files", "dobre.png");
        content.Add(new ByteArrayContent(TestFiles.Text()), "files", "zle.png");

        var response = await user.Client.PostAsync($"/api/trips/{tripId}/stops/{id}/photos", content);

        await response.ShouldBeAsync(HttpStatusCode.BadRequest);

        var stops = await (await user.Client.GetAsync($"/api/trips/{tripId}/stops")).ReadJsonAsync();

        Assert.Equal(0, stops[0].GetProperty("photos").GetArrayLength());
    }

    [Fact]
    public async Task UploadPhotos_NoFiles_IsRejected()
    {
        var (user, tripId) = await CreateTripAsync();
        var id = (await user.Client.CreateStopAsync(tripId, "Wawel", 50.05, 19.93, Day(-10))).GetProperty("id").GetInt32();

        var response = await user.Client.PostAsync($"/api/trips/{tripId}/stops/{id}/photos", new MultipartFormDataContent());

        await response.ShouldBeAsync(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task UploadPhotos_MoreThan20PerStop_IsRejected()
    {
        var (user, tripId) = await CreateTripAsync();
        var id = (await user.Client.CreateStopAsync(tripId, "Wawel", 50.05, 19.93, Day(-10))).GetProperty("id").GetInt32();
        var content = new MultipartFormDataContent();

        for (var i = 0; i < 21; i++)
        {
            content.Add(new ByteArrayContent(TestFiles.Png()), "files", $"{i}.png");
        }

        var response = await user.Client.PostAsync($"/api/trips/{tripId}/stops/{id}/photos", content);

        await response.ShouldBeAsync(HttpStatusCode.BadRequest);
        Assert.Contains("maksymalnie 20", (await response.ReadJsonAsync()).GetProperty("message").GetString());
    }

    [Fact]
    public async Task UploadPhotos_ToAnotherUsersStop_IsNotFound()
    {
        var (owner, tripId) = await CreateTripAsync();
        var id = (await owner.Client.CreateStopAsync(tripId, "Wawel", 50.05, 19.93, Day(-10))).GetProperty("id").GetInt32();
        var intruder = await _factory.CreateUserAsync();

        var response = await intruder.Client.PostAsync(
            $"/api/trips/{tripId}/stops/{id}/photos",
            ApiHelpers.FileContent(TestFiles.Png(), "1.png", "files"));

        await response.ShouldBeAsync(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task DeletePhoto_RemovesRecordAndFile_AndSecondDeleteIsNotFound()
    {
        var (user, tripId) = await CreateTripAsync();
        var id = (await user.Client.CreateStopAsync(tripId, "Wawel", 50.05, 19.93, Day(-10))).GetProperty("id").GetInt32();
        var photos = await (await user.Client.PostAsync(
            $"/api/trips/{tripId}/stops/{id}/photos",
            ApiHelpers.FileContent(TestFiles.Png(), "1.png", "files"))).ReadJsonAsync();
        var photoId = photos[0].GetProperty("id").GetInt32();
        var path = Path.Combine(_factory.WebRoot, photos[0].GetProperty("url").GetString()!.TrimStart('/'));

        await (await user.Client.DeleteAsync($"/api/trips/{tripId}/stops/{id}/photos/{photoId}")).ShouldBeAsync(HttpStatusCode.NoContent);

        Assert.False(File.Exists(path));
        await (await user.Client.DeleteAsync($"/api/trips/{tripId}/stops/{id}/photos/{photoId}")).ShouldBeAsync(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task UploadRecording_ValidAudio_IsSavedWithDuration()
    {
        var (user, tripId) = await CreateTripAsync();
        var id = (await user.Client.CreateStopAsync(tripId, "Wawel", 50.05, 19.93, Day(-10))).GetProperty("id").GetInt32();

        var response = await user.Client.PostAsync($"/api/trips/{tripId}/stops/{id}/recordings", Recording(TestFiles.Webm(), 12));

        await response.ShouldBeAsync(HttpStatusCode.OK);

        var recording = await response.ReadJsonAsync();

        Assert.Equal(12, recording.GetProperty("durationSeconds").GetInt32());
        Assert.EndsWith(".webm", recording.GetProperty("url").GetString());
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-5)]
    [InlineData(301)]
    public async Task UploadRecording_DurationOutOfRange_IsRejected(int seconds)
    {
        var (user, tripId) = await CreateTripAsync();
        var id = (await user.Client.CreateStopAsync(tripId, "Wawel", 50.05, 19.93, Day(-10))).GetProperty("id").GetInt32();

        var response = await user.Client.PostAsync($"/api/trips/{tripId}/stops/{id}/recordings", Recording(TestFiles.Webm(), seconds));

        await response.ShouldBeAsync(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task UploadRecording_NotAudio_IsRejected()
    {
        var (user, tripId) = await CreateTripAsync();
        var id = (await user.Client.CreateStopAsync(tripId, "Wawel", 50.05, 19.93, Day(-10))).GetProperty("id").GetInt32();

        var response = await user.Client.PostAsync($"/api/trips/{tripId}/stops/{id}/recordings", Recording(TestFiles.Png(), 5));

        await response.ShouldBeAsync(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task UploadRecording_MoreThanTenPerStop_IsRejected()
    {
        var (user, tripId) = await CreateTripAsync();
        var id = (await user.Client.CreateStopAsync(tripId, "Wawel", 50.05, 19.93, Day(-10))).GetProperty("id").GetInt32();

        for (var i = 0; i < 10; i++)
        {
            await (await user.Client.PostAsync($"/api/trips/{tripId}/stops/{id}/recordings", Recording(TestFiles.Webm(), 3)))
                .ShouldBeAsync(HttpStatusCode.OK);
        }

        var response = await user.Client.PostAsync($"/api/trips/{tripId}/stops/{id}/recordings", Recording(TestFiles.Webm(), 3));

        await response.ShouldBeAsync(HttpStatusCode.BadRequest);
        Assert.Contains("maksymalnie 10", (await response.ReadJsonAsync()).GetProperty("message").GetString());
    }

    [Fact]
    public async Task DeleteRecording_RemovesRecordAndFile()
    {
        var (user, tripId) = await CreateTripAsync();
        var id = (await user.Client.CreateStopAsync(tripId, "Wawel", 50.05, 19.93, Day(-10))).GetProperty("id").GetInt32();
        var recording = await (await user.Client.PostAsync(
            $"/api/trips/{tripId}/stops/{id}/recordings", Recording(TestFiles.Webm(), 5))).ReadJsonAsync();
        var recordingId = recording.GetProperty("id").GetInt32();
        var path = Path.Combine(_factory.WebRoot, recording.GetProperty("url").GetString()!.TrimStart('/'));

        await (await user.Client.DeleteAsync($"/api/trips/{tripId}/stops/{id}/recordings/{recordingId}"))
            .ShouldBeAsync(HttpStatusCode.NoContent);

        Assert.False(File.Exists(path));
    }

    [Fact]
    public async Task UploadRecording_ToAnotherUsersStop_IsNotFound()
    {
        var (owner, tripId) = await CreateTripAsync();
        var id = (await owner.Client.CreateStopAsync(tripId, "Wawel", 50.05, 19.93, Day(-10))).GetProperty("id").GetInt32();
        var intruder = await _factory.CreateUserAsync();

        var response = await intruder.Client.PostAsync($"/api/trips/{tripId}/stops/{id}/recordings", Recording(TestFiles.Webm(), 5));

        await response.ShouldBeAsync(HttpStatusCode.NotFound);
    }

    private static MultipartFormDataContent Recording(byte[] bytes, int durationSeconds)
    {
        var content = ApiHelpers.FileContent(bytes, "nagranie.webm");
        content.Add(new StringContent(durationSeconds.ToString()), "durationSeconds");

        return content;
    }
}
