using System.Text;

namespace DziennikPodrozy.Api.Services;

public record SavedFile(string? Url, string? Error);

public class FileStorageService
{
    private static readonly byte[] PngSignature = { 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A };
    private static readonly byte[] WebmSignature = { 0x1A, 0x45, 0xDF, 0xA3 };

    private readonly string _webRoot;

    public FileStorageService(IWebHostEnvironment environment)
    {
        _webRoot = environment.WebRootPath ?? Path.Combine(environment.ContentRootPath, "wwwroot");
    }

    public async Task<SavedFile> SaveImageAsync(IFormFile? file, string folder, long maxSizeBytes)
    {
        var problem = CheckFile(file, maxSizeBytes);

        if (problem != null)
        {
            return problem;
        }

        var extension = DetectImageExtension(await ReadHeaderAsync(file!));

        if (extension == null)
        {
            return new SavedFile(null, "Dozwolone są tylko prawidłowe pliki JPG, PNG i WebP.");
        }

        return await StoreAsync(file!, folder, extension);
    }

    public async Task<SavedFile> SaveAudioAsync(IFormFile? file, string folder, long maxSizeBytes)
    {
        var problem = CheckFile(file, maxSizeBytes);

        if (problem != null)
        {
            return problem;
        }

        var extension = DetectAudioExtension(await ReadHeaderAsync(file!));

        if (extension == null)
        {
            return new SavedFile(null, "Dozwolone są tylko prawidłowe nagrania WebM, OGG i MP4.");
        }

        return await StoreAsync(file!, folder, extension);
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

    private static SavedFile? CheckFile(IFormFile? file, long maxSizeBytes)
    {
        if (file == null || file.Length == 0)
        {
            return new SavedFile(null, "Nie przesłano pliku.");
        }

        if (file.Length > maxSizeBytes)
        {
            return new SavedFile(null, $"Plik jest za duży (maks. {maxSizeBytes / 1024 / 1024} MB).");
        }

        return null;
    }

    private async Task<SavedFile> StoreAsync(IFormFile file, string folder, string extension)
    {
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

    private static async Task<byte[]> ReadHeaderAsync(IFormFile file)
    {
        var header = new byte[12];

        await using var stream = file.OpenReadStream();
        var read = await stream.ReadAtLeastAsync(header, header.Length, throwOnEndOfStream: false);

        return header.Take(read).ToArray();
    }

    private static string? DetectImageExtension(byte[] header)
    {
        if (header.Length >= 3 && header[0] == 0xFF && header[1] == 0xD8 && header[2] == 0xFF)
        {
            return ".jpg";
        }

        if (header.Length >= 8 && header.Take(8).SequenceEqual(PngSignature))
        {
            return ".png";
        }

        if (header.Length >= 12
            && Encoding.ASCII.GetString(header, 0, 4) == "RIFF"
            && Encoding.ASCII.GetString(header, 8, 4) == "WEBP")
        {
            return ".webp";
        }

        return null;
    }

    private static string? DetectAudioExtension(byte[] header)
    {
        if (header.Length >= 4 && header.Take(4).SequenceEqual(WebmSignature))
        {
            return ".webm";
        }

        if (header.Length >= 4 && Encoding.ASCII.GetString(header, 0, 4) == "OggS")
        {
            return ".ogg";
        }

        if (header.Length >= 8 && Encoding.ASCII.GetString(header, 4, 4) == "ftyp")
        {
            return ".m4a";
        }

        return null;
    }
}