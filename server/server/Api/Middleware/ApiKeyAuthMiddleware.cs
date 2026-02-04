namespace server.Api.Middleware;

public class ApiKeyAuthMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ApiKeyAuthMiddleware> _logger;
    private const string API_KEY_HEADER = "X-Api-Key";

    public ApiKeyAuthMiddleware(RequestDelegate next, ILogger<ApiKeyAuthMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context, IConfiguration configuration)
    {
        var path = context.Request.Path.Value?.ToLower() ?? "";
        if (IsPublicEndpoint(path))
        {
            await _next(context);
            return;
        }

        if (!context.Request.Headers.TryGetValue(API_KEY_HEADER, out var extractedApiKey))
        {
            _logger.LogWarning("API Key missing for request to path: {Path}", path);
            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            await context.Response.WriteAsJsonAsync(new { 
                success = false, 
                message = "API Key is missing" 
            });
            return;
        }

        var validApiKeys = configuration.GetSection("ApiKeys").Get<string[]>() ?? Array.Empty<string>();

        if (!validApiKeys.Contains(extractedApiKey.ToString()))
        {
            _logger.LogWarning("Invalid API Key provided for request to path: {Path}", path);
            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            await context.Response.WriteAsJsonAsync(new {
                success = false,
                message = "Invalid API Key"
            });
            return;
        }
        await _next(context);
    }

    private static bool IsPublicEndpoint(string path)
    {
        return path.StartsWith("/swagger") || 
               path.StartsWith("/health") ||
               path == "/" ||
               path == "";
    }
}

public static class ApiKeyAuthMiddlewareExtensions
{
    public static IApplicationBuilder UseApiKeyAuth(this IApplicationBuilder builder)
    {
        return builder.UseMiddleware<ApiKeyAuthMiddleware>();
    }
}
