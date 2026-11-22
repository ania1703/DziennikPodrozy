using System.IO.Compression;
using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using DziennikPodrozy.Tests.Infrastructure;

namespace DziennikPodrozy.Tests.Api;

[Collection(ApiCollection.Name)]
public class ExportApiTests
{
    private static readonly byte[] CoverBytes = TestFiles.Png(40, fill: 5);
    private static readonly byte[] PhotoBytes = TestFiles.Png(40, fill: 7);
    private static readonly byte[] AudioBytes = TestFiles.Webm(40);

    private readonly ApiFactory _factory;

    public ExportApiTests(ApiFactory factory)
    {
        _factory = factory;
    }

    private static string Day(int offset) => ApiHelpers.DaysFromToday(offset);

    private async Task<(TestUser User, int TripId)> CreateRichTripAsync()
    {
        var user = await _factory.CreateUserAsync();
        var trip = await user.Client.CreateTripAsync("Wypad do Krakowa", Day(-10), Day(-8), "Finished", "Intensywnie");
        var tripId = trip.GetProperty("id").GetInt32();

        var wawel = await user.Client.CreateStopAsync(tripId, "Wawel", 50.054, 19.9354, Day(-10), "<p>Zamek i <strong>katedra</strong></p>");
        var rynek = await user.Client.CreateStopAsync(tripId, "Rynek Główny", 50.0617, 19.9373, Day(-10));

        await user.Client.PostAsync($"/api/trips/{tripId}/cover-photo", ApiHelpers.FileContent(CoverBytes, "okladka.png"));
        await user.Client.PostAsync(
            $"/api/trips/{tripId}/stops/{rynek.GetProperty("id").GetInt32()}/photos",
            ApiHelpers.FileContent(PhotoBytes, "rynek.png", "files"));

        var recording = ApiHelpers.FileContent(AudioBytes, "nagranie.webm");
        recording.Add(new StringContent("5"), "durationSeconds");
        await user.Client.PostAsync($"/api/trips/{tripId}/stops/{wawel.GetProperty("id").GetInt32()}/recordings", recording);

        await user.Client.PutAsJsonAsync($"/api/trips/{tripId}/day-notes/{Day(-10)}", new { text = "Intensywny dzień" });
        await user.Client.PutAsJsonAsync($"/api/trips/{tripId}/next-time-note", new { text = "Wyjechać wcześniej" });

        return (user, tripId);
    }

    [Fact]
    public async Task Export_Text_IsReadableAndPlain()
    {
        var (user, tripId) = await CreateRichTripAsync();

        var response = await user.Client.GetAsync($"/api/trips/{tripId}/export?format=txt");

        await response.ShouldBeAsync(HttpStatusCode.OK);
        Assert.Equal("text/plain", response.Content.Headers.ContentType!.MediaType);
        Assert.Equal("Wypad do Krakowa - dane podróży.txt", response.Content.Headers.ContentDisposition!.FileNameStar);

        var text = await response.Content.ReadAsStringAsync();

        Assert.Contains("Tytuł: Wypad do Krakowa", text);
        Assert.Contains("Motto: Intensywnie", text);
        Assert.Contains("Status: zakończona", text);
        Assert.Contains("Podsumowanie dnia: Intensywny dzień", text);
        Assert.Contains("[1] Wawel", text);
        Assert.Contains("[2] Rynek Główny", text);
        Assert.Contains("Kraj: PL", text);
        Assert.Contains("Zamek i katedra", text);
        Assert.DoesNotContain("<strong>", text);
        Assert.Contains("Zdjęcia: 1", text);
        Assert.Contains("Nagrania: 1", text);
        Assert.Contains("NA NASTĘPNY RAZ", text);
        Assert.Contains("Wyjechać wcześniej", text);
        Assert.DoesNotContain("localhost", text);
    }

    [Fact]
    public async Task Export_Json_HasStructuredData()
    {
        var (user, tripId) = await CreateRichTripAsync();

        var response = await user.Client.GetAsync($"/api/trips/{tripId}/export?format=json");

        await response.ShouldBeAsync(HttpStatusCode.OK);
        Assert.Equal("application/json", response.Content.Headers.ContentType!.MediaType);

        var json = await response.ReadJsonAsync();
        var stop = json.GetProperty("days")[0].GetProperty("stops")[0];

        Assert.Equal("Wypad do Krakowa", json.GetProperty("trip").GetProperty("title").GetString());
        Assert.True(json.GetProperty("trip").GetProperty("hasCoverPhoto").GetBoolean());
        Assert.Equal("Intensywny dzień", json.GetProperty("days")[0].GetProperty("note").GetString());
        Assert.Equal("Wawel", stop.GetProperty("title").GetString());
        Assert.Equal("PL", stop.GetProperty("countryCode").GetString());
        Assert.Equal("Zamek i katedra", stop.GetProperty("entry").GetString());
        Assert.Equal("<p>Zamek i <strong>katedra</strong></p>", stop.GetProperty("entryHtml").GetString());
        Assert.Equal(5, stop.GetProperty("recordings")[0].GetProperty("durationSeconds").GetInt32());
        Assert.False(stop.GetProperty("recordings")[0].TryGetProperty("file", out _));
    }

