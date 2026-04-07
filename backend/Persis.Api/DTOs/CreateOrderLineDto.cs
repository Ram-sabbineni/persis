namespace Persis.Api.DTOs;

/// <summary>
/// One cart line sent from the React app when placing an order.
/// </summary>
public class CreateOrderLineDto
{
    public int MenuItemId { get; set; }
    public int Quantity { get; set; }
}
