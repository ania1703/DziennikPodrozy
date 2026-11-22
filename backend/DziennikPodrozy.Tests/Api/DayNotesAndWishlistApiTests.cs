using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using DziennikPodrozy.Tests.Infrastructure;

namespace DziennikPodrozy.Tests.Api;

[Collection(ApiCollection.Name)]
public class DayNotesApiTests
{
    private readonly ApiFactory _factory;

    public DayNotesApiTests(ApiFactory factory)
    {
        _factory = factory;
    }

    private async Task<(TestUser User, int TripId)> CreateTripAsync()
    {
        var user = await _factory.CreateUserAsync();
        var trip = await user.Client.CreateTripAsync(startDate: "2027-06-10", endDate: "2027-06-12");

        return (user, trip.GetProperty("id").GetInt32());
    }

    [Fact]
    public async Task SaveNote_CreatesNoteAndListReturnsIt()
    {
        var (user, tripId) = await CreateTripAsync();

        var response = await user.Client.PutAsJsonAsync($"/api/trips/{tripId}/day-notes/2027-06-10", new { text = "Dojazd i spacer" });

        await response.ShouldBeAsync(HttpStatusCode.OK);

        var list = await (await user.Client.GetAsync($"/api/trips/{tripId}/day-notes")).ReadJsonAsync();

        Assert.Equal(1, list.GetArrayLength());
        Assert.Equal("2027-06-10", list[0].GetProperty("date").GetString());
        Assert.Equal("Dojazd i spacer", list[0].GetProperty("text").GetString());
    }

    [Fact]
    public async Task SaveNote_SecondTimeForTheSameDay_OverwritesInsteadOfDuplicating()
    {
        var (user, tripId) = await CreateTripAsync();
        await user.Client.PutAsJsonAsync($"/api/trips/{tripId}/day-notes/2027-06-10", new { text = "Pierwsza" });

        await user.Client.PutAsJsonAsync($"/api/trips/{tripId}/day-notes/2027-06-10", new { text = "Druga" });

        var list = await (await user.Client.GetAsync($"/api/trips/{tripId}/day-notes")).ReadJsonAsync();

        Assert.Equal(1, list.GetArrayLength());
        Assert.Equal("Druga", list[0].GetProperty("text").GetString());
    }

    [Fact]
    public async Task SaveNote_TrimsWhitespace()
    {
        var (user, tripId) = await CreateTripAsync();

        var response = await user.Client.PutAsJsonAsync($"/api/trips/{tripId}/day-notes/2027-06-10", new { text = "   Ładny dzień   " });

        Assert.Equal("Ładny dzień", (await response.ReadJsonAsync()).GetProperty("text").GetString());
    }

    [Fact]
    public async Task SaveNote_EmptyText_RemovesTheNote()
    {
        var (user, tripId) = await CreateTripAsync();
        await user.Client.PutAsJsonAsync($"/api/trips/{tripId}/day-notes/2027-06-11", new { text = "Do usunięcia" });

        var response = await user.Client.PutAsJsonAsync($"/api/trips/{tripId}/day-notes/2027-06-11", new { text = "" });

        await response.ShouldBeAsync(HttpStatusCode.NoContent);
        Assert.Equal(0, (await (await user.Client.GetAsync($"/api/trips/{tripId}/day-notes")).ReadJsonAsync()).GetArrayLength());
    }

    [Fact]
    public async Task SaveNote_EmptyTextWhenThereIsNoNote_IsHarmless()
    {
        var (user, tripId) = await CreateTripAsync();

        var response = await user.Client.PutAsJsonAsync($"/api/trips/{tripId}/day-notes/2027-06-11", new { text = "" });

        await response.ShouldBeAsync(HttpStatusCode.NoContent);
    }

