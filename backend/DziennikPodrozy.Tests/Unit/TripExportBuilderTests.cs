using System.IO.Compression;
using System.Text;
using System.Text.Json;
using DziennikPodrozy.Api.DTOs;
using DziennikPodrozy.Api.Models;
using DziennikPodrozy.Api.Services;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.FileProviders;

namespace DziennikPodrozy.Tests.Unit;

public class TripExportBuilderTests
{
    private static readonly DateOnly Start = new(2026, 12, 20);

    private static Trip CreateTrip(Action<Trip>? configure = null)
    {
        var trip = new Trip
        {
            Title = "Wypad do Krakowa",
            Description = "Intensywnie",
            StartDate = Start,
            EndDate = Start.AddDays(2),
            Status = TripStatus.Finished,
            NextTimeNote = "Wybrać się wcześniej",
            IsDescribed = true
        };

        configure?.Invoke(trip);

        return trip;
    }

    private static TripStop CreateStop(string title, DateOnly date, Action<TripStop>? configure = null)
    {
        var stop = new TripStop
        {
            Title = title,
            Latitude = 50.0540,
            Longitude = 19.9354,
            Date = date,
            CountryCode = "PL"
        };

        configure?.Invoke(stop);

        return stop;
    }

    private static string ReadText(byte[] bytes)
    {
        return Encoding.UTF8.GetString(bytes, 3, bytes.Length - 3);
    }

    [Fact]
    public void BuildFileName_AppendsFormatAndKeepsPolishLetters()
    {
        var name = TripExportBuilder.BuildFileName(CreateTrip(), "txt");

        Assert.Equal("Wypad do Krakowa - dane podróży.txt", name);
    }

    [Fact]
    public void BuildFileName_RemovesCharactersInvalidInFileNames()
    {
        var name = TripExportBuilder.BuildFileName(CreateTrip(t => t.Title = "Lato: Rzym/Neapol?"), "json");

        Assert.Equal("Lato RzymNeapol - dane podróży.json", name);
    }

    [Fact]
    public void BuildFileName_EmptyTitleFallsBack()
    {
        var name = TripExportBuilder.BuildFileName(CreateTrip(t => t.Title = "???"), "zip");

        Assert.Equal("podroz - dane podróży.zip", name);
    }

    [Fact]
    public void Build_GroupsStopsIntoDaysWithContinuousNumbering()
    {
        var stops = new List<TripStop>
        {
            CreateStop("Wawel", Start),
            CreateStop("Rynek", Start),
            CreateStop("Kopalnia", Start.AddDays(2))
        };

        var export = TripExportBuilder.Build(CreateTrip(), stops, new Dictionary<DateOnly, string>(), false).Export;

        Assert.Equal(2, export.Days.Count);
        Assert.Equal(1, export.Days[0].DayNumber);
        Assert.Equal(3, export.Days[1].DayNumber);
        Assert.Equal(new[] { 1, 2 }, export.Days[0].Stops.Select(s => s.Number));
        Assert.Equal(3, export.Days[1].Stops.Single().Number);
    }

    [Fact]
    public void Build_IncludesDayNoteForDayWithoutStops_InDateOrder()
    {
        var stops = new List<TripStop> { CreateStop("Wawel", Start.AddDays(1)) };
        var notes = new Dictionary<DateOnly, string> { [Start] = "Dojazd" };

        var export = TripExportBuilder.Build(CreateTrip(), stops, notes, false).Export;

        Assert.Equal(new[] { Start, Start.AddDays(1) }, export.Days.Select(d => d.Date));
        Assert.Equal("Dojazd", export.Days[0].Note);
        Assert.Empty(export.Days[0].Stops);
    }

    [Fact]
    public void Build_ConvertsHtmlEntryToPlainText()
    {
        var html = "<p>Cudne <strong>zwierzątka</strong>!</p><ul><li>słonie</li><li>pingwiny</li></ul><p>Tom &amp; Jerry</p>";
        var stops = new List<TripStop> { CreateStop("Zoo", Start, s => s.Note = html) };

        var stop = TripExportBuilder.Build(CreateTrip(), stops, new Dictionary<DateOnly, string>(), false)
            .Export.Days.Single().Stops.Single();

        Assert.Equal("Cudne zwierzątka!\n- słonie\n- pingwiny\n\nTom & Jerry", stop.Entry);
        Assert.Equal(html, stop.EntryHtml);
    }

