using FluentAssertions;
using server.Application.DTOs;
using server.Application.Validators;

namespace server.Tests.Validators;

public class FeedbackRequestValidatorTests
{
    private readonly FeedbackRequestValidator _validator;

    public FeedbackRequestValidatorTests()
    {
        _validator = new FeedbackRequestValidator();
    }

    [Fact]
    public void Validate_WithValidRequest_ShouldPass()
    {
        // Arrange
        var request = new FeedbackRequest(
            ProjectId: "test-project",
            UserId: "user-123",
            Rating: 5,
            Comment: "Great experience!",
            Timestamp: DateTime.UtcNow
        );

        // Act
        var result = _validator.Validate(request);

        // Assert
        result.IsValid.Should().BeTrue();
        result.Errors.Should().BeEmpty();
    }

    [Fact]
    public void Validate_WithEmptyProjectId_ShouldFail()
    {
        // Arrange
        var request = new FeedbackRequest(
            ProjectId: "",
            UserId: "user-123",
            Rating: 5,
            Comment: null,
            Timestamp: DateTime.UtcNow
        );

        // Act
        var result = _validator.Validate(request);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "ProjectId");
    }

    [Fact]
    public void Validate_WithEmptyUserId_ShouldFail()
    {
        // Arrange
        var request = new FeedbackRequest(
            ProjectId: "test-project",
            UserId: "",
            Rating: 5,
            Comment: null,
            Timestamp: DateTime.UtcNow
        );

        // Act
        var result = _validator.Validate(request);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "UserId");
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    [InlineData(6)]
    [InlineData(10)]
    public void Validate_WithInvalidRating_ShouldFail(int rating)
    {
        // Arrange
        var request = new FeedbackRequest(
            ProjectId: "test-project",
            UserId: "user-123",
            Rating: rating,
            Comment: null,
            Timestamp: DateTime.UtcNow
        );

        // Act
        var result = _validator.Validate(request);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Rating");
    }

    [Theory]
    [InlineData(1)]
    [InlineData(2)]
    [InlineData(3)]
    [InlineData(4)]
    [InlineData(5)]
    public void Validate_WithValidRating_ShouldPass(int rating)
    {
        // Arrange
        var request = new FeedbackRequest(
            ProjectId: "test-project",
            UserId: "user-123",
            Rating: rating,
            Comment: null,
            Timestamp: DateTime.UtcNow
        );

        // Act
        var result = _validator.Validate(request);

        // Assert
        result.IsValid.Should().BeTrue();
    }

    [Fact]
    public void Validate_WithInvalidProjectIdCharacters_ShouldFail()
    {
        // Arrange
        var request = new FeedbackRequest(
            ProjectId: "invalid project!@#",
            UserId: "user-123",
            Rating: 5,
            Comment: null,
            Timestamp: DateTime.UtcNow
        );

        // Act
        var result = _validator.Validate(request);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "ProjectId");
    }

    [Fact]
    public void Validate_WithNullComment_ShouldPass()
    {
        // Arrange
        var request = new FeedbackRequest(
            ProjectId: "test-project",
            UserId: "user-123",
            Rating: 5,
            Comment: null,
            Timestamp: DateTime.UtcNow
        );

        // Act
        var result = _validator.Validate(request);

        // Assert
        result.IsValid.Should().BeTrue();
    }

    [Fact]
    public void Validate_WithLongComment_ShouldFail()
    {
        // Arrange
        var longComment = new string('a', 1001); // Exceeds 1000 character limit
        var request = new FeedbackRequest(
            ProjectId: "test-project",
            UserId: "user-123",
            Rating: 5,
            Comment: longComment,
            Timestamp: DateTime.UtcNow
        );

        // Act
        var result = _validator.Validate(request);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Comment");
    }
}
