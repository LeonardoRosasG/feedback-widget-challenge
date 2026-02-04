using Microsoft.EntityFrameworkCore;
using server.Api.Endpoints;
using server.Api.Middleware;
using server.Infrastructure.Persistence;

namespace server.Extensions;

public static class WebApplicationExtensions
{
    public static WebApplication ConfigurePipeline(this WebApplication app) 
    { 
        if(app.Environment.IsDevelopment())
        {
            app.UseSwagger();
            app.UseSwaggerUI();
        }

        app.UseCors();
        app.UseApiKeyAuth();
        app.UseHttpsRedirection();

        return app;
    }

    public static WebApplication MapEndpoints(this WebApplication app)
    {
        app.MapHealthEndpoints();
        app.MapFeedbackEndpoints();

        app.MapGet("/", () => Results.Redirect("/swagger"))
            .ExcludeFromDescription();

        return app;
    }

    public static async Task InitializeDatabaseAsync(this WebApplication app)
    {
        using var scope = app.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<AppDbContext>>();

        try
        {
            await context.Database.MigrateAsync();
            logger.LogInformation("Database migration completed successfully.");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while migrating the database.");
            if (app.Environment.IsDevelopment())
            {
                await context.Database.EnsureCreatedAsync();
                logger.LogInformation("Database ensured created in development environment.");
            }
            else
            {
                throw;
            }
        }
    }
}
