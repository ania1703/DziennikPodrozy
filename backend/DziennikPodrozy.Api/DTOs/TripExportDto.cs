namespace DziennikPodrozy.Api.DTOs;

public record ExportPhotoDto(string? File, string? Caption);

public record ExportRecordingDto(string? File, int DurationSeconds, DateTime RecordedAt);

public record ExportWeatherDto(
    int WeatherCode,
    string Description,
    double TemperatureMax,
    double TemperatureMin,
    double PrecipitationMm);

public record ExportStopDto(
    int Number,
    string Title,
    double Latitude,
    double Longitude,
    string? CountryCode,
    ExportWeatherDto? Weather,
    string? Entry,
    string? EntryHtml,
    List<ExportPhotoDto> Photos,
    List<ExportRecordingDto> Recordings);

public record ExportDayDto(DateOnly Date, int DayNumber, string? Note, List<ExportStopDto> Stops);

public record ExportTripDto(
    string Title,
    string? Motto,
    DateOnly StartDate,
    DateOnly? EndDate,
    string Status,
    bool IsDescribed,
    string? NextTimeNote,
    bool HasCoverPhoto,
    string? CoverPhotoFile);

public record TripExportDto(DateTime ExportedAt, ExportTripDto Trip, List<ExportDayDto> Days);

public record ExportedFile(string StoredUrl, string EntryName);

public record TripExportResult(TripExportDto Export, List<ExportedFile> Files);