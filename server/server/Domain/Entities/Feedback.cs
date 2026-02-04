namespace server.Domain.Entities;

public class Feedback
{
    public Guid Id { get; private set; }
    public string ProjectId { get; private set; } = string.Empty;
    public string UserId { get; private set; } = string.Empty;
    public int Rating { get; private set; }
    public string? Comment { get; private set; }
    public DateTime Timestamp { get; private set; }
    public DateTime CreatedAt { get; private set; }

    private Feedback() { }

    public static Feedback Create(
        string projectId,
        string userId, 
        int rating, 
        string? comment, 
        DateTime timestamp)
    {
        if (rating < 1 || rating > 5)
            throw new ArgumentOutOfRangeException(nameof(rating), "Rating must be between 1 and 5.");

        return new Feedback
        {
            Id = Guid.NewGuid(),
            ProjectId = projectId,
            UserId = userId,
            Rating = rating,
            Comment = string.IsNullOrWhiteSpace(comment) ? null : comment.Trim(),
            Timestamp = timestamp,
            CreatedAt = DateTime.UtcNow
        };
    }
}
