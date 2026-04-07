using Microsoft.EntityFrameworkCore;
using Persis.Api.Data;
using Persis.Api.DTOs;
using Persis.Api.Models;

namespace Persis.Api.Services;

/// <summary>
/// Orders are priced from the database (not trusted client totals). Discount: $5 when subtotal &gt;= $30.
/// </summary>
public class OrderService : IOrderService
{
    private const decimal DiscountThreshold = 30m;
    private const decimal DiscountAmount = 5m;

    private readonly AppDbContext _db;
    private readonly ILogger<OrderService> _logger;

    public OrderService(AppDbContext db, ILogger<OrderService> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<OrderResponseDto> CreateAsync(CreateOrderDto dto, CancellationToken ct = default)
    {
        if (dto.Lines is null || dto.Lines.Count == 0)
            throw new ArgumentException("Order must contain at least one line item.");

        // Merge duplicate menu lines (same id) into one row with summed quantity.
        var mergedLines = dto.Lines
            .GroupBy(l => l.MenuItemId)
            .Select(g => new CreateOrderLineDto
            {
                MenuItemId = g.Key,
                Quantity = g.Sum(x => x.Quantity)
            })
            .ToList();

        var menuIds = mergedLines.Select(l => l.MenuItemId).Distinct().ToList();
        var menuItems = await _db.MenuItems
            .Where(m => menuIds.Contains(m.Id))
            .ToDictionaryAsync(m => m.Id, ct);

        if (menuItems.Count != menuIds.Count)
            throw new InvalidOperationException("One or more menu items were not found.");

        foreach (var line in mergedLines)
        {
            if (line.Quantity < 1)
                throw new ArgumentException("Quantity must be at least 1 for each line.");
            if (!menuItems[line.MenuItemId].IsAvailable)
                throw new InvalidOperationException($"Item '{menuItems[line.MenuItemId].Name}' is not available.");
        }

        decimal subtotal = 0;
        var orderItems = new List<OrderItem>();

        foreach (var line in mergedLines)
        {
            var mi = menuItems[line.MenuItemId];
            var unit = mi.Price;
            var lineTotal = Math.Round(unit * line.Quantity, 2, MidpointRounding.AwayFromZero);
            subtotal += lineTotal;
            orderItems.Add(new OrderItem
            {
                MenuItemId = mi.Id,
                ItemName = mi.Name,
                Quantity = line.Quantity,
                UnitPrice = unit,
                LineTotal = lineTotal
            });
        }

        subtotal = Math.Round(subtotal, 2, MidpointRounding.AwayFromZero);
        var discount = subtotal >= DiscountThreshold ? DiscountAmount : 0m;
        var total = Math.Round(subtotal - discount, 2, MidpointRounding.AwayFromZero);

        var digits = new string(dto.CardNumber.Where(char.IsDigit).ToArray());
        if (digits.Length < 13 || digits.Length > 19)
            throw new ArgumentException("Invalid card number format.");

        var last4 = digits[^4..];

        var order = new Order
        {
            CustomerName = dto.CustomerName.Trim(),
            PhoneNumber = dto.PhoneNumber.Trim(),
            Email = dto.Email.Trim(),
            Subtotal = subtotal,
            Discount = discount,
            Total = total,
            PaymentLast4 = last4,
            CreatedAt = DateTime.UtcNow,
            OrderItems = orderItems
        };

        _db.Orders.Add(order);
        await _db.SaveChangesAsync(ct);

        _logger.LogInformation(
            "Order {OrderId} created for {Email}, total {Total}, card ****{Last4}",
            order.Id,
            order.Email,
            order.Total,
            last4);

        return await MapToResponseAsync(order.Id, ct)
               ?? throw new InvalidOperationException("Failed to load created order.");
    }

    public async Task<IReadOnlyList<OrderResponseDto>> GetAllAsync(CancellationToken ct = default)
    {
        var orders = await _db.Orders
            .AsNoTracking()
            .Include(o => o.OrderItems)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync(ct);

        return orders.Select(MapOrder).ToList();
    }

    public async Task<OrderResponseDto?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        return await MapToResponseAsync(id, ct);
    }

    private async Task<OrderResponseDto?> MapToResponseAsync(int id, CancellationToken ct)
    {
        var o = await _db.Orders
            .AsNoTracking()
            .Include(x => x.OrderItems)
            .FirstOrDefaultAsync(x => x.Id == id, ct);
        return o is null ? null : MapOrder(o);
    }

    private static OrderResponseDto MapOrder(Order o)
    {
        var items = o.OrderItems
            .Select(i => new OrderItemResponseDto(
                i.Id,
                i.MenuItemId,
                i.ItemName,
                i.Quantity,
                i.UnitPrice,
                i.LineTotal))
            .ToList();

        return new OrderResponseDto(
            o.Id,
            o.CustomerName,
            o.PhoneNumber,
            o.Email,
            o.Subtotal,
            o.Discount,
            o.Total,
            o.PaymentLast4,
            o.CreatedAt,
            items);
    }
}
