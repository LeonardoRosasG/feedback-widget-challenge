using server.Domain.Entities;

namespace server.Infrastructure.Repositories.Interfaces;

public interface IFeedbackRepository
{
    Task<Feedback?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IEnumerable<Feedback>> GetByProjectIdAsync(string projectId, CancellationToken cancellationToken = default);
    Task<IEnumerable<Feedback>> GetByUserIdAsync(string userId, CancellationToken cancellationToken = default);
    Task AddAsync(Feedback feedback, CancellationToken cancellationToken = default);
    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}
