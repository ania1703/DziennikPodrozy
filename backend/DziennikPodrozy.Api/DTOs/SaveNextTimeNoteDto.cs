using System.ComponentModel.DataAnnotations;

namespace DziennikPodrozy.Api.DTOs;

public class SaveNextTimeNoteDto
{
    [MaxLength(2000)]
    public string? Text { get; set; }
}