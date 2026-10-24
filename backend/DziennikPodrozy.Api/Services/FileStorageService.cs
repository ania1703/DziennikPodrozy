using System.Text;

namespace DziennikPodrozy.Api.Services;

public record SavedFile(string? Url, string? Error);

public class FileStorageService
{
    private static readonly byte[] PngSignature = { 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A };

    private readonly string _webRoot;

    public FileStorageService(IWebHostEnvironment environment)
    {
        _webRoot = environment.WebRootPath ?? Path.Combine(environment.ContentRootPath, "wwwroot");
    }

    public async Task<SavedFile> SaveImageAsync(IFormFile? file, string folder, long maxSizeBytes)
    {
        if (file == null || file.Length == 0)
        {
            return new SavedFile(null, "Nie przesłano pliku.");
        }

        if (file.Length > maxSizeBytes)
        {
            return new SavedFile(null, $"Plik jest za duży (maks. {maxSizeBytes / 1024 / 1024} MB).");
        }

        var extension = await DetectExtensionAsync(file);

        if (extension == null)
        {
            return new SavedFile(null, "Dozwolone są tylko prawidłowe pliki JPG, PNG i WebP.");
        }

        var targetFolder = Path.Combine(_webRoot, folder);
        Directory.CreateDirectory(targetFolder);

        var fileName = $"{Guid.NewGuid()}{extension}";
        var filePath = Path.Combine(targetFolder, fileName);

        await using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        return new SavedFile($"/{folder}/{fileName}", null);
    }

    public void Delete(string? url)
    {
        if (string.IsNullOrEmpty(url))
        {
            return;
        }

        var root = Path.GetFullPath(_webRoot);
        var filePath = Path.GetFullPath(Path.Combine(root, url.TrimStart('/')));

        if (!filePath.StartsWith(root + Path.DirectorySeparatorChar))
        {
            return;
        }

        if (File.Exists(filePath))
        {
            File.Delete(filePath);
        }
    }

    private static async Task<string?> DetectExtensionAsync(IFormFile file)
    {
        var header = new byte[12];

        await using var stream = file.OpenReadStream();
        var read = await stream.ReadAtLeastAsync(header, header.Length, throwOnEndOfStream: false);

        if (read >= 3 && header[0] == 0xFF && header[1] == 0xD8 && header[2] == 0xFF)
        {
            return ".jpg";
        }

        if (read >= 8 && header.Take(8).SequenceEqual(PngSignature))
        {
            return ".png";
        }

        if (read >= 12
            && Encoding.ASCII.GetString(header, 0, 4) == "RIFF"
            && Encoding.ASCII.GetString(header, 8, 4) == "WEBP")
        {
            return ".webp";
        }

        return null;
    }
}