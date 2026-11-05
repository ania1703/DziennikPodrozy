using System.ComponentModel.DataAnnotations;

namespace DziennikPodrozy.Api.DTOs;

public class SaveDayNoteDto
{
    [MaxLength(2000)]
    public string? Text { get; set; }
}