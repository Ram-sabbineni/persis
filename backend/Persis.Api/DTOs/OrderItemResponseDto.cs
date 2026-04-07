namespace Persis.Api.DTOs;

public record OrderItemResponseDto(
    int Id,
    int MenuItemId,
    string ItemName,
    int Quantity,
    decimal UnitPrice,
    decimal LineTotal);
