using System.Globalization;
using System.IO.Compression;
using System.Net;
using System.Text;
using System.Text.Encodings.Web;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Text.RegularExpressions;
using DziennikPodrozy.Api.DTOs;
using DziennikPodrozy.Api.Models;

namespace DziennikPodrozy.Api.Services;

public static class TripExportBuilder
{
    public static TripExportResult Build(
        Trip trip,
        List<TripStop> stops,
        Dictionary<DateOnly, string> dayNotes,
        bool withFiles)
    {
        var files = new List<ExportedFile>();
        var days = new List<ExportDayDto>();
        var number = 0;

        foreach (var group in stops.GroupBy(s => s.Date))
        {
            var dayNumber = DayNumber(trip, group.Key);
            var exportStops = new List<ExportStopDto>();

            foreach (var stop in group)
            {
                number++;
                exportStops.Add(ToStopDto(stop, number, dayNumber, withFiles, files));
            }

            days.Add(new ExportDayDto(
                group.Key,
                dayNumber,
                dayNotes.GetValueOrDefault(group.Key),
                exportStops));
        }

        foreach (var (date, text) in dayNotes)
        {
            if (days.All(d => d.Date != date))
            {
                days.Add(new ExportDayDto(date, DayNumber(trip, date), text, new List<ExportStopDto>()));
            }
        }

        string? coverFile = null;

        if (withFiles && trip.CoverPhotoUrl != null)
        {
            coverFile = $"zdjecie-glowne{Path.GetExtension(trip.CoverPhotoUrl)}";
            files.Add(new ExportedFile(trip.CoverPhotoUrl, coverFile));
        }

        var exportTrip = new ExportTripDto(
            trip.Title,
            trip.Description,
            trip.StartDate,
            trip.EndDate,
            trip.Status.ToString(),
            trip.IsDescribed,
            trip.NextTimeNote,
            trip.CoverPhotoUrl != null,
            coverFile);

        var export = new TripExportDto(DateTime.UtcNow, exportTrip, days.OrderBy(d => d.Date).ToList());

        return new TripExportResult(export, files);
    }

    public static string BuildFileName(Trip trip, string format)
    {
        var invalid = Path.GetInvalidFileNameChars();
        var safeTitle = new string(trip.Title.Where(c => !invalid.Contains(c)).ToArray()).Trim();

        if (safeTitle.Length == 0)
        {
            safeTitle = "podroz";
        }

        return $"{safeTitle} - dane podróży.{format}";
    }

    public static byte[] ToJsonBytes(TripExportDto export)
    {
        var options = new JsonSerializerOptions
        {
            WriteIndented = true,
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping,
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
        };

        return JsonSerializer.SerializeToUtf8Bytes(export, options);
    }

    public static byte[] ToTextBytes(TripExportDto export)
    {
        var text = new StringBuilder();
        var trip = export.Trip;

        text.AppendLine("DZIENNIK PODRÓŻY, EKSPORT DANYCH");
        text.AppendLine($"Wyeksportowano: {export.ExportedAt:yyyy-MM-dd HH:mm} UTC");
        text.AppendLine();
        text.AppendLine("PODRÓŻ");
        text.AppendLine($"Tytuł: {trip.Title}");

        if (!string.IsNullOrWhiteSpace(trip.Motto))
        {
            text.AppendLine($"Motto: {trip.Motto}");
        }

        text.AppendLine($"Daty: {FormatDates(trip.StartDate, trip.EndDate)}");
        text.AppendLine($"Status: {StatusLabel(trip.Status)}");
        text.AppendLine($"Dziennik opisany: {(trip.IsDescribed ? "tak" : "nie")}");

        if (trip.HasCoverPhoto)
        {
            text.AppendLine($"Zdjęcie główne: {trip.CoverPhotoFile ?? "tak"}");
        }

        foreach (var day in export.Days)
        {
            text.AppendLine();
            text.AppendLine(new string('=', 60));
            text.AppendLine($"DZIEŃ {day.DayNumber} ({day.Date:yyyy-MM-dd})");

            if (!string.IsNullOrWhiteSpace(day.Note))
            {
                text.AppendLine($"Podsumowanie dnia: {day.Note}");
            }

            foreach (var stop in day.Stops)
            {
                AppendStop(text, stop);
            }
        }

        if (!string.IsNullOrWhiteSpace(trip.NextTimeNote))
        {
            text.AppendLine();
            text.AppendLine(new string('=', 60));
            text.AppendLine("NA NASTĘPNY RAZ");
            text.AppendLine(trip.NextTimeNote);
        }

        return Encoding.UTF8.GetPreamble().Concat(Encoding.UTF8.GetBytes(text.ToString())).ToArray();
    }

