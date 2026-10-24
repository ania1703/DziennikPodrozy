using DziennikPodrozy.Api.Models;

namespace DziennikPodrozy.Api.DTOs;

public class StopPhotoDto
{
    public int Id { get; set; }
    public string Url { get; set; } = string.Empty;
    public string? Caption { get; set; }
    public int SortOrder { get; set; }

    public static StopPhotoDto From(StopPhoto photo)
    {
        return new StopPhotoDto
        {
            Id = photo.Id,
            Url = photo.Url,
            Caption = photo.Caption,
            SortOrder = photo.SortOrder
        };
    }
}