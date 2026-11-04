using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DziennikPodrozy.Api.Models;

public class WishlistItem
{
    public int Id { get; set; }

    [Required]
    [MaxLength(150)]
    public string Title { get; set; } = string.Empty;

    public double Latitude { get; set; }
    public double Longitude { get; set; }

    [MaxLength(2)]
    public string? CountryCode { get; set; }

    [MaxLength(1000)]
    public string? Note { get; set; }

    public DateOnly AddedOn { get; set; }

    public string OwnerId { get; set; } = string.Empty;

    [ForeignKey(nameof(OwnerId))]
    public ApplicationUser? Owner { get; set; }
}