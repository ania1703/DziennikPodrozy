using System.Globalization;
using System.Net;
using System.Text;
using System.Web;

namespace DziennikPodrozy.Tests.Infrastructure;

/// <summary>
/// Podstawia odpowiedzi zewnętrznych usług, żeby testy nie korzystały z internetu.
/// Nominatim: szerokość poniżej 40 to Grecja, 40-45 Włochy, powyżej 45 Polska, punkt (0, 0) to ocean.
/// Open-Meteo: zawsze ta sama prognoza (kod 3, 12,5 / 4,0 stopni, opad 0,2 mm).
/// </summary>
public class FakeExternalApisHandler : HttpMessageHandler
{
    public const string WeatherJson =
        "{\"daily\":{\"weather_code\":[3],\"temperature_2m_max\":[12.5],\"temperature_2m_min\":[4.0],\"precipitation_sum\":[0.2]}}";

    protected override Task<HttpResponseMessage> SendAsync(
        HttpRequestMessage request,
        CancellationToken cancellationToken)
    {
        var uri = request.RequestUri!;

        if (uri.Host.Contains("nominatim"))
        {
            var query = HttpUtility.ParseQueryString(uri.Query);
            var latitude = double.Parse(query["lat"]!, CultureInfo.InvariantCulture);
            var longitude = double.Parse(query["lon"]!, CultureInfo.InvariantCulture);

            return Task.FromResult(Json(CountryJson(latitude, longitude)));
        }

        if (uri.Host.Contains("open-meteo"))
        {
            return Task.FromResult(Json(WeatherJson));
        }

        return Task.FromResult(new HttpResponseMessage(HttpStatusCode.NotFound));
    }

    private static string CountryJson(double latitude, double longitude)
    {
        if (latitude == 0 && longitude == 0)
        {
            return "{\"error\":\"Unable to geocode\"}";
        }

        var code = latitude < 40 ? "gr" : latitude < 45 ? "it" : "pl";

        return $"{{\"address\":{{\"country_code\":\"{code}\"}}}}";
    }

    private static HttpResponseMessage Json(string json)
    {
        return new HttpResponseMessage(HttpStatusCode.OK)
        {
            Content = new StringContent(json, Encoding.UTF8, "application/json")
        };
    }
}

/// <summary>Obsługa zapytań HTTP w testach jednostkowych: zwraca to, co zdefiniuje test.</summary>
public class StubHandler : HttpMessageHandler
{
    private readonly Func<HttpRequestMessage, HttpResponseMessage> _respond;

    public StubHandler(Func<HttpRequestMessage, HttpResponseMessage> respond)
    {
        _respond = respond;
    }

    public List<Uri> Requests { get; } = new();

    protected override Task<HttpResponseMessage> SendAsync(
        HttpRequestMessage request,
        CancellationToken cancellationToken)
    {
        Requests.Add(request.RequestUri!);

        return Task.FromResult(_respond(request));
    }

    public static StubHandler Json(string json, HttpStatusCode status = HttpStatusCode.OK)
    {
        return new StubHandler(_ => new HttpResponseMessage(status)
        {
            Content = new StringContent(json, Encoding.UTF8, "application/json")
        });
    }
}