    [Fact]
    public void Build_EmptyNote_GivesNoEntry()
    {
        var stops = new List<TripStop> { CreateStop("Zoo", Start, s => s.Note = "<p></p>") };

        var stop = TripExportBuilder.Build(CreateTrip(), stops, new Dictionary<DateOnly, string>(), false)
            .Export.Days.Single().Stops.Single();

        Assert.Null(stop.Entry);
    }

    [Theory]
    [InlineData(0, "Bezchmurnie")]
    [InlineData(3, "Pochmurno")]
    [InlineData(45, "Mgła")]
    [InlineData(53, "Mżawka")]
    [InlineData(63, "Deszcz")]
    [InlineData(73, "Śnieg")]
    [InlineData(81, "Przelotny deszcz")]
    [InlineData(95, "Burza")]
    [InlineData(99, "Burza")]
    public void Build_DescribesWeatherInPolish(int code, string expected)
    {
        var stops = new List<TripStop>
        {
            CreateStop("Wawel", Start, s =>
            {
                s.WeatherCode = code;
                s.TemperatureMax = 10;
                s.TemperatureMin = 2;
            })
        };

        var weather = TripExportBuilder.Build(CreateTrip(), stops, new Dictionary<DateOnly, string>(), false)
            .Export.Days.Single().Stops.Single().Weather;

        Assert.NotNull(weather);
        Assert.Equal(expected, weather.Description);
    }

    [Fact]
    public void Build_WithoutFiles_LeavesFileNamesEmptyAndListsNoFiles()
    {
        var stops = new List<TripStop> { CreateStop("Wawel", Start, WithMedia) };

        var result = TripExportBuilder.Build(CreateTrip(t => t.CoverPhotoUrl = "/trip-covers/x.jpg"), stops,
            new Dictionary<DateOnly, string>(), false);

        var stop = result.Export.Days.Single().Stops.Single();

        Assert.Empty(result.Files);
        Assert.All(stop.Photos, photo => Assert.Null(photo.File));
        Assert.All(stop.Recordings, recording => Assert.Null(recording.File));
        Assert.True(result.Export.Trip.HasCoverPhoto);
        Assert.Null(result.Export.Trip.CoverPhotoFile);
    }

    [Fact]
    public void Build_WithFiles_UsesReadableNamesAndListsFilesToCopy()
    {
        var stops = new List<TripStop>
        {
            CreateStop("Ogród Zoologiczny w Krakowie", Start.AddDays(2), WithMedia)
        };

        var result = TripExportBuilder.Build(CreateTrip(t => t.CoverPhotoUrl = "/trip-covers/x.jpg"), stops,
            new Dictionary<DateOnly, string>(), true);

        var stop = result.Export.Days.Single().Stops.Single();

        Assert.Equal("zdjecia/dzien-3_01-ogrod-zoologiczny-w-krakowie_1.jpg", stop.Photos[0].File);
        Assert.Equal("zdjecia/dzien-3_01-ogrod-zoologiczny-w-krakowie_2.png", stop.Photos[1].File);
        Assert.Equal("nagrania/dzien-3_01-ogrod-zoologiczny-w-krakowie_1.webm", stop.Recordings[0].File);
        Assert.Equal("zdjecie-glowne.jpg", result.Export.Trip.CoverPhotoFile);

        Assert.Equal(4, result.Files.Count);
        Assert.Contains(result.Files, f => f.StoredUrl == "/stop-photos/a.jpg" && f.EntryName == stop.Photos[0].File);
    }

    [Theory]
    [InlineData("Łódź", "lodz")]
    [InlineData("Plac Mariacki", "plac-mariacki")]
    [InlineData("!!!", "przystanek")]
    public void Build_WithFiles_SlugifiesPolishTitles(string title, string expectedSlug)
    {
        var stops = new List<TripStop> { CreateStop(title, Start, WithMedia) };

        var result = TripExportBuilder.Build(CreateTrip(), stops, new Dictionary<DateOnly, string>(), true);

        Assert.Contains($"dzien-1_01-{expectedSlug}_1", result.Export.Days.Single().Stops.Single().Photos[0].File);
    }

