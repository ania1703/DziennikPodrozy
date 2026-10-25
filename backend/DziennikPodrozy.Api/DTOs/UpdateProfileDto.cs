using System.ComponentModel.DataAnnotations;

namespace DziennikPodrozy.Api.DTOs;

public class UpdateProfileDto
{
    [MaxLength(500)]
    public string? Bio { get; set; }

    [MaxLength(100)]
    public string? HomeCity { get; set; }

    [Range(-90, 90)]
    public double? HomeLatitude { get; set; }

    [Range(-180, 180)]
    public double? HomeLongitude { get; set; }
}