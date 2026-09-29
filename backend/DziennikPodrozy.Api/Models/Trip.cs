using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DziennikPodrozy.Api.Models;

public enum TripStatus
{
    InProgress,
    Finished
}

public class Trip
{
    public int Id { get; set; }

    [Required]
    [MaxLength(150)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(2000)]
    public string? Description { get; set; }

    public DateOnly StartDate { get; set; }
    public DateOnly? EndDate { get; set; }

    public TripStatus Status { get; set; } = TripStatus.InProgress;

    public string? CoverPhotoUrl { get; set; }

    public string OwnerId { get; set; } = string.Empty;

    [ForeignKey(nameof(OwnerId))]
    public ApplicationUser? Owner { get; set; }
}