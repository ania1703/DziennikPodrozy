namespace DziennikPodrozy.Api.DTOs;

public class StatsDto
{
    public int TripCount { get; set; }
    public int DayCount { get; set; }
    public int StopCount { get; set; }
    public int PhotoCount { get; set; }
    public int RecordingCount { get; set; }
    public int DistanceKm { get; set; }
    public List<string> CountryCodes { get; set; } = new();
    public bool HasHome { get; set; }
    public string? HomeCity { get; set; }
    public FarthestPointDto? FarthestPoint { get; set; }
}