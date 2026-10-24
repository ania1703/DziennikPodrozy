using DziennikPodrozy.Api.Models;

namespace DziennikPodrozy.Api.DTOs;

public class StopRecordingDto
{
    public int Id { get; set; }
    public string Url { get; set; } = string.Empty;
    public int DurationSeconds { get; set; }
    public DateTime CreatedAt { get; set; }

    public static StopRecordingDto From(StopRecording recording)
    {
        return new StopRecordingDto
        {
            Id = recording.Id,
            Url = recording.Url,
            DurationSeconds = recording.DurationSeconds,
            CreatedAt = recording.CreatedAt
        };
    }
}