    [Fact]
    public void Build_WithFiles_LongTitlesAreShortened()
    {
        var stops = new List<TripStop> { CreateStop(new string('a', 100), Start, WithMedia) };

        var file = TripExportBuilder.Build(CreateTrip(), stops, new Dictionary<DateOnly, string>(), true)
            .Export.Days.Single().Stops.Single().Photos[0].File!;

        Assert.True(file.Length < 80);
    }

    [Fact]
    public void ToJsonBytes_IsCamelCaseKeepsPolishLettersAndOmitsNulls()
    {
        var stops = new List<TripStop> { CreateStop("Ogród", Start, WithMedia) };
        var export = TripExportBuilder.Build(CreateTrip(), stops, new Dictionary<DateOnly, string>(), false).Export;

        var json = Encoding.UTF8.GetString(TripExportBuilder.ToJsonBytes(export));
        using var document = JsonDocument.Parse(json);
        var stop = document.RootElement.GetProperty("days")[0].GetProperty("stops")[0];

        Assert.Contains("Ogród", json);
        Assert.Equal("PL", stop.GetProperty("countryCode").GetString());
        Assert.False(stop.GetProperty("photos")[0].TryGetProperty("file", out _));
        Assert.Equal("Wypad do Krakowa", document.RootElement.GetProperty("trip").GetProperty("title").GetString());
    }

    [Fact]
    public void ToTextBytes_StartsWithByteOrderMarkSoWindowsNotepadReadsPolishLetters()
    {
        var export = TripExportBuilder.Build(CreateTrip(), new List<TripStop>(), new Dictionary<DateOnly, string>(), false).Export;

        var bytes = TripExportBuilder.ToTextBytes(export);

        Assert.Equal(new byte[] { 0xEF, 0xBB, 0xBF }, bytes.Take(3).ToArray());
    }

    [Fact]
    public void ToTextBytes_ContainsReadableTripDaysAndStops()
    {
        var stops = new List<TripStop>
        {
            CreateStop("Wawel", Start, s =>
            {
                s.Note = "<p>Zamek i katedra</p>";
                s.WeatherCode = 3;
                s.TemperatureMax = 5.5;
                s.TemperatureMin = -1;
                s.PrecipitationMm = 0;
            })
        };
        var notes = new Dictionary<DateOnly, string> { [Start] = "Intensywny dzień" };

        var text = ReadText(TripExportBuilder.ToTextBytes(
            TripExportBuilder.Build(CreateTrip(), stops, notes, false).Export));

        Assert.Contains("Tytuł: Wypad do Krakowa", text);
        Assert.Contains("Motto: Intensywnie", text);
        Assert.Contains("Daty: 2026-12-20 do 2026-12-22", text);
        Assert.Contains("Status: zakończona", text);
        Assert.Contains("Dziennik opisany: tak", text);
        Assert.Contains("DZIEŃ 1 (2026-12-20)", text);
        Assert.Contains("Podsumowanie dnia: Intensywny dzień", text);
        Assert.Contains("[1] Wawel", text);
        Assert.Contains("Współrzędne: 50.0540, 19.9354", text);
        Assert.Contains("Kraj: PL", text);
        Assert.Contains("Pogoda: Pochmurno, maks. 5.5 °C, min. -1 °C, opad 0 mm", text);
        Assert.Contains("Zamek i katedra", text);
        Assert.Contains("NA NASTĘPNY RAZ", text);
        Assert.Contains("Wybrać się wcześniej", text);
    }

    [Fact]
    public void ToTextBytes_WithoutFiles_ShowsCountsInsteadOfFileNames()
    {
        var stops = new List<TripStop> { CreateStop("Wawel", Start, WithMedia) };

        var text = ReadText(TripExportBuilder.ToTextBytes(
            TripExportBuilder.Build(CreateTrip(), stops, new Dictionary<DateOnly, string>(), false).Export));

        Assert.Contains("Zdjęcia: 2", text);
        Assert.Contains("Nagrania: 1", text);
        Assert.Contains("0:05", text);
        Assert.DoesNotContain("zdjecia/", text);
        Assert.DoesNotContain("http", text);
    }

