namespace DziennikPodrozy.Api.DTOs;

public class WeatherDto
{
    public int WeatherCode { get; set; }
    public double TemperatureMax { get; set; }
    public double TemperatureMin { get; set; }
    public double PrecipitationMm { get; set; }
}