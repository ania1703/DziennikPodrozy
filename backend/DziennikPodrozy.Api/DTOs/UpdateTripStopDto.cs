using System.ComponentModel.DataAnnotations;

namespace DziennikPodrozy.Api.DTOs;

public class UpdateTripStopDto
{
    [Required]
    [MaxLength(150)]
    public string Title { get; set; } = string.Empty;

    [Range(-90, 90)]
    public double Latitude { get; set; }

    [Range(-180, 180)]
    public double Longitude { get; set; }

    public DateOnly Date { get; set; }

    [MaxLength(2000)]
    public string? Note { get; set; }
}