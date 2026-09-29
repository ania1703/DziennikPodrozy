using System.ComponentModel.DataAnnotations;

namespace DziennikPodrozy.Api.DTOs;

public class UpdateTripDto
{
    [Required]
    [MaxLength(150)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(2000)]
    public string? Description { get; set; }

    [Required]
    public DateOnly StartDate { get; set; }

    public DateOnly? EndDate { get; set; }
}