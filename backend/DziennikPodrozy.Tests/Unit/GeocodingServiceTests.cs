using System.Net;
using DziennikPodrozy.Api.Models;
using DziennikPodrozy.Api.Services;
using DziennikPodrozy.Tests.Infrastructure;
using Microsoft.Extensions.Logging.Abstractions;

namespace DziennikPodrozy.Tests.Unit;

public class GeocodingServiceTests
{
    private static GeocodingService CreateService(HttpMessageHandler handler)
    {
        return new GeocodingService(new HttpClient(handler), NullLogger<GeocodingService>.Instance);
    }

    [Fact]
    public async Task GetCountryCodeAsync_ReturnsUpperCaseCode()
    {
        var handler = StubHandler.Json("{\"address\":{\"country_code\":\"pl\"}}");

        Assert.Equal("PL", await CreateService(handler).GetCountryCodeAsync(50.05, 19.93));
    }

    [Fact]
    public async Task GetCountryCodeAsync_SendsCoordinatesWithDotAsDecimalSeparator()
    {
        var handler = StubHandler.Json("{\"address\":{\"country_code\":\"pl\"}}");

        await CreateService(handler).GetCountryCodeAsync(50.05, 19.93);

        var query = handler.Requests.Single().Query;

        Assert.Contains("lat=50.05", query);
        Assert.Contains("lon=19.93", query);
    }

    [Fact]
    public async Task GetCountryCodeAsync_PointWithoutCountry_ReturnsNull()
    {
        var handler = StubHandler.Json("{\"error\":\"Unable to geocode\"}");

        Assert.Null(await CreateService(handler).GetCountryCodeAsync(0, 0));
    }

    [Fact]
    public async Task GetCountryCodeAsync_ServerError_ReturnsNull()
    {
        var handler = StubHandler.Json("{}", HttpStatusCode.ServiceUnavailable);

        Assert.Null(await CreateService(handler).GetCountryCodeAsync(50, 20));
    }

    [Fact]
    public async Task GetCountryCodeAsync_NetworkFailure_ReturnsNull()
    {
        var handler = new StubHandler(_ => throw new HttpRequestException("brak sieci"));

        Assert.Null(await CreateService(handler).GetCountryCodeAsync(50, 20));
    }

    [Fact]
    public async Task FillMissingCountriesAsync_FillsStopsWithoutCountry()
    {
        var stop = new TripStop { Title = "Wawel", Latitude = 50.05, Longitude = 19.93 };

        await CreateService(new FakeExternalApisHandler()).FillMissingCountriesAsync(new[] { stop }, 5);

        Assert.Equal("PL", stop.CountryCode);
        Assert.NotNull(stop.CountryCheckedAt);
    }

    [Fact]
    public async Task FillMissingCountriesAsync_DoesNotTouchStopsThatAlreadyHaveCountry()
    {
        var handler = StubHandler.Json("{\"address\":{\"country_code\":\"it\"}}");
        var stop = new TripStop { Title = "Wawel", Latitude = 50.05, Longitude = 19.93, CountryCode = "PL" };

        await CreateService(handler).FillMissingCountriesAsync(new[] { stop }, 5);

        Assert.Equal("PL", stop.CountryCode);
        Assert.Empty(handler.Requests);
    }

    [Fact]
    public async Task FillMissingCountriesAsync_SkipsStopsCheckedRecently()
    {
        var handler = StubHandler.Json("{\"address\":{\"country_code\":\"it\"}}");
        var stop = new TripStop
        {
            Title = "Ocean",
            Latitude = 0,
            Longitude = 0,
            CountryCheckedAt = DateTime.UtcNow.AddHours(-1)
        };

        await CreateService(handler).FillMissingCountriesAsync(new[] { stop }, 5);

        Assert.Null(stop.CountryCode);
        Assert.Empty(handler.Requests);
    }

    [Fact]
    public async Task FillMissingCountriesAsync_RetriesStopsCheckedMoreThanADayAgo()
    {
        var stop = new TripStop
        {
            Title = "Wawel",
            Latitude = 50.05,
            Longitude = 19.93,
            CountryCheckedAt = DateTime.UtcNow.AddDays(-2)
        };

        await CreateService(new FakeExternalApisHandler()).FillMissingCountriesAsync(new[] { stop }, 5);

        Assert.Equal("PL", stop.CountryCode);
    }

    [Fact]
    public async Task FillMissingCountriesAsync_RespectsLookupLimit()
    {
        var stops = Enumerable.Range(0, 3)
            .Select(i => new TripStop { Title = $"Przystanek {i}", Latitude = 50, Longitude = 19 })
            .ToList();

        await CreateService(new FakeExternalApisHandler()).FillMissingCountriesAsync(stops, 2);

        Assert.Equal(2, stops.Count(s => s.CountryCode == "PL"));
        Assert.Single(stops, s => s.CountryCode == null);
    }
}
