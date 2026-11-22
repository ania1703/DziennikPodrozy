using DziennikPodrozy.Api.Services;
using DziennikPodrozy.Tests.Infrastructure;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.FileProviders;

namespace DziennikPodrozy.Tests.Unit;

public class FileStorageServiceTests : IDisposable
{
    private readonly string _root = Path.Combine(Path.GetTempPath(), "dziennik-files-" + Guid.NewGuid().ToString("N"));
    private readonly FileStorageService _storage;

    public FileStorageServiceTests()
    {
        Directory.CreateDirectory(_root);
        _storage = new FileStorageService(new FakeEnvironment(_root));
    }

    public void Dispose()
    {
        if (Directory.Exists(_root))
        {
            Directory.Delete(_root, recursive: true);
        }
    }

    private static IFormFile FormFile(byte[] bytes, string name = "plik.bin")
    {
        return new FormFile(new MemoryStream(bytes), 0, bytes.Length, "file", name);
    }

    [Fact]
    public async Task SaveImageAsync_Png_IsStoredWithPngExtension()
    {
        var saved = await _storage.SaveImageAsync(FormFile(TestFiles.Png()), "stop-photos", 1024 * 1024);

        Assert.Null(saved.Error);
        Assert.StartsWith("/stop-photos/", saved.Url);
        Assert.EndsWith(".png", saved.Url);
        Assert.NotNull(_storage.FindPath(saved.Url));
    }

    [Fact]
    public async Task SaveImageAsync_Jpeg_IsStoredWithJpgExtension()
    {
        var saved = await _storage.SaveImageAsync(FormFile(TestFiles.Jpeg()), "stop-photos", 1024 * 1024);

        Assert.Null(saved.Error);
        Assert.EndsWith(".jpg", saved.Url);
    }

    [Fact]
    public async Task SaveImageAsync_Webp_IsStoredWithWebpExtension()
    {
        var webp = System.Text.Encoding.ASCII.GetBytes("RIFF").Concat(new byte[4])
            .Concat(System.Text.Encoding.ASCII.GetBytes("WEBP")).Concat(new byte[16]).ToArray();

        var saved = await _storage.SaveImageAsync(FormFile(webp), "stop-photos", 1024 * 1024);

        Assert.Null(saved.Error);
        Assert.EndsWith(".webp", saved.Url);
    }

    [Fact]
    public async Task SaveImageAsync_TextFileWithImageName_IsRejected()
    {
        var saved = await _storage.SaveImageAsync(FormFile(TestFiles.Text(), "zdjecie.jpg"), "stop-photos", 1024 * 1024);

        Assert.Null(saved.Url);
        Assert.Equal("Dozwolone są tylko prawidłowe pliki JPG, PNG i WebP.", saved.Error);
    }

    [Fact]
    public async Task SaveImageAsync_NoFile_IsRejected()
    {
        var saved = await _storage.SaveImageAsync(null, "stop-photos", 1024);

        Assert.Equal("Nie przesłano pliku.", saved.Error);
    }

    [Fact]
    public async Task SaveImageAsync_EmptyFile_IsRejected()
    {
        var saved = await _storage.SaveImageAsync(FormFile(Array.Empty<byte>()), "stop-photos", 1024);

        Assert.Equal("Nie przesłano pliku.", saved.Error);
    }

    [Fact]
    public async Task SaveImageAsync_TooLargeFile_IsRejected()
    {
        var saved = await _storage.SaveImageAsync(FormFile(TestFiles.Png(100)), "stop-photos", 50);

        Assert.Null(saved.Url);
        Assert.Contains("za duży", saved.Error);
    }

    [Theory]
    [InlineData(new byte[] { 0x1A, 0x45, 0xDF, 0xA3 }, ".webm")]
    [InlineData(new byte[] { 0x4F, 0x67, 0x67, 0x53 }, ".ogg")]
    public async Task SaveAudioAsync_KnownFormats_GetMatchingExtension(byte[] signature, string extension)
    {
        var bytes = signature.Concat(new byte[32]).ToArray();

        var saved = await _storage.SaveAudioAsync(FormFile(bytes), "stop-recordings", 1024 * 1024);

        Assert.Null(saved.Error);
        Assert.EndsWith(extension, saved.Url);
    }

    [Fact]
    public async Task SaveAudioAsync_Mp4_IsStoredAsM4a()
    {
        var bytes = new byte[4].Concat(System.Text.Encoding.ASCII.GetBytes("ftyp")).Concat(new byte[32]).ToArray();

        var saved = await _storage.SaveAudioAsync(FormFile(bytes), "stop-recordings", 1024 * 1024);

        Assert.Null(saved.Error);
        Assert.EndsWith(".m4a", saved.Url);
    }

    [Fact]
    public async Task SaveAudioAsync_Image_IsRejected()
    {
        var saved = await _storage.SaveAudioAsync(FormFile(TestFiles.Png()), "stop-recordings", 1024 * 1024);

        Assert.Equal("Dozwolone są tylko prawidłowe nagrania WebM, OGG i MP4.", saved.Error);
    }

    [Fact]
    public async Task Delete_RemovesStoredFile()
    {
        var saved = await _storage.SaveImageAsync(FormFile(TestFiles.Png()), "stop-photos", 1024 * 1024);
        var path = _storage.FindPath(saved.Url)!;

        _storage.Delete(saved.Url);

        Assert.False(File.Exists(path));
        Assert.Null(_storage.FindPath(saved.Url));
    }

    [Fact]
    public void Delete_NullOrEmpty_DoesNothing()
    {
        _storage.Delete(null);
        _storage.Delete(string.Empty);
    }

    [Fact]
    public void Delete_PathOutsideRoot_IsIgnored()
    {
        var outside = Path.Combine(Path.GetTempPath(), "dziennik-outside-" + Guid.NewGuid().ToString("N") + ".txt");
        File.WriteAllText(outside, "nie usuwaj");

        try
        {
            _storage.Delete("/../" + Path.GetFileName(outside));

            Assert.True(File.Exists(outside));
        }
        finally
        {
            File.Delete(outside);
        }
    }

    [Fact]
    public void FindPath_PathOutsideRoot_ReturnsNull()
    {
        Assert.Null(_storage.FindPath("/../../Windows/win.ini"));
    }

    [Fact]
    public void FindPath_MissingFile_ReturnsNull()
    {
        Assert.Null(_storage.FindPath("/stop-photos/nie-ma.png"));
    }

    private class FakeEnvironment : IWebHostEnvironment
    {
        public FakeEnvironment(string root)
        {
            WebRootPath = root;
            ContentRootPath = root;
        }

        public string WebRootPath { get; set; }
        public IFileProvider WebRootFileProvider { get; set; } = new NullFileProvider();
        public string ApplicationName { get; set; } = "Tests";
        public IFileProvider ContentRootFileProvider { get; set; } = new NullFileProvider();
        public string ContentRootPath { get; set; }
        public string EnvironmentName { get; set; } = "Testing";
    }
}
