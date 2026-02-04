using server.Api.Filters;
using server.Application.DTOs;
using server.Application.Services.Interfaces;

namespace server.Api.Endpoints
{
    public static class FeedbackEndpoints
    {
        public static void MapFeedbackEndpoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("/api/feedback")
                .WithTags("Feedback")
                .WithOpenApi();

            group.MapPost("/", async (
                FeedbackRequest request,
                IFeedbackService feedbackService,
                CancellationToken cancellationToken) =>
            {
                var response = await feedbackService.SubmitFeedbackAsync(request, cancellationToken);
                return Results.Created($"/api/feedback/{response.FeedbackId}", response);
            })
            .WithName("SubmitFeedback")
            .WithDescription("Submit user feedback")
            .AddEndpointFilter<ValidationFilter<FeedbackRequest>>()
            .Produces<FeedbackResponse>(StatusCodes.Status201Created)
            .Produces<ValidationErrorResponse>(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status401Unauthorized);

            group.MapGet("/{projectId}", async (
                string projectId,
                IFeedbackService feedbackService,
                CancellationToken cancellationToken) =>
            {
                var feedbacks = feedbackService.GetFeedbacksByProjectIdAsync(projectId, cancellationToken);
                return Results.Ok(feedbacks);
            })
            .WithName("GetFeedbacksByProject")
            .WithDescription("Get all feedbacks for a project")
            .Produces<IEnumerable<FeedbackResponse>>();
        }
    }
}
