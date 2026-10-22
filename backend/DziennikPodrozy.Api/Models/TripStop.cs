using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DziennikPodrozy.Api.Models;

public class TripStop
{
    public int Id { get; set; }

    public int TripId { get; set; }

    [ForeignKey(nameof(TripId))]
    public Trip? Trip { get; set; }

    [Required]
    [MaxLength(150)]
    public string Title { get; set; } = string.Empty;

    public double Latitude { get; set; }
    public double Longitude { get; set; }

    public DateOnly Date { get; set; }
    public int SortOrder { get; set; }

    [MaxLength(10000)]
    public string? Note { get; set; }
}