using System.Globalization;
using System.Net;
using System.Text;
using System.Text.Encodings.Web;
using System.Text.Json;
using System.Text.RegularExpressions;
using DziennikPodrozy.Api.DTOs;
using DziennikPodrozy.Api.Models;

namespace DziennikPodrozy.Api.Services;

public static class TripExportBuilder
{
    public static TripExportDto Build(
        Trip trip,
        List<TripStop> stops,
        Dictionary<DateOnly, string> dayNotes,
        string baseUrl)
    {
        var days = new List<ExportDayDto>();
        var number = 0;

        foreach (var group in stops.GroupBy(s => s.Date))
        {
            var exportStops = new List<ExportStopDto>();

            foreach (var stop in group)
            {
                number++;
                exportStops.Add(ToStopDto(stop, number, baseUrl));
            }

            days.Add(new ExportDayDto(
                group.Key,
                DayNumber(trip, group.Key),
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

        var cover = trip.CoverPhotoUrl == null
            ? null
            : new ExportFileDto(Path.GetFileName(trip.CoverPhotoUrl), baseUrl + trip.CoverPhotoUrl, null);

        var exportTrip = new ExportTripDto(
            trip.Title,
            trip.Description,
            trip.StartDate,
            trip.EndDate,
            trip.Status.ToString(),
            trip.IsDescribed,
            trip.NextTimeNote,
            cover);

        return new TripExportDto(DateTime.UtcNow, exportTrip, days.OrderBy(d => d.Date).ToList());
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
            Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping
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

        if (trip.CoverPhoto != null)
        {
            text.AppendLine($"Zdjęcie główne: {trip.CoverPhoto.FileName} ({trip.CoverPhoto.Url})");
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

        if (stop.Photos.Count > 0)
        {
            text.AppendLine("  Zdjęcia:");

            foreach (var photo in stop.Photos)
            {
                var caption = string.IsNullOrWhiteSpace(photo.Caption) ? "" : $" | {photo.Caption}";

                text.AppendLine($"    - {photo.FileName} ({photo.Url}){caption}");
            }
        }

        if (stop.Recordings.Count > 0)
        {
            text.AppendLine("  Nagrania:");

            foreach (var recording in stop.Recordings)
            {
                var duration = $"{recording.DurationSeconds / 60}:{recording.DurationSeconds % 60:00}";

                text.AppendLine(
                    $"    - {recording.FileName}, {duration}, nagrano {recording.RecordedAt:yyyy-MM-dd HH:mm} UTC ({recording.Url})");
            }
        }
    }

    private static ExportStopDto ToStopDto(TripStop stop, int number, string baseUrl)
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

        var photos = stop.Photos
            .OrderBy(p => p.SortOrder)
            .Select(p => new ExportFileDto(Path.GetFileName(p.Url), baseUrl + p.Url, p.Caption))
            .ToList();

        var recordings = stop.Recordings
            .OrderBy(r => r.CreatedAt)
            .Select(r => new ExportRecordingDto(
                Path.GetFileName(r.Url),
                baseUrl + r.Url,
                r.DurationSeconds,
                r.CreatedAt))
            .ToList();

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