using Microsoft.EntityFrameworkCore;
using NbaTracker.Api.Models;

namespace NbaTracker.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<CachedGame> Games { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<CachedGame>().HasKey(g => g.Id);
    }
}
