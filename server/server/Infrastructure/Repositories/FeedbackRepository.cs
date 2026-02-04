using Microsoft.EntityFrameworkCore;
using server.Domain.Entities;
using server.Infrastructure.Persistence;
using server.Infrastructure.Repositories.Interfaces;

namespace server.Infrastructure.Repositories;

public class FeedbackRepository : IFeedbackRepository
{
    private readonly AppDbContext _context;
    public FeedbackRepository(AppDbContext context)
    {
        _context = context;
    }
    public async Task AddAsync(Feedback feedback, CancellationToken cancellationToken = default)
    {
        await _context.Feedbacks.AddAsync(feedback, cancellationToken);
    }

    public async Task<Feedback?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Feedbacks
            .AsNoTracking()
            .FirstOrDefaultAsync(f => f.Id == id, cancellationToken);
    }

    public async Task<IEnumerable<Feedback>> GetByProjectIdAsync(string projectId, CancellationToken cancellationToken = default)
    {
        return await _context.Feedbacks
            .AsNoTracking()
            .Where(f => f.ProjectId == projectId)
            .OrderByDescending(f => f.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Feedback>> GetByUserIdAsync(string userId, CancellationToken cancellationToken = default)
    {
        return await _context.Feedbacks
            .AsNoTracking()
            .Where(f => f.UserId == userId)
            .OrderByDescending(f => f.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        await _context.SaveChangesAsync(cancellationToken);
    }
}
