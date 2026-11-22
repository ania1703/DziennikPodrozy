using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using DziennikPodrozy.Api.Data;
using Microsoft.Extensions.DependencyInjection;

namespace DziennikPodrozy.Tests.Infrastructure;

public record TestUser(HttpClient Client, string UserName, string Email, string Password);

public static class ApiHelpers
{
    public static string Today => DateTime.UtcNow.ToString("yyyy-MM-dd");

    public static string DaysFromToday(int days) => DateTime.UtcNow.AddDays(days).ToString("yyyy-MM-dd");

    public static async Task<TestUser> CreateUserAsync(
        this ApiFactory factory,
        string password = ApiFactory.DefaultPassword)
    {
        var userName = "u" + Guid.NewGuid().ToString("N")[..10];
        var email = $"{userName}@test.local";
        var client = factory.CreateClient();

        var register = await client.PostAsJsonAsync("/api/auth/register", new { userName, email, password });
        await register.ShouldBeAsync(HttpStatusCode.OK);

        var login = await client.PostAsJsonAsync("/api/auth/login", new { email, password });
        await login.ShouldBeAsync(HttpStatusCode.OK);

        var token = (await login.ReadJsonAsync()).GetProperty("token").GetString()!;
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        return new TestUser(client, userName, email, password);
    }

    public static async Task<HttpClient> CreateAdminClientAsync(this ApiFactory factory)
    {
        var client = factory.CreateClient();

        var login = await client.PostAsJsonAsync(
            "/api/auth/login",
            new { email = ApiFactory.AdminEmail, password = ApiFactory.AdminPassword });
        await login.ShouldBeAsync(HttpStatusCode.OK);

        var token = (await login.ReadJsonAsync()).GetProperty("token").GetString()!;
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        return client;
    }

    public static async Task WithDbAsync(this ApiFactory factory, Func<AppDbContext, Task> action)
    {
        using var scope = factory.Services.CreateScope();

        await action(scope.ServiceProvider.GetRequiredService<AppDbContext>());
    }

    public static async Task<JsonElement> ReadJsonAsync(this HttpResponseMessage response)
    {
        var text = await response.Content.ReadAsStringAsync();

        using var document = JsonDocument.Parse(text);

        return document.RootElement.Clone();
    }

    public static async Task ShouldBeAsync(this HttpResponseMessage response, HttpStatusCode expected)
    {
        if (response.StatusCode != expected)
        {
            var body = await response.Content.ReadAsStringAsync();

            Assert.Fail($"Oczekiwano {(int)expected} {expected}, otrzymano {(int)response.StatusCode} {response.StatusCode}. Treść: {body}");
        }
    }

    public static async Task<JsonElement> CreateTripAsync(
        this HttpClient client,
        string title = "Testowa podróż",
        string? startDate = null,
        string? endDate = null,
        string? status = null,
        string? description = null)
    {
        var response = await client.PostAsJsonAsync("/api/trips", new
        {
            title,
            description,
            startDate = startDate ?? DaysFromToday(-10),
            endDate = endDate ?? DaysFromToday(-8),
            status
        });

        await response.ShouldBeAsync(HttpStatusCode.Created);

        return await response.ReadJsonAsync();
    }

    public static async Task<JsonElement> CreateStopAsync(
        this HttpClient client,
        int tripId,
        string title,
        double latitude,
        double longitude,
        string date,
        string? note = null)
    {
        var response = await client.PostAsJsonAsync(
            $"/api/trips/{tripId}/stops",
            new { title, latitude, longitude, date, note });

        await response.ShouldBeAsync(HttpStatusCode.Created);

        return await response.ReadJsonAsync();
    }

    public static MultipartFormDataContent FileContent(
        byte[] bytes,
        string fileName,
        string fieldName = "file",
        string contentType = "application/octet-stream")
    {
        var content = new MultipartFormDataContent();
        var file = new ByteArrayContent(bytes);

        file.Headers.ContentType = new MediaTypeHeaderValue(contentType);
        content.Add(file, fieldName, fileName);

        return content;
    }
}

public static class TestFiles
{
    public static byte[] Png(int extraBytes = 32, byte fill = 1) =>
        new byte[] { 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A }
            .Concat(Enumerable.Repeat(fill, extraBytes)).ToArray();

    public static byte[] Jpeg(int extraBytes = 32) =>
        new byte[] { 0xFF, 0xD8, 0xFF, 0xE0 }.Concat(Enumerable.Repeat((byte)2, extraBytes)).ToArray();

    public static byte[] Webm(int extraBytes = 32) =>
        new byte[] { 0x1A, 0x45, 0xDF, 0xA3 }.Concat(Enumerable.Repeat((byte)3, extraBytes)).ToArray();

    public static byte[] Text() => System.Text.Encoding.UTF8.GetBytes("To nie jest obraz, tylko zwykły tekst.");
}
