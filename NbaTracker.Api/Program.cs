using Anthropic;
using Microsoft.EntityFrameworkCore;
using NbaTracker.Api.Data;
using NbaTracker.Api.Services;

DotNetEnv.Env.Load();
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddSingleton(new AnthropicClient { ApiKey = builder.Configuration["Anthropic:ApiKey"] });
builder.Services.AddHttpClient<NbaGraphQLService>();
builder.Services.AddScoped<INbaService, NbaGraphQLService>();
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));
builder.Services.AddCors(options =>
    options.AddDefaultPolicy(policy =>
        policy.WithOrigins("http://localhost:5173", "http://localhost:8080").AllowAnyHeader().AllowAnyMethod()));

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.EnsureCreated();
}

app.UseCors();
app.MapControllers();
app.Run();
