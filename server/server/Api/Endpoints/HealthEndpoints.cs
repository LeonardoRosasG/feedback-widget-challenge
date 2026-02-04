using server.Application.DTOs;
using server.Infrastructure.Persistence;

namespace server.Api.Endpoints;

public static class HealthEndpoints
{
    public static void MapHealthEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/health")
            .WithTags("Health")
            .WithOpenApi();

        group.MapGet("/", () => Results.Ok(new HealthCheckResponse(
            Status: "healthy",
            Timestamp: DateTime.UtcNow,
            Version: "1.0.0"
        )))
        .WithName("HealthCheck")
        .WithDescription("Basic health check endpoint")
        .Produces<HealthCheckResponse>();

        group.MapGet("/ready", async (AppDbContext dbContext) =>
        {
            try
            {
                await dbContext.Database.CanConnectAsync();

                return Results.Ok(new
                {
                    status = "ready",
                    timestamp = DateTime.UtcNow,
                    database = "connected"
                });
            }
            catch (Exception ex)
            {
                return Results.Json(new
                {
                    status = "unhealthy",
                    timestamp = DateTime.UtcNow,
                    database = "disconnected",
                    error = ex.Message
                }, statusCode: StatusCodes.Status503ServiceUnavailable);
            }
        })
        .WithName("ReadinessCheck")
        .WithDescription("Readiness check including database connectivity");
    }
}
