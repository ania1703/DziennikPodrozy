using DziennikPodrozy.Api.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace DziennikPodrozy.Api.Data;

public class AppDbContext : IdentityDbContext<ApplicationUser>
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }
    public DbSet<Trip> Trips { get; set; }

    public DbSet<TripStop> TripStops { get; set; }

    public DbSet<StopPhoto> StopPhotos { get; set; }

    public DbSet<StopRecording> StopRecordings { get; set; }

}