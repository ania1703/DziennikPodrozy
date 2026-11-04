using System.ComponentModel.DataAnnotations;

namespace DziennikPodrozy.Api.DTOs;

public class UpdateWishlistItemDto
{
    [Required]
    [MaxLength(150)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(1000)]
    public string? Note { get; set; }
}