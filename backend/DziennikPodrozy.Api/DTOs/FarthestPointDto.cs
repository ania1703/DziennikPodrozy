namespace DziennikPodrozy.Api.DTOs;

public class FarthestPointDto
{
    public string Title { get; set; } = string.Empty;
    public int TripId { get; set; }
    public string? CountryCode { get; set; }
    public int DistanceKm { get; set; }
}