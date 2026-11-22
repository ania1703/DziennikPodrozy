using DziennikPodrozy.Api.Controllers;
using DziennikPodrozy.Api.Data;
using DziennikPodrozy.Api.Services;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace DziennikPodrozy.Tests.Infrastructure;

/// <summary>
/// Uruchamia prawdziwą aplikację w pamięci: baza SQLite w pamięci zamiast SQL Server,
/// podstawione odpowiedzi Nominatim i Open-Meteo, własny klucz JWT i tymczasowy folder plików.
/// Nie dotyka prawdziwej bazy, sekretów ani internetu.
/// </summary>
public class ApiFactory : WebApplicationFactory<AuthController>
{
    public const string AdminEmail = "admin@test.local";
    public const string AdminPassword = "Admin12345!";
    public const string ContactEmail = "kontakt@test.local";
    public const string DefaultPassword = "Test12345";

    private readonly SqliteConnection _connection = new("DataSource=:memory:");
    private readonly string _webRoot = Path.Combine(
        Path.GetTempPath(),
        "dziennik-tests-" + Guid.NewGuid().ToString("N"));

    static ApiFactory()
    {
        Environment.SetEnvironmentVariable("Jwt__Key", "klucz-testowy-minimum-32-znaki-do-podpisu-tokenow");
        Environment.SetEnvironmentVariable("AdminSeed__UserName", "admin");
        Environment.SetEnvironmentVariable("AdminSeed__Email", AdminEmail);
        Environment.SetEnvironmentVariable("AdminSeed__Password", AdminPassword);
        Environment.SetEnvironmentVariable("Contact__AdminEmail", ContactEmail);
    }

    public string WebRoot => _webRoot;

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        Directory.CreateDirectory(_webRoot);
        _connection.Open();

        builder.UseEnvironment("Testing");
        builder.UseWebRoot(_webRoot);

        builder.ConfigureServices(services =>
        {
            RemoveDbContextRegistrations(services);
            services.AddDbContext<AppDbContext>(options => options.UseSqlite(_connection));

            using (var provider = services.BuildServiceProvider())
            using (var scope = provider.CreateScope())
            {
                scope.ServiceProvider.GetRequiredService<AppDbContext>().Database.EnsureCreated();
            }

            services.AddHttpClient<GeocodingService>()
                .ConfigurePrimaryHttpMessageHandler(() => new FakeExternalApisHandler());

            services.AddHttpClient<WeatherService>()
                .ConfigurePrimaryHttpMessageHandler(() => new FakeExternalApisHandler());
        });
    }

    protected override void Dispose(bool disposing)
    {
        base.Dispose(disposing);

        if (disposing)
        {
            _connection.Dispose();

            if (Directory.Exists(_webRoot))
            {
                Directory.Delete(_webRoot, recursive: true);
            }
        }
    }

    private static void RemoveDbContextRegistrations(IServiceCollection services)
    {
        var toRemove = services
            .Where(descriptor =>
                descriptor.ServiceType == typeof(DbContextOptions<AppDbContext>)
                || descriptor.ServiceType == typeof(DbContextOptions)
                || (descriptor.ServiceType.IsGenericType
                    && descriptor.ServiceType.Name.StartsWith("IDbContextOptionsConfiguration")
                    && descriptor.ServiceType.GenericTypeArguments.Contains(typeof(AppDbContext))))
            .ToList();

        foreach (var descriptor in toRemove)
        {
            services.Remove(descriptor);
        }
    }
}

[CollectionDefinition(Name)]
public class ApiCollection : ICollectionFixture<ApiFactory>
{
    public const string Name = "api";
}
