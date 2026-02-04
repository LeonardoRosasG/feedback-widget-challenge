namespace server.Application.DTOs;

public record FeedbackResponse(
    bool Success,
    string Message,
    Guid? FeedbackId = null
);

public record ValidationErrorResponse(
    bool Success,
    string Message,
    IDictionary<string, string[]> Errors
);

public record HealthCheckResponse(
    string Status,
    DateTime Timestamp,
    string Version
);