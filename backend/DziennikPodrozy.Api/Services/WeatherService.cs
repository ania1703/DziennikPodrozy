using System.Globalization;
using System.Text.Json;

namespace DziennikPodrozy.Api.Services;

public record DailyWeather(
    int WeatherCode,
    double TemperatureMax,
    double TemperatureMin,
    double PrecipitationMm);

public class WeatherService
{
    private const int MaxForecastDays = 15;
    private const int ForecastPastDays = 90;
    private const string ForecastUrl = "https://api.open-meteo.com/v1/forecast";
    private const string ArchiveUrl = "https://archive-api.open-meteo.com/v1/archive";

    private readonly HttpClient _httpClient;
    private readonly ILogger<WeatherService> _logger;

    public WeatherService(HttpClient httpClient, ILogger<WeatherService> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
    }

    public static bool IsInRange(DateOnly date)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        return date <= today.AddDays(MaxForecastDays);
    }

    public async Task<DailyWeather?> GetDailyWeatherAsync(
        double latitude,
        double longitude,
        DateOnly date)
    {
        if (!IsInRange(date))
        {
            return null;
        }

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var baseUrl = date >= today.AddDays(-ForecastPastDays) ? ForecastUrl : ArchiveUrl;
        var day = date.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture);

        var url = string.Create(
            CultureInfo.InvariantCulture,
            $"{baseUrl}?latitude={latitude}&longitude={longitude}&start_date={day}&end_date={day}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto");

        try
        {
            using var response = await _httpClient.GetAsync(url);

            if (!response.IsSuccessStatusCode)
            {
                return null;
            }

            await using var stream = await response.Content.ReadAsStreamAsync();
            using var json = await JsonDocument.ParseAsync(stream);
            var daily = json.RootElement.GetProperty("daily");

            var code = ReadNumber(daily, "weather_code");
            var max = ReadNumber(daily, "temperature_2m_max");
            var min = ReadNumber(daily, "temperature_2m_min");
            var precipitation = ReadNumber(daily, "precipitation_sum");

            if (code == null || max == null || min == null)
            {
                return null;
            }

            return new DailyWeather((int)code.Value, max.Value, min.Value, precipitation ?? 0);
        }
        catch (Exception exception) when (
            exception is HttpRequestException
                or TaskCanceledException
                or JsonException
                or KeyNotFoundException
                or InvalidOperationException)
        {
            _logger.LogWarning(exception, "Nie udało się pobrać pogody z Open-Meteo.");

            return null;
        }
    }

    private static double? ReadNumber(JsonElement daily, string name)
    {
        var values = daily.GetProperty(name);

        if (values.GetArrayLength() == 0)
        {
            return null;
        }

        var first = values[0];

        return first.ValueKind == JsonValueKind.Number ? first.GetDouble() : null;
    }
}