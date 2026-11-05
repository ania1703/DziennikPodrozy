using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace DziennikPodrozy.Api.Models;

[Index(nameof(TripId), nameof(Date), IsUnique = true)]
public class DayNote
{
    public int Id { get; set; }

    public int TripId { get; set; }

    [ForeignKey(nameof(TripId))]
    public Trip? Trip { get; set; }

    public DateOnly Date { get; set; }

    [Required]
    [MaxLength(2000)]
    public string Text { get; set; } = string.Empty;
}