    [Fact]
    public async Task Export_WithoutFormat_DefaultsToJson()
    {
        var (user, tripId) = await CreateRichTripAsync();

        var response = await user.Client.GetAsync($"/api/trips/{tripId}/export");

        await response.ShouldBeAsync(HttpStatusCode.OK);
        Assert.Equal("application/json", response.Content.Headers.ContentType!.MediaType);
    }

    [Fact]
    public async Task Export_Zip_ContainsDataFilesAndMediaWithReadableNames()
    {
        var (user, tripId) = await CreateRichTripAsync();

        var response = await user.Client.GetAsync($"/api/trips/{tripId}/export?format=zip");

        await response.ShouldBeAsync(HttpStatusCode.OK);
        Assert.Equal("application/zip", response.Content.Headers.ContentType!.MediaType);
        Assert.Equal("Wypad do Krakowa - dane podróży.zip", response.Content.Headers.ContentDisposition!.FileNameStar);

        using var archive = new ZipArchive(new MemoryStream(await response.Content.ReadAsByteArrayAsync()));
        var names = archive.Entries.Select(e => e.FullName).ToList();

        Assert.Contains("dziennik.txt", names);
        Assert.Contains("dane.json", names);
        Assert.Contains("zdjecie-glowne.png", names);
        Assert.Contains("zdjecia/dzien-1_02-rynek-glowny_1.png", names);
        Assert.Contains("nagrania/dzien-1_01-wawel_1.webm", names);

        Assert.Equal(CoverBytes, ReadEntry(archive, "zdjecie-glowne.png"));
        Assert.Equal(PhotoBytes, ReadEntry(archive, "zdjecia/dzien-1_02-rynek-glowny_1.png"));
        Assert.Equal(AudioBytes, ReadEntry(archive, "nagrania/dzien-1_01-wawel_1.webm"));
    }

    [Fact]
    public async Task Export_Zip_TextFileReferencesTheFilesInsideTheArchive()
    {
        var (user, tripId) = await CreateRichTripAsync();

        var response = await user.Client.GetAsync($"/api/trips/{tripId}/export?format=zip");

        using var archive = new ZipArchive(new MemoryStream(await response.Content.ReadAsByteArrayAsync()));
        var text = System.Text.Encoding.UTF8.GetString(ReadEntry(archive, "dziennik.txt"));
        var json = JsonDocument.Parse(ReadEntry(archive, "dane.json")).RootElement;

        Assert.Contains("zdjecia/dzien-1_02-rynek-glowny_1.png", text);
        Assert.Contains("nagrania/dzien-1_01-wawel_1.webm", text);
        Assert.Equal(
            "zdjecia/dzien-1_02-rynek-glowny_1.png",
            json.GetProperty("days")[0].GetProperty("stops")[1].GetProperty("photos")[0].GetProperty("file").GetString());
    }

    [Fact]
    public async Task Export_Zip_OfTripWithoutMedia_StillWorks()
    {
        var user = await _factory.CreateUserAsync();
        var tripId = (await user.Client.CreateTripAsync()).GetProperty("id").GetInt32();

        var response = await user.Client.GetAsync($"/api/trips/{tripId}/export?format=zip");

        await response.ShouldBeAsync(HttpStatusCode.OK);

        using var archive = new ZipArchive(new MemoryStream(await response.Content.ReadAsByteArrayAsync()));

        Assert.Equal(new[] { "dane.json", "dziennik.txt" }, archive.Entries.Select(e => e.FullName).OrderBy(n => n));
    }

    [Theory]
    [InlineData("pdf")]
    [InlineData("xml")]
    [InlineData("TXT")]
    public async Task Export_UnsupportedFormat_IsRejected(string format)
    {
        var (user, tripId) = await CreateRichTripAsync();

        var response = await user.Client.GetAsync($"/api/trips/{tripId}/export?format={format}");

        await response.ShouldBeAsync(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Export_OfAnotherUsersTrip_IsNotFound()
    {
        var (_, tripId) = await CreateRichTripAsync();
        var intruder = await _factory.CreateUserAsync();

        await (await intruder.Client.GetAsync($"/api/trips/{tripId}/export?format=txt")).ShouldBeAsync(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task Export_WithoutToken_IsUnauthorized()
    {
        await (await _factory.CreateClient().GetAsync("/api/trips/1/export?format=txt")).ShouldBeAsync(HttpStatusCode.Unauthorized);
    }

    private static byte[] ReadEntry(ZipArchive archive, string name)
    {
        using var stream = archive.GetEntry(name)!.Open();
        using var memory = new MemoryStream();
        stream.CopyTo(memory);

        return memory.ToArray();
    }
}
