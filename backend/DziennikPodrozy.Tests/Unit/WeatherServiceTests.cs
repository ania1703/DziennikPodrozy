using System.Net;
using DziennikPodrozy.Api.Services;
using DziennikPodrozy.Tests.Infrastructure;
using Microsoft.Extensions.Logging.Abstractions;

namespace DziennikPodrozy.Tests.Unit;

public class WeatherServiceTests
{
    private static WeatherService CreateService(HttpMessageHandler handler)
    {
        return new WeatherService(new HttpClient(handler), NullLogger<WeatherService>.Instance);
    }

    private static DateOnly DaysFromToday(int days) =>
        DateOnly.FromDateTime(DateTime.UtcNow).AddDays(days);

    [Theory]
    [InlineData(0, true)]
    [InlineData(15, true)]
    [InlineData(16, false)]
    [InlineData(-400, true)]
    public void IsInRange_DependsOnForecastHorizon(int daysFromToday, bool expected)
    {
        Assert.Equal(expected, WeatherService.IsInRange(DaysFromToday(daysFromToday)));
    }

    [Fact]
    public async Task GetDailyWeatherAsync_OutOfRangeDate_ReturnsNullWithoutRequest()
    {
        var handler = StubHandler.Json(FakeExternalApisHandler.WeatherJson);

        var weather = await CreateService(handler).GetDailyWeatherAsync(50, 20, DaysFromToday(40));

        Assert.Null(weather);
        Assert.Empty(handler.Requests);
    }

    [Fact]
    public async Task GetDailyWeatherAsync_ParsesDailyValues()
    {
        var handler = StubHandler.Json(FakeExternalApisHandler.WeatherJson);

        var weather = await CreateService(handler).GetDailyWeatherAsync(50, 20, DaysFromToday(-30));

        Assert.NotNull(weather);
        Assert.Equal(3, weather.WeatherCode);
        Assert.Equal(12.5, weather.TemperatureMax);
        Assert.Equal(4.0, weather.TemperatureMin);
        Assert.Equal(0.2, weather.PrecipitationMm);
    }

    [Fact]
    public async Task GetDailyWeatherAsync_OldDate_UsesArchiveApi()
    {
        var handler = StubHandler.Json(FakeExternalApisHandler.WeatherJson);

        await CreateService(handler).GetDailyWeatherAsync(50, 20, DaysFromToday(-30));

        Assert.Single(handler.Requests);
        Assert.Contains("archive-api.open-meteo.com", handler.Requests[0].Host);
    }

    [Fact]
    public async Task GetDailyWeatherAsync_FutureDate_UsesForecastApi()
    {
        var handler = StubHandler.Json(FakeExternalApisHandler.WeatherJson);

        await CreateService(handler).GetDailyWeatherAsync(50, 20, DaysFromToday(3));

        Assert.Single(handler.Requests);
        Assert.Equal("api.open-meteo.com", handler.Requests[0].Host);
    }

    [Fact]
    public async Task GetDailyWeatherAsync_MissingTemperature_ReturnsNull()
    {
        var json = "{\"daily\":{\"weather_code\":[3],\"temperature_2m_max\":[null],\"temperature_2m_min\":[null],\"precipitation_sum\":[null]}}";

        var weather = await CreateService(StubHandler.Json(json)).GetDailyWeatherAsync(50, 20, DaysFromToday(-30));

        Assert.Null(weather);
    }

    [Fact]
    public async Task GetDailyWeatherAsync_NullPrecipitation_IsTreatedAsZero()
    {
        var json = "{\"daily\":{\"weather_code\":[1],\"temperature_2m_max\":[20.0],\"temperature_2m_min\":[10.0],\"precipitation_sum\":[null]}}";

        var weather = await CreateService(StubHandler.Json(json)).GetDailyWeatherAsync(50, 20, DaysFromToday(-30));

        Assert.NotNull(weather);
        Assert.Equal(0, weather.PrecipitationMm);
    }

    [Fact]
    public async Task GetDailyWeatherAsync_ServerError_ReturnsNull()
    {
        var handler = StubHandler.Json("{}", HttpStatusCode.InternalServerError);

        Assert.Null(await CreateService(handler).GetDailyWeatherAsync(50, 20, DaysFromToday(-30)));
    }

    [Fact]
    public async Task GetDailyWeatherAsync_InvalidJson_ReturnsNull()
    {
        var weather = await CreateService(StubHandler.Json("to nie jest json")).GetDailyWeatherAsync(50, 20, DaysFromToday(-30));

        Assert.Null(weather);
    }

    [Fact]
    public async Task GetDailyWeatherAsync_NetworkFailure_ReturnsNull()
    {
        var handler = new StubHandler(_ => throw new HttpRequestException("brak sieci"));

        Assert.Null(await CreateService(handler).GetDailyWeatherAsync(50, 20, DaysFromToday(-30)));
    }
}
