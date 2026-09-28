using System.ComponentModel.DataAnnotations;

namespace DziennikPodrozy.Api.DTOs;

public class UpdateProfileDto
{
    [MaxLength(500)]
    public string? Bio { get; set; }

    [MaxLength(100)]
    public string? HomeCity { get; set; }
}