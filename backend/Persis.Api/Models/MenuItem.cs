namespace Persis.Api.Models;

/// <summary>
/// A single dish or drink on the restaurant menu (stored in Azure SQL).
/// </summary>
public class MenuItem
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }

    /// <summary>
    /// Path served by the React app, e.g. /images/chicken-biryani.jpg — not a full URL.
    /// </summary>
    public string ImageUrl { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public bool IsAvailable { get; set; } = true;

    public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
}
