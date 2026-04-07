using Persis.Api.DTOs;

namespace Persis.Api.Services;

public interface IOrderService
{
    Task<OrderResponseDto> CreateAsync(CreateOrderDto dto, CancellationToken ct = default);
    Task<IReadOnlyList<OrderResponseDto>> GetAllAsync(CancellationToken ct = default);
    Task<OrderResponseDto?> GetByIdAsync(int id, CancellationToken ct = default);
}
