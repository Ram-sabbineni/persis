using Microsoft.AspNetCore.Mvc;
using Persis.Api.DTOs;
using Persis.Api.Services;

namespace Persis.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrdersController : ControllerBase
{
    private readonly IOrderService _orders;
    private readonly ILogger<OrdersController> _logger;

    public OrdersController(IOrderService orders, ILogger<OrdersController> logger)
    {
        _orders = orders;
        _logger = logger;
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateOrderDto dto, CancellationToken ct)
    {
        if (!ModelState.IsValid)
            return ValidationProblem(ModelState);

        try
        {
            var created = await _orders.CreateAsync(dto, ct);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Invalid order request.");
            return BadRequest(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Order rejected.");
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create order.");
            return Problem(detail: "Could not place order. Please try again.", statusCode: 500);
        }
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        try
        {
            var list = await _orders.GetAllAsync(ct);
            return Ok(list);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to list orders.");
            return Problem(detail: "Could not load orders.", statusCode: 500);
        }
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id, CancellationToken ct)
    {
        try
        {
            var order = await _orders.GetByIdAsync(id, ct);
            if (order is null)
                return NotFound(new { message = "Order not found." });
            return Ok(order);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to load order {Id}.", id);
            return Problem(detail: "Could not load order.", statusCode: 500);
        }
    }
}
