using Microsoft.EntityFrameworkCore;

namespace DziennikPodrozy.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

}