namespace server.Application.DTOs;

public record FeedbackRequest(
    string ProjectId,
    string UserId,
    int Rating,
    string? Comment,
    DateTime Timestamp
);