using System.ComponentModel.DataAnnotations;

namespace Persis.Api.DTOs;

/// <summary>
/// Checkout payload. Card number is used only to derive last 4 — never persisted in full.
/// </summary>
public class CreateOrderDto
{
    [Required, MaxLength(200)]
    public string CustomerName { get; set; } = string.Empty;

    [Required, MaxLength(30)]
    public string PhoneNumber { get; set; } = string.Empty;

    [Required, EmailAddress, MaxLength(256)]
    public string Email { get; set; } = string.Empty;

    [Required, MaxLength(200)]
    public string CardHolderName { get; set; } = string.Empty;

    /// <summary>Digits only or spaced; server extracts last 4 only.</summary>
    [Required, MinLength(13), MaxLength(23)]
    public string CardNumber { get; set; } = string.Empty;

    [Required, MaxLength(7)]
    public string Expiry { get; set; } = string.Empty;

    [Required, MinLength(3), MaxLength(4)]
    public string Cvv { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? BillingAddress { get; set; }

    [Required, MinLength(1)]
    public List<CreateOrderLineDto> Lines { get; set; } = new();

    public decimal Subtotal { get; set; }
    public decimal Discount { get; set; }
    public decimal Total { get; set; }
}
