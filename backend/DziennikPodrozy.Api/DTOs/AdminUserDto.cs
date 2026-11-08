namespace DziennikPodrozy.Api.DTOs;

public class AdminUserDto
{
    public string Id { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? LastActiveAt { get; set; }
    public bool IsSuspended { get; set; }
    public DateTime? DeletionRequestedAt { get; set; }
    public bool IsAdmin { get; set; }
    public int TripCount { get; set; }
    public int StopCount { get; set; }
    public DateTime? DeletionAllowedAt { get; set; }
}