using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DziennikPodrozy.Api.Models;

public class StopRecording
{
    public int Id { get; set; }

    public int TripStopId { get; set; }

    [ForeignKey(nameof(TripStopId))]
    public TripStop? TripStop { get; set; }

    [Required]
    [MaxLength(300)]
    public string Url { get; set; } = string.Empty;

    public int DurationSeconds { get; set; }

    public DateTime CreatedAt { get; set; }
}