    [Fact]
    public void ToTextBytes_WithFiles_ListsFileNames()
    {
        var stops = new List<TripStop> { CreateStop("Wawel", Start, WithMedia) };

        var text = ReadText(TripExportBuilder.ToTextBytes(
            TripExportBuilder.Build(CreateTrip(), stops, new Dictionary<DateOnly, string>(), true).Export));

        Assert.Contains("zdjecia/dzien-1_01-wawel_1.jpg | Widok z wieży", text);
        Assert.Contains("nagrania/dzien-1_01-wawel_1.webm, 0:05", text);
    }

    [Fact]
    public async Task ToZipBytesAsync_ContainsTextJsonAndCopiedFiles()
    {
        var root = Path.Combine(Path.GetTempPath(), "dziennik-zip-" + Guid.NewGuid().ToString("N"));
        Directory.CreateDirectory(Path.Combine(root, "stop-photos"));
        Directory.CreateDirectory(Path.Combine(root, "stop-recordings"));

        try
        {
            var photoBytes = new byte[] { 1, 2, 3, 4, 5 };
            var audioBytes = new byte[] { 9, 8, 7 };
            await File.WriteAllBytesAsync(Path.Combine(root, "stop-photos", "a.jpg"), photoBytes);
            await File.WriteAllBytesAsync(Path.Combine(root, "stop-recordings", "r.webm"), audioBytes);

            var stops = new List<TripStop>
            {
                CreateStop("Wawel", Start, s =>
                {
                    s.Photos.Add(new StopPhoto { Url = "/stop-photos/a.jpg", SortOrder = 1 });
                    s.Photos.Add(new StopPhoto { Url = "/stop-photos/brak.jpg", SortOrder = 2 });
                    s.Recordings.Add(new StopRecording { Url = "/stop-recordings/r.webm", DurationSeconds = 3, CreatedAt = DateTime.UtcNow });
                })
            };

            var result = TripExportBuilder.Build(CreateTrip(), stops, new Dictionary<DateOnly, string>(), true);
            var storage = new FileStorageService(new TestEnvironment(root));

            var zipBytes = await TripExportBuilder.ToZipBytesAsync(result, storage);

            using var archive = new ZipArchive(new MemoryStream(zipBytes));
            var names = archive.Entries.Select(e => e.FullName).ToList();

            Assert.Contains("dziennik.txt", names);
            Assert.Contains("dane.json", names);
            Assert.Contains("zdjecia/dzien-1_01-wawel_1.jpg", names);
            Assert.Contains("nagrania/dzien-1_01-wawel_1.webm", names);
            Assert.DoesNotContain("zdjecia/dzien-1_01-wawel_2.jpg", names);

            using var photoEntry = archive.GetEntry("zdjecia/dzien-1_01-wawel_1.jpg")!.Open();
            using var copy = new MemoryStream();
            photoEntry.CopyTo(copy);

            Assert.Equal(photoBytes, copy.ToArray());
        }
        finally
        {
            Directory.Delete(root, recursive: true);
        }
    }

    private static void WithMedia(TripStop stop)
    {
        stop.Photos.Add(new StopPhoto { Url = "/stop-photos/a.jpg", Caption = "Widok z wieży", SortOrder = 1 });
        stop.Photos.Add(new StopPhoto { Url = "/stop-photos/b.png", SortOrder = 2 });
        stop.Recordings.Add(new StopRecording
        {
            Url = "/stop-recordings/r.webm",
            DurationSeconds = 5,
            CreatedAt = new DateTime(2026, 10, 24, 22, 3, 0)
        });
    }

    private class TestEnvironment : IWebHostEnvironment
    {
        public TestEnvironment(string root)
        {
            WebRootPath = root;
            ContentRootPath = root;
        }

        public string WebRootPath { get; set; }
        public IFileProvider WebRootFileProvider { get; set; } = new NullFileProvider();
        public string ApplicationName { get; set; } = "Tests";
        public IFileProvider ContentRootFileProvider { get; set; } = new NullFileProvider();
        public string ContentRootPath { get; set; }
        public string EnvironmentName { get; set; } = "Testing";
    }
}
