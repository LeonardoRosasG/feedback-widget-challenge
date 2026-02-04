using server.Application.DTOs;
using server.Application.Services.Interfaces;
using server.Domain.Entities;
using server.Infrastructure.Repositories.Interfaces;

namespace server.Application.Services;

public class FeedbackService : IFeedbackService
{
    private readonly ILogger<FeedbackService> _logger;
    private readonly IFeedbackRepository _feedbackRepository;

    public FeedbackService(ILogger<FeedbackService> logger, IFeedbackRepository feedbackRepository)
    {
        _logger = logger;
        _feedbackRepository = feedbackRepository;
    }

    public async Task<FeedbackResponse> SubmitFeedbackAsync(FeedbackRequest request, CancellationToken cancellationToken = default)
    {
        try
        {
            var feedback = Feedback.Create(
                request.ProjectId,
                request.UserId,
                request.Rating,
                request.Comment,
                request.Timestamp
            );

            await _feedbackRepository.AddAsync(feedback, cancellationToken);
            await _feedbackRepository.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Feedback submitted successfully. Id: {FeedbackId}, Project: {ProjectId}, Rating: {Rating}",
                feedback.Id, feedback.ProjectId, feedback.Rating);

            return new FeedbackResponse(
                Success: true,
                Message: "Feedback submitted successfully.",
                FeedbackId: feedback.Id
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error submitting feedback for ProjectId: {ProjectId}, UserId: {UserId}",
                request.ProjectId, request.UserId);
            throw;
        }
    }

    public async Task<IEnumerable<FeedbackResponse>> GetFeedbacksByProjectIdAsync(string projectId, CancellationToken cancellationToken = default)
    {
        try
        {
            var feedbacks = await _feedbackRepository.GetByProjectIdAsync(projectId, cancellationToken);

            _logger.LogInformation("Retrieved {Count} feedback entries for ProjectId: {ProjectId}",
                feedbacks.Count(), projectId);

            return feedbacks.Select(f => new FeedbackResponse(
                Success: true,
                Message: "Feedback retrieved successfully.",
                FeedbackId: f.Id
            ));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving feedback for ProjectId: {ProjectId}", projectId);
            throw;
        }
    }
}
