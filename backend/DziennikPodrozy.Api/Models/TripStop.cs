using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DziennikPodrozy.Api.Models;

public class TripStop
{
    public int Id { get; set; }

    public int TripId { get; set; }

    [ForeignKey(nameof(TripId))]
    public Trip? Trip { get; set; }

    [Required]
    [MaxLength(150)]
    public string Title { get; set; } = string.Empty;

    public double Latitude { get; set; }
    public double Longitude { get; set; }

    public DateOnly Date { get; set; }
    public int SortOrder { get; set; }

    [MaxLength(10000)]
    public string? Note { get; set; }

    public List<StopPhoto> Photos { get; set; } = new();

    public List<StopRecording> Recordings { get; set; } = new();

    public int? WeatherCode { get; set; }
    public double? TemperatureMax { get; set; }
    public double? TemperatureMin { get; set; }
    public double? PrecipitationMm { get; set; }
    public DateTime? WeatherCheckedAt { get; set; }
    [MaxLength(2)]
    public string? CountryCode { get; set; }
    public DateTime? CountryCheckedAt { get; set; }
}