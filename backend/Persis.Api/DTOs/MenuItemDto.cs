namespace Persis.Api.DTOs;

public record MenuItemDto(
    int Id,
    string Name,
    string Description,
    decimal Price,
    string ImageUrl,
    string Category,
    bool IsAvailable);
