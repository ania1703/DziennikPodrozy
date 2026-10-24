namespace DziennikPodrozy.Api.DTOs;

public class TripStopDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public DateOnly Date { get; set; }
    public int SortOrder { get; set; }
    public string? Note { get; set; }
    public List<StopPhotoDto> Photos { get; set; } = new();
    public List<StopRecordingDto> Recordings { get; set; } = new();
    public WeatherDto? Weather { get; set; }
}