    public static async Task<byte[]> ToZipBytesAsync(TripExportResult result, FileStorageService storage)
    {
        using var memory = new MemoryStream();

        using (var archive = new ZipArchive(memory, ZipArchiveMode.Create, leaveOpen: true))
        {
            await AddBytesAsync(archive, "dziennik.txt", ToTextBytes(result.Export));
            await AddBytesAsync(archive, "dane.json", ToJsonBytes(result.Export));

            foreach (var file in result.Files)
            {
                var path = storage.FindPath(file.StoredUrl);

                if (path == null)
                {
                    continue;
                }

                var entry = archive.CreateEntry(file.EntryName, CompressionLevel.Fastest);

                await using var entryStream = entry.Open();
                await using var source = File.OpenRead(path);
                await source.CopyToAsync(entryStream);
            }
        }

        return memory.ToArray();
    }

    private static async Task AddBytesAsync(ZipArchive archive, string name, byte[] bytes)
    {
        var entry = archive.CreateEntry(name, CompressionLevel.Optimal);

        await using var stream = entry.Open();
        await stream.WriteAsync(bytes);
    }

    private static void AppendStop(StringBuilder text, ExportStopDto stop)
    {
        text.AppendLine();
        text.AppendLine($"[{stop.Number}] {stop.Title}");
        text.AppendLine(
            $"  Współrzędne: {stop.Latitude.ToString("0.0000", CultureInfo.InvariantCulture)}, {stop.Longitude.ToString("0.0000", CultureInfo.InvariantCulture)}");

        if (stop.CountryCode != null)
        {
            text.AppendLine($"  Kraj: {stop.CountryCode}");
        }

        if (stop.Weather != null)
        {
            var weather = stop.Weather;

            text.AppendLine(
                $"  Pogoda: {weather.Description}, maks. {weather.TemperatureMax.ToString("0.#", CultureInfo.InvariantCulture)} °C, min. {weather.TemperatureMin.ToString("0.#", CultureInfo.InvariantCulture)} °C, opad {weather.PrecipitationMm.ToString("0.#", CultureInfo.InvariantCulture)} mm");
        }

        if (!string.IsNullOrWhiteSpace(stop.Entry))
        {
            text.AppendLine("  Wpis:");

            foreach (var line in stop.Entry.Split('\n'))
            {
                text.AppendLine($"    {line.TrimEnd('\r')}");
            }
        }

        AppendPhotos(text, stop.Photos);
        AppendRecordings(text, stop.Recordings);
    }

    private static void AppendPhotos(StringBuilder text, List<ExportPhotoDto> photos)
    {
        if (photos.Count == 0)
        {
            return;
        }

        if (photos.Any(p => p.File != null))
        {
            text.AppendLine("  Zdjęcia:");

            foreach (var photo in photos)
            {
                var caption = string.IsNullOrWhiteSpace(photo.Caption) ? "" : $" | {photo.Caption}";

                text.AppendLine($"    - {photo.File}{caption}");
            }

            return;
        }

        text.AppendLine($"  Zdjęcia: {photos.Count}");

        foreach (var photo in photos.Where(p => !string.IsNullOrWhiteSpace(p.Caption)))
        {
            text.AppendLine($"    - {photo.Caption}");
        }
    }

    private static void AppendRecordings(StringBuilder text, List<ExportRecordingDto> recordings)
    {
        if (recordings.Count == 0)
        {
            return;
        }

        text.AppendLine(recordings.Any(r => r.File != null) ? "  Nagrania:" : $"  Nagrania: {recordings.Count}");

        foreach (var recording in recordings)
        {
            var duration = $"{recording.DurationSeconds / 60}:{recording.DurationSeconds % 60:00}";
            var file = recording.File == null ? "" : $"{recording.File}, ";

            text.AppendLine($"    - {file}{duration}, nagrano {recording.RecordedAt:yyyy-MM-dd HH:mm} UTC");
        }
    }

    private static ExportStopDto ToStopDto(
        TripStop stop,
        int number,
        int dayNumber,
        bool withFiles,
        List<ExportedFile> files)
    {
        var entryHtml = string.IsNullOrWhiteSpace(stop.Note) ? null : stop.Note;
        var entry = entryHtml == null ? null : HtmlToText(entryHtml);

        ExportWeatherDto? weather = null;

        if (stop.WeatherCode.HasValue && stop.TemperatureMax.HasValue && stop.TemperatureMin.HasValue)
        {
            weather = new ExportWeatherDto(
                stop.WeatherCode.Value,
                DescribeWeather(stop.WeatherCode.Value),
                stop.TemperatureMax.Value,
                stop.TemperatureMin.Value,
                stop.PrecipitationMm ?? 0);
        }

        var prefix = $"dzien-{dayNumber}_{number:00}-{Slug(stop.Title)}";
        var photos = new List<ExportPhotoDto>();
        var recordings = new List<ExportRecordingDto>();
        var index = 0;

        foreach (var photo in stop.Photos.OrderBy(p => p.SortOrder))
        {
            index++;
            string? name = null;

            if (withFiles)
            {
                name = $"zdjecia/{prefix}_{index}{Path.GetExtension(photo.Url)}";
                files.Add(new ExportedFile(photo.Url, name));
            }

            photos.Add(new ExportPhotoDto(name, photo.Caption));
        }

        index = 0;

        foreach (var recording in stop.Recordings.OrderBy(r => r.CreatedAt))
        {
            index++;
            string? name = null;

            if (withFiles)
            {
                name = $"nagrania/{prefix}_{index}{Path.GetExtension(recording.Url)}";
                files.Add(new ExportedFile(recording.Url, name));
            }

            recordings.Add(new ExportRecordingDto(name, recording.DurationSeconds, recording.CreatedAt));
        }

        return new ExportStopDto(
            number,
            stop.Title,
            stop.Latitude,
            stop.Longitude,
            stop.CountryCode,
            weather,
            string.IsNullOrWhiteSpace(entry) ? null : entry,
            entryHtml,
            photos,
            recordings);
    }

    private static int DayNumber(Trip trip, DateOnly date)
    {
        return date.DayNumber - trip.StartDate.DayNumber + 1;
    }

    private static string FormatDates(DateOnly start, DateOnly? end)
    {
        return end.HasValue ? $"{start:yyyy-MM-dd} do {end.Value:yyyy-MM-dd}" : $"{start:yyyy-MM-dd}";
    }

    private static string StatusLabel(string status)
    {
        return status switch
        {
            "Planned" => "zaplanowana",
            "InProgress" => "w trakcie",
            "Finished" => "zakończona",
            _ => status
        };
    }

    private static string Slug(string text)
    {
        var normalized = text.ToLowerInvariant().Normalize(NormalizationForm.FormD).Replace('ł', 'l');
        var builder = new StringBuilder();

        foreach (var c in normalized)
        {
            if (CharUnicodeInfo.GetUnicodeCategory(c) == UnicodeCategory.NonSpacingMark)
            {
                continue;
            }

            builder.Append(char.IsAsciiLetterOrDigit(c) ? c : '-');
        }

        var slug = Regex.Replace(builder.ToString(), "-{2,}", "-").Trim('-');

        if (slug.Length > 40)
        {
            slug = slug[..40].Trim('-');
        }

        return slug.Length == 0 ? "przystanek" : slug;
    }

    private static string DescribeWeather(int code)
    {
        return code switch
        {
            0 => "Bezchmurnie",
            1 => "Głównie słonecznie",
            2 => "Częściowe zachmurzenie",
            3 => "Pochmurno",
            45 or 48 => "Mgła",
            >= 51 and <= 57 => "Mżawka",
            >= 61 and <= 67 => "Deszcz",
            >= 71 and <= 77 => "Śnieg",
            >= 80 and <= 82 => "Przelotny deszcz",
            85 or 86 => "Przelotny śnieg",
            >= 95 => "Burza",
            _ => "Zmienna pogoda"
        };
    }

    private static string HtmlToText(string html)
    {
        var text = Regex.Replace(html, @"<\s*br\s*/?\s*>", "\n", RegexOptions.IgnoreCase);
        text = Regex.Replace(text, @"<\s*li[^>]*>", "- ", RegexOptions.IgnoreCase);
        text = Regex.Replace(text, @"</\s*(p|div|li|h[1-6]|ul|ol|blockquote)\s*>", "\n", RegexOptions.IgnoreCase);
        text = Regex.Replace(text, "<[^>]+>", string.Empty);
        text = WebUtility.HtmlDecode(text);
        text = Regex.Replace(text, @"\n{3,}", "\n\n");

        return text.Trim();
    }
}