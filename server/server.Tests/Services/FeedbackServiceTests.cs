using FluentAssertions;
using Microsoft.Extensions.Logging;
using Moq;
using server.Application.DTOs;
using server.Application.Services;
using server.Domain.Entities;
using server.Infrastructure.Repositories.Interfaces;

namespace server.Tests.Services;

public class FeedbackServiceTests
{
    private readonly Mock<ILogger<FeedbackService>> _loggerMock;
    private readonly Mock<IFeedbackRepository> _repositoryMock;
    private readonly FeedbackService _service;

    public FeedbackServiceTests()
    {
        _loggerMock = new Mock<ILogger<FeedbackService>>();
        _repositoryMock = new Mock<IFeedbackRepository>();
        _service = new FeedbackService(_loggerMock.Object, _repositoryMock.Object);
    }

    [Fact]
    public async Task SubmitFeedbackAsync_WithValidRequest_ShouldReturnSuccessResponse()
    {
        // Arrange
        var request = new FeedbackRequest(
            ProjectId: "test-project",
            UserId: "user-123",
            Rating: 5,
            Comment: "Great!",
            Timestamp: DateTime.UtcNow
        );

        _repositoryMock
            .Setup(r => r.AddAsync(It.IsAny<Feedback>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        _repositoryMock
            .Setup(r => r.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        // Act
        var result = await _service.SubmitFeedbackAsync(request);

        // Assert
        result.Should().NotBeNull();
        result.Success.Should().BeTrue();
        result.Message.Should().Be("Feedback submitted successfully.");
        result.FeedbackId.Should().NotBeEmpty();
    }

    [Fact]
    public async Task SubmitFeedbackAsync_ShouldCallRepositoryAdd()
    {
        // Arrange
        var request = new FeedbackRequest(
            ProjectId: "test-project",
            UserId: "user-123",
            Rating: 4,
            Comment: null,
            Timestamp: DateTime.UtcNow
        );

        _repositoryMock
            .Setup(r => r.AddAsync(It.IsAny<Feedback>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        _repositoryMock
            .Setup(r => r.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        // Act
        await _service.SubmitFeedbackAsync(request);

        // Assert
        _repositoryMock.Verify(
            r => r.AddAsync(It.Is<Feedback>(f => 
                f.ProjectId == "test-project" && 
                f.UserId == "user-123" && 
                f.Rating == 4),
                It.IsAny<CancellationToken>()),
            Times.Once);

        _repositoryMock.Verify(
            r => r.SaveChangesAsync(It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task SubmitFeedbackAsync_WhenRepositoryThrows_ShouldPropagateException()
    {
        // Arrange
        var request = new FeedbackRequest(
            ProjectId: "test-project",
            UserId: "user-123",
            Rating: 5,
            Comment: null,
            Timestamp: DateTime.UtcNow
        );

        _repositoryMock
            .Setup(r => r.AddAsync(It.IsAny<Feedback>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new Exception("Database error"));

        // Act & Assert
        await Assert.ThrowsAsync<Exception>(() => _service.SubmitFeedbackAsync(request));
    }

    [Theory]
    [InlineData(1)]
    [InlineData(3)]
    [InlineData(5)]
    public async Task SubmitFeedbackAsync_WithDifferentRatings_ShouldStoreCorrectRating(int rating)
    {
        // Arrange
        var request = new FeedbackRequest(
            ProjectId: "test-project",
            UserId: "user-123",
            Rating: rating,
            Comment: null,
            Timestamp: DateTime.UtcNow
        );

        Feedback? capturedFeedback = null;
        _repositoryMock
            .Setup(r => r.AddAsync(It.IsAny<Feedback>(), It.IsAny<CancellationToken>()))
            .Callback<Feedback, CancellationToken>((f, _) => capturedFeedback = f)
            .Returns(Task.CompletedTask);

        _repositoryMock
            .Setup(r => r.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        // Act
        await _service.SubmitFeedbackAsync(request);

        // Assert
        capturedFeedback.Should().NotBeNull();
        capturedFeedback!.Rating.Should().Be(rating);
    }
}
