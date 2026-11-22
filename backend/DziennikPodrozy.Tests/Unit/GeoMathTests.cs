using DziennikPodrozy.Api.Services;

namespace DziennikPodrozy.Tests.Unit;

public class GeoMathTests
{
    [Fact]
    public void DistanceKm_WarsawToKrakow_IsAboutTwoHundredFiftyKilometers()
    {
        var distance = GeoMath.DistanceKm(52.2297, 21.0122, 50.0647, 19.9450);

        Assert.InRange(distance, 250, 256);
    }

    [Fact]
    public void DistanceKm_SamePoint_IsZero()
    {
        Assert.Equal(0, GeoMath.DistanceKm(50.05, 19.93, 50.05, 19.93), precision: 6);
    }

    [Fact]
    public void DistanceKm_IsSymmetric()
    {
        var there = GeoMath.DistanceKm(50.05, 19.93, 41.89, 12.49);
        var back = GeoMath.DistanceKm(41.89, 12.49, 50.05, 19.93);

        Assert.Equal(there, back, precision: 6);
    }

    [Fact]
    public void DistanceKm_QuarterOfEquator_IsAboutTenThousandKilometers()
    {
        var distance = GeoMath.DistanceKm(0, 0, 0, 90);

        Assert.InRange(distance, 10000, 10015);
    }

    [Fact]
    public void DistanceKm_KrakowToRome_IsAboutOneThousandSeventyKilometers()
    {
        var distance = GeoMath.DistanceKm(50.0647, 19.9450, 41.9028, 12.4964);

        Assert.InRange(distance, 1060, 1090);
    }

    [Fact]
    public void DistanceKm_WarsawToRome_IsAboutThirteenHundredKilometers()
    {
        var distance = GeoMath.DistanceKm(52.2297, 21.0122, 41.9028, 12.4964);

        Assert.InRange(distance, 1300, 1330);
    }
}
