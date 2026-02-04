using server.Extensions;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services
    .AddApplicationServices()
    .AddInfrastructureServices(builder.Configuration)
    .AddValidation()
    .AddApiServices();

builder.Logging.AddConsole();

var app = builder.Build();

await app.InitializeDatabaseAsync();

app.ConfigurePipeline()
    .MapEndpoints();

app.Run();

public partial class Program { }