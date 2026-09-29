using System.ComponentModel.DataAnnotations;

namespace DziennikPodrozy.Api.DTOs;

public class ChangeTripStatusDto
{
    [Required]
    public string Status { get; set; } = string.Empty;
}