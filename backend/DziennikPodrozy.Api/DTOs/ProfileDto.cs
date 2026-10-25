namespace DziennikPodrozy.Api.DTOs;

public class ProfileDto
{
    public string UserName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
    public string? Bio { get; set; }
    public string? HomeCity { get; set; }
    public double? HomeLatitude { get; set; }
    public double? HomeLongitude { get; set; }
}