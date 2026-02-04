using FluentAssertions;
using server.Domain.Entities;

namespace server.Tests.Domain;

public class FeedbackEntityTests
{
    [Fact]
    public void Create_WithValidData_ShouldCreateFeedbackEntity()
    {
        // Arrange
        var projectId = "test-project";
        var userId = "user-123";
        var rating = 5;
        var comment = "Great experience!";
        var timestamp = DateTime.UtcNow;

        // Act
        var feedback = Feedback.Create(projectId, userId, rating, comment, timestamp);

        // Assert
        feedback.Should().NotBeNull();
        feedback.ProjectId.Should().Be(projectId);
        feedback.UserId.Should().Be(userId);
        feedback.Rating.Should().Be(rating);
        feedback.Comment.Should().Be(comment);
        feedback.Timestamp.Should().Be(timestamp);
        feedback.Id.Should().NotBeEmpty();
    }

    [Fact]
    public void Create_WithNullComment_ShouldCreateFeedbackEntity()
    {
        // Arrange
        var projectId = "test-project";
        var userId = "user-123";
        var rating = 4;
        var timestamp = DateTime.UtcNow;

        // Act
        var feedback = Feedback.Create(projectId, userId, rating, null, timestamp);

        // Assert
        feedback.Should().NotBeNull();
        feedback.Comment.Should().BeNull();
    }

    [Fact]
    public void Create_ShouldGenerateUniqueIds()
    {
        // Arrange & Act
        var feedback1 = Feedback.Create("project1", "user1", 5, null, DateTime.UtcNow);
        var feedback2 = Feedback.Create("project2", "user2", 4, null, DateTime.UtcNow);

        // Assert
        feedback1.Id.Should().NotBe(feedback2.Id);
    }

    [Theory]
    [InlineData(1)]
    [InlineData(2)]
    [InlineData(3)]
    [InlineData(4)]
    [InlineData(5)]
    public void Create_WithValidRatings_ShouldStoreRating(int rating)
    {
        // Act
        var feedback = Feedback.Create("project", "user", rating, null, DateTime.UtcNow);

        // Assert
        feedback.Rating.Should().Be(rating);
    }
}