    [Theory]
    [InlineData("2027-06-09")]
    [InlineData("2027-06-13")]
    public async Task SaveNote_DateOutsideTrip_IsRejected(string date)
    {
        var (user, tripId) = await CreateTripAsync();

        var response = await user.Client.PutAsJsonAsync($"/api/trips/{tripId}/day-notes/{date}", new { text = "Poza podróżą" });

        await response.ShouldBeAsync(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task SaveNote_LongerThan2000Characters_IsRejected()
    {
        var (user, tripId) = await CreateTripAsync();

        var response = await user.Client.PutAsJsonAsync($"/api/trips/{tripId}/day-notes/2027-06-10", new { text = new string('a', 2001) });

        await response.ShouldBeAsync(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Notes_ReturnedInDateOrder()
    {
        var (user, tripId) = await CreateTripAsync();
        await user.Client.PutAsJsonAsync($"/api/trips/{tripId}/day-notes/2027-06-12", new { text = "Trzeci" });
        await user.Client.PutAsJsonAsync($"/api/trips/{tripId}/day-notes/2027-06-10", new { text = "Pierwszy" });

        var list = await (await user.Client.GetAsync($"/api/trips/{tripId}/day-notes")).ReadJsonAsync();

        Assert.Equal(new[] { "Pierwszy", "Trzeci" }, list.EnumerateArray().Select(n => n.GetProperty("text").GetString()));
    }

    [Fact]
    public async Task Notes_OfAnotherUsersTrip_AreNotFound()
    {
        var (_, tripId) = await CreateTripAsync();
        var intruder = await _factory.CreateUserAsync();

        await (await intruder.Client.GetAsync($"/api/trips/{tripId}/day-notes")).ShouldBeAsync(HttpStatusCode.NotFound);
        await (await intruder.Client.PutAsJsonAsync($"/api/trips/{tripId}/day-notes/2027-06-10", new { text = "Włam" }))
            .ShouldBeAsync(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task Notes_WithoutToken_AreUnauthorized()
    {
        await (await _factory.CreateClient().GetAsync("/api/trips/1/day-notes")).ShouldBeAsync(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task Notes_AreRemovedTogetherWithTheTrip()
    {
        var (user, tripId) = await CreateTripAsync();
        await user.Client.PutAsJsonAsync($"/api/trips/{tripId}/day-notes/2027-06-10", new { text = "Znikną" });

        await user.Client.DeleteAsync($"/api/trips/{tripId}");

        await _factory.WithDbAsync(async db =>
        {
            Assert.Empty(db.DayNotes.Where(n => n.TripId == tripId));
            await Task.CompletedTask;
        });
    }
}

[Collection(ApiCollection.Name)]
public class WishlistApiTests
{
    private readonly ApiFactory _factory;

    public WishlistApiTests(ApiFactory factory)
    {
        _factory = factory;
    }

    private static Task<HttpResponseMessage> AddAsync(TestUser user, string title, double latitude, double longitude, string? note = null)
    {
        return user.Client.PostAsJsonAsync("/api/wishlist", new { title, latitude, longitude, note });
    }

    [Fact]
    public async Task AddPlace_SavesItWithCountryAndTodaysDate()
    {
        var user = await _factory.CreateUserAsync();

        var response = await AddAsync(user, "Rzym", 41.89, 12.49, "Zabytki");

        await response.ShouldBeAsync(HttpStatusCode.Created);

        var item = await response.ReadJsonAsync();

        Assert.Equal("Rzym", item.GetProperty("title").GetString());
        Assert.Equal("IT", item.GetProperty("countryCode").GetString());
        Assert.Equal("Zabytki", item.GetProperty("note").GetString());
        Assert.Equal(ApiHelpers.Today, item.GetProperty("addedOn").GetString());
    }

    [Fact]
    public async Task AddPlace_WithoutNote_HasNullNote()
    {
        var user = await _factory.CreateUserAsync();

        var item = await (await AddAsync(user, "Lofoty", 68.2, 14.6)).ReadJsonAsync();

        Assert.Equal(JsonValueKind.Null, item.GetProperty("note").ValueKind);
    }

    [Theory]
    [InlineData("", 10, 10)]
    [InlineData("Miejsce", 200, 10)]
    [InlineData("Miejsce", 10, -200)]
    public async Task AddPlace_InvalidData_IsRejected(string title, double latitude, double longitude)
    {
        var user = await _factory.CreateUserAsync();

        await (await AddAsync(user, title, latitude, longitude)).ShouldBeAsync(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task AddPlace_NoteLongerThan1000Characters_IsRejected()
    {
        var user = await _factory.CreateUserAsync();

        await (await AddAsync(user, "Miejsce", 10, 10, new string('a', 1001))).ShouldBeAsync(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task List_ReturnsNewestFirstAndOnlyOwnPlaces()
    {
        var user = await _factory.CreateUserAsync();
        var other = await _factory.CreateUserAsync();
        await AddAsync(user, "Pierwsze", 50, 19);
        await AddAsync(user, "Drugie", 50, 19);
        await AddAsync(other, "Cudze", 50, 19);

        var list = await (await user.Client.GetAsync("/api/wishlist")).ReadJsonAsync();

        Assert.Equal(new[] { "Drugie", "Pierwsze" }, list.EnumerateArray().Select(i => i.GetProperty("title").GetString()));
    }

    [Fact]
    public async Task UpdatePlace_ChangesTitleAndNoteButNotPosition()
    {
        var user = await _factory.CreateUserAsync();
        var item = await (await AddAsync(user, "Kioto", 35.01, 135.76, "Stara")).ReadJsonAsync();
        var id = item.GetProperty("id").GetInt32();

        var response = await user.Client.PutAsJsonAsync($"/api/wishlist/{id}", new { title = "Kioto i Nara", note = "Nowa" });

        await response.ShouldBeAsync(HttpStatusCode.OK);

        var updated = await response.ReadJsonAsync();

        Assert.Equal("Kioto i Nara", updated.GetProperty("title").GetString());
        Assert.Equal("Nowa", updated.GetProperty("note").GetString());
        Assert.Equal(35.01, updated.GetProperty("latitude").GetDouble());
    }

    [Fact]
    public async Task UpdatePlace_EmptyTitle_IsRejected()
    {
        var user = await _factory.CreateUserAsync();
        var id = (await (await AddAsync(user, "Kioto", 35.01, 135.76)).ReadJsonAsync()).GetProperty("id").GetInt32();

        var response = await user.Client.PutAsJsonAsync($"/api/wishlist/{id}", new { title = "", note = "x" });

        await response.ShouldBeAsync(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task DeletePlace_RemovesItAndSecondDeleteIsNotFound()
    {
        var user = await _factory.CreateUserAsync();
        var id = (await (await AddAsync(user, "Kioto", 35.01, 135.76)).ReadJsonAsync()).GetProperty("id").GetInt32();

        await (await user.Client.DeleteAsync($"/api/wishlist/{id}")).ShouldBeAsync(HttpStatusCode.NoContent);
        await (await user.Client.DeleteAsync($"/api/wishlist/{id}")).ShouldBeAsync(HttpStatusCode.NotFound);
        Assert.Equal(0, (await (await user.Client.GetAsync("/api/wishlist")).ReadJsonAsync()).GetArrayLength());
    }

    [Fact]
    public async Task UpdateAndDelete_OfAnotherUsersPlace_AreNotFound()
    {
        var owner = await _factory.CreateUserAsync();
        var intruder = await _factory.CreateUserAsync();
        var id = (await (await AddAsync(owner, "Kioto", 35.01, 135.76)).ReadJsonAsync()).GetProperty("id").GetInt32();

        await (await intruder.Client.PutAsJsonAsync($"/api/wishlist/{id}", new { title = "Przejęte", note = (string?)null }))
            .ShouldBeAsync(HttpStatusCode.NotFound);
        await (await intruder.Client.DeleteAsync($"/api/wishlist/{id}")).ShouldBeAsync(HttpStatusCode.NotFound);
        Assert.Equal(1, (await (await owner.Client.GetAsync("/api/wishlist")).ReadJsonAsync()).GetArrayLength());
    }

    [Fact]
    public async Task Wishlist_WithoutToken_IsUnauthorized()
    {
        await (await _factory.CreateClient().GetAsync("/api/wishlist")).ShouldBeAsync(HttpStatusCode.Unauthorized);
    }
}
