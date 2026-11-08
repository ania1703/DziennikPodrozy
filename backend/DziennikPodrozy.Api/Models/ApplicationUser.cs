using Microsoft.AspNetCore.Identity;

namespace DziennikPodrozy.Api.Models;

public class ApplicationUser : IdentityUser
{
    public string? AvatarUrl {get; set; }
    public string? Bio { get; set; }
    public string? HomeCity { get; set; }
    public double? HomeLatitude { get; set; }
    public double? HomeLongitude { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? LastActiveAt { get; set; }
    public DateTime? DeletionRequestedAt { get; set; }
}