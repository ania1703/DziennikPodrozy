namespace DziennikPodrozy.Api.DTOs;

public class DayNoteDto
{
    public DateOnly Date { get; set; }
    public string Text { get; set; } = string.Empty;
}