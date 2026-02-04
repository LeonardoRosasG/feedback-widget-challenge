using server.Application.DTOs;

namespace server.Application.Services.Interfaces;

public interface IFeedbackService
{
    Task<FeedbackResponse> SubmitFeedbackAsync(FeedbackRequest request, CancellationToken cancellationToken = default);
    Task<IEnumerable<FeedbackResponse>> GetFeedbacksByProjectIdAsync(string projectId, CancellationToken cancellationToken = default);
}
