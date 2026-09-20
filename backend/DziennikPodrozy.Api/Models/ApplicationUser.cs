using Microsoft.AspNetCore.Identity;

namespace DziennikPodrozy.Api.Models;

public class ApplicationUser : IdentityUser
{
    public string? AvatarUrl {get; set; }
    public string? Bio { get; set; }
    public string? HomeCity { get; set; }
}