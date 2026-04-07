namespace Persis.Api.DTOs;

public record OrderResponseDto(
    int Id,
    string CustomerName,
    string PhoneNumber,
    string Email,
    decimal Subtotal,
    decimal Discount,
    decimal Total,
    string PaymentLast4,
    DateTime CreatedAt,
    IReadOnlyList<OrderItemResponseDto> Items);
