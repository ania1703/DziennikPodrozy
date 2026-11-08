namespace DziennikPodrozy.Api.DTOs;

public class TripDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateOnly StartDate { get; set; }
    public DateOnly? EndDate { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? CoverPhotoUrl { get; set; }
    public string? NextTimeNote { get; set; }
    public int? DayCount { get; set; }
    public int StopCount { get; set; }
    public int PhotoCount { get; set; }
    public int RecordingCount { get; set; }
    public bool IsDescribed { get; set; }
}