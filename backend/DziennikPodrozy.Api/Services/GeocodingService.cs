using System.Globalization;
using System.Text.Json;
using DziennikPodrozy.Api.Models;

namespace DziennikPodrozy.Api.Services;

public class GeocodingService
{
    private const string ReverseUrl = "https://nominatim.openstreetmap.org/reverse";

    private readonly HttpClient _httpClient;
    private readonly ILogger<GeocodingService> _logger;

    public GeocodingService(HttpClient httpClient, ILogger<GeocodingService> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
    }

    public async Task<string?> GetCountryCodeAsync(double latitude, double longitude)
    {
        var url = string.Create(
            CultureInfo.InvariantCulture,
            $"{ReverseUrl}?format=jsonv2&lat={latitude}&lon={longitude}&zoom=3&addressdetails=1");

        try
        {
            using var response = await _httpClient.GetAsync(url);

            if (!response.IsSuccessStatusCode)
            {
                return null;
            }

            await using var stream = await response.Content.ReadAsStreamAsync();
            using var json = await JsonDocument.ParseAsync(stream);

            if (!json.RootElement.TryGetProperty("address", out var address)
                || !address.TryGetProperty("country_code", out var countryCode))
            {
                return null;
            }

            var value = countryCode.GetString();

            return string.IsNullOrWhiteSpace(value) ? null : value.ToUpperInvariant();
        }
        catch (Exception exception) when (
            exception is HttpRequestException
                or TaskCanceledException
                or JsonException
                or InvalidOperationException)
        {
            _logger.LogWarning(exception, "Nie udało się ustalić kraju z Nominatim.");

            return null;
        }
    }

        public async Task FillMissingCountriesAsync(IEnumerable<TripStop> stops, int maxLookups)
    {
        var now = DateTime.UtcNow;

        var missing = stops
            .Where(stop => stop.CountryCode == null
                && (stop.CountryCheckedAt == null || now - stop.CountryCheckedAt.Value > TimeSpan.FromDays(1)))
            .Take(maxLookups)
            .ToList();

        for (var i = 0; i < missing.Count; i++)
        {
            if (i > 0)
            {
                await Task.Delay(TimeSpan.FromMilliseconds(1100));
            }

            missing[i].CountryCode = await GetCountryCodeAsync(missing[i].Latitude, missing[i].Longitude);
            missing[i].CountryCheckedAt = now;
        }
    }
}