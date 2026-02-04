using FluentValidation;
using Microsoft.EntityFrameworkCore;
using server.Application.Services;
using server.Application.Services.Interfaces;
using server.Application.Validators;
using server.Infrastructure.Persistence;
using server.Infrastructure.Repositories;
using server.Infrastructure.Repositories.Interfaces;

namespace server.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        // Register application services
        services.AddScoped<IFeedbackService, FeedbackService>();
        return services;
    }

    public static IServiceCollection AddInfrastructureServices(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // Register infrastructure services like repositories, database contexts, etc.
        var connectionString = configuration.GetConnectionString("DefaultConnection");
        services.AddDbContext<AppDbContext>(options => 
            options.UseSqlite(connectionString));

        // Repositories as transient
        services.AddTransient<IFeedbackRepository, FeedbackRepository>();
        return services;
    }

    public static IServiceCollection AddValidation(this IServiceCollection services)
    {
        // Register FluentValidation validators
        services.AddValidatorsFromAssemblyContaining<FeedbackRequestValidator>();
        return services;
    }

    public static IServiceCollection AddApiServices(this IServiceCollection services)
    {
        // Register API related services if any
        // CORS
        services.AddCors(options =>
        {
            options.AddDefaultPolicy(policy =>
            {
                policy.AllowAnyOrigin()
                      .AllowAnyHeader()
                      .AllowAnyMethod();
            });
        });

        // OpenApi/Swagger
        services.AddEndpointsApiExplorer();
        services.AddSwaggerGen(options =>
        {
            options.SwaggerDoc("v1", new Microsoft.OpenApi.OpenApiInfo
            {
                Title = "Feedback Widget API",
                Version = "v1",
                Description = "API for collecting user feedback"
            });

            // Agregar soporte para API Key en Swagger UI
            options.AddSecurityDefinition("ApiKey", new Microsoft.OpenApi.OpenApiSecurityScheme
            {
                Type = Microsoft.OpenApi.SecuritySchemeType.ApiKey,
                In = Microsoft.OpenApi.ParameterLocation.Header,
                Name = "X-Api-Key",
                Description = "API Key for authentication",
                Scheme = "ApiKeyScheme"
            });

            options.AddSecurityRequirement(document => new Microsoft.OpenApi.OpenApiSecurityRequirement
            {
                [new Microsoft.OpenApi.OpenApiSecuritySchemeReference("ApiKey", document)] = []
            });
        });
        return services;
    }
}
