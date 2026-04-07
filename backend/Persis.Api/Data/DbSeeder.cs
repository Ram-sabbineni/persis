using Microsoft.EntityFrameworkCore;
using Persis.Api.Models;

namespace Persis.Api.Data;

/// <summary>
/// Seeds sample Indian menu items on first run (idempotent).
/// </summary>
public static class DbSeeder
{
    public static async Task SeedAsync(AppDbContext db, ILogger logger, CancellationToken ct = default)
    {
        // Auto-select the right startup behavior by provider.
        if (db.Database.IsRelational())
        {
            await db.Database.MigrateAsync(ct);
        }
        else
        {
            await db.Database.EnsureCreatedAsync(ct);
        }

        if (await db.MenuItems.AnyAsync(ct))
        {
            logger.LogInformation("Menu already seeded; skipping.");
            return;
        }

        var items = new List<MenuItem>
        {
            new()
            {
                Name = "Chicken Biryani",
                Description = "Fragrant basmati rice layered with spiced chicken, herbs, and saffron.",
                Price = 16.99m,
                ImageUrl = "/images/chicken-biryani.jpg",
                Category = "Mains",
                IsAvailable = true
            },
            new()
            {
                Name = "Mutton Biryani",
                Description = "Slow-cooked goat with aromatic spices and long-grain basmati rice.",
                Price = 18.99m,
                ImageUrl = "/images/mutton-biryani.jpg",
                Category = "Mains",
                IsAvailable = true
            },
            new()
            {
                Name = "Paneer Butter Masala",
                Description = "Cottage cheese in a rich tomato-butter gravy with kasuri methi.",
                Price = 14.50m,
                ImageUrl = "/images/paneer-butter-masala.jpg",
                Category = "Vegetarian",
                IsAvailable = true
            },
            new()
            {
                Name = "Butter Chicken",
                Description = "Tandoori chicken simmered in creamy tomato sauce — a classic favorite.",
                Price = 15.99m,
                ImageUrl = "/images/butter-chicken.jpg",
                Category = "Mains",
                IsAvailable = true
            },
            new()
            {
                Name = "Garlic Naan",
                Description = "Soft leavened bread brushed with garlic butter, baked in the tandoor.",
                Price = 3.99m,
                ImageUrl = "/images/garlic-naan.jpg",
                Category = "Bread",
                IsAvailable = true
            },
            new()
            {
                Name = "Samosa",
                Description = "Crispy pastry filled with spiced potatoes and peas — two pieces.",
                Price = 5.99m,
                ImageUrl = "/images/samosa.jpg",
                Category = "Starters",
                IsAvailable = true
            },
            new()
            {
                Name = "Gulab Jamun",
                Description = "Warm milk dumplings soaked in rose-cardamom syrup.",
                Price = 5.50m,
                ImageUrl = "/images/gulab-jamun.jpg",
                Category = "Dessert",
                IsAvailable = true
            },
            new()
            {
                Name = "Mango Lassi",
                Description = "Chilled yogurt drink blended with ripe mango.",
                Price = 4.99m,
                ImageUrl = "/images/mango-lassi.jpg",
                Category = "Beverages",
                IsAvailable = true
            }
        };

        db.MenuItems.AddRange(items);
        await db.SaveChangesAsync(ct);
        logger.LogInformation("Seeded {Count} menu items.", items.Count);
    }
}
