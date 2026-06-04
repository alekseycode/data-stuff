using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Moq;
using NbaTracker.Api.Controllers;
using Xunit;
using NbaTracker.Api.Data;
using NbaTracker.Api.Models;
using NbaTracker.Api.Services;

namespace NbaTracker.Tests;

public class GamesControllerTests : IDisposable
{
    private readonly Mock<INbaService> _nba = new();
    private readonly AppDbContext _db;
    private readonly GamesController _controller;

    public GamesControllerTests()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        _db = new AppDbContext(options);
        _controller = new GamesController(_nba.Object, _db);
    }

    public void Dispose() => _db.Dispose();

    // --- GET /api/games ---

    [Fact]
    public async Task GetAll_ReturnsOkWithGames()
    {
        var games = new List<GameDto> { MakeGame("g1", false), MakeGame("g2", false) };
        _nba.Setup(s => s.GetGamesAsync(null, 50)).ReturnsAsync(games);

        var result = await _controller.GetAll(null, 50);

        var ok = Assert.IsType<OkObjectResult>(result);
        Assert.Equal(games, ok.Value);
    }

    [Fact]
    public async Task GetAll_PassesTeamIdAndLimitToService()
    {
        _nba.Setup(s => s.GetGamesAsync("team1", 10)).ReturnsAsync([]);

        await _controller.GetAll("team1", 10);

        _nba.Verify(s => s.GetGamesAsync("team1", 10), Times.Once);
    }

    // --- GET /api/games/{id} — cache hit ---

    [Fact]
    public async Task GetById_CacheHit_ReturnsCachedGame_WithoutCallingService()
    {
        var cached = MakeCachedGame("g1");
        _db.Games.Add(cached);
        await _db.SaveChangesAsync();

        var result = await _controller.GetById("g1");

        _nba.Verify(s => s.GetGameAsync(It.IsAny<string>()), Times.Never);
        var ok = Assert.IsType<OkObjectResult>(result);
        var dto = Assert.IsType<GameDto>(ok.Value);
        Assert.Equal("g1", dto.Id);
        Assert.True(dto.IsCompleted);
    }

    [Fact]
    public async Task GetById_CacheHit_MapsTeamFieldsCorrectly()
    {
        var cached = MakeCachedGame("g1");
        _db.Games.Add(cached);
        await _db.SaveChangesAsync();

        var result = await _controller.GetById("g1");

        var ok = Assert.IsType<OkObjectResult>(result);
        var dto = Assert.IsType<GameDto>(ok.Value);
        Assert.Equal("home-team", dto.HomeTeam.Id);
        Assert.Equal("visitor-team", dto.VisitorTeam.Id);
        Assert.Equal(100, dto.HomeBoxScore!.Points);
        Assert.Equal(95, dto.VisitorBoxScore!.Points);
    }

    // --- GET /api/games/{id} — cache miss ---

    [Fact]
    public async Task GetById_CacheMiss_GameFound_ReturnsOk()
    {
        var game = MakeGame("g2", completed: true);
        _nba.Setup(s => s.GetGameAsync("g2")).ReturnsAsync(game);

        var result = await _controller.GetById("g2");

        var ok = Assert.IsType<OkObjectResult>(result);
        Assert.Equal(game, ok.Value);
    }

    [Fact]
    public async Task GetById_CacheMiss_GameNotFound_ReturnsNotFound()
    {
        _nba.Setup(s => s.GetGameAsync("missing")).ReturnsAsync((GameDto?)null);

        var result = await _controller.GetById("missing");

        Assert.IsType<NotFoundResult>(result);
    }

    [Fact]
    public async Task GetById_CacheMiss_CompletedGame_SavesToDB()
    {
        var game = MakeGame("g3", completed: true);
        _nba.Setup(s => s.GetGameAsync("g3")).ReturnsAsync(game);

        await _controller.GetById("g3");

        Assert.NotNull(await _db.Games.FindAsync("g3"));
    }

    [Fact]
    public async Task GetById_CacheMiss_IncompleteGame_DoesNotSaveToDB()
    {
        var game = MakeGame("g4", completed: false);
        _nba.Setup(s => s.GetGameAsync("g4")).ReturnsAsync(game);

        await _controller.GetById("g4");

        Assert.Null(await _db.Games.FindAsync("g4"));
    }

    [Fact]
    public async Task GetById_CacheMiss_CompletedGame_WithEvents_SerializesEventsJson()
    {
        var events = new List<GameEventDto>
        {
            new(1, 1, 12000, "field_goal", "LeBron James makes a layup"),
        };
        var game = MakeGame("g5", completed: true) with { Events = events };
        _nba.Setup(s => s.GetGameAsync("g5")).ReturnsAsync(game);

        await _controller.GetById("g5");

        var saved = await _db.Games.FindAsync("g5");
        Assert.NotNull(saved!.EventsJson);
        Assert.Contains("LeBron James", saved.EventsJson);
    }

    // --- helpers ---

    private static TeamDto MakeTeam(string id) =>
        new(id, id, id + "-nick", "ABR", "West", "Pacific", "logo.png");

    private static BoxScoreDto MakeBoxScore(int points) =>
        new(points, 40, 80, 0.5, 10, 25, 0.4, 5, 8, 0.625, 8, 32, 40, 22, 7, 5, 12);

    private static GameDto MakeGame(string id, bool completed) =>
        new(id, DateTime.UtcNow.AddDays(-1),
            MakeTeam("home-team"), MakeTeam("visitor-team"),
            completed ? MakeBoxScore(100) : null,
            completed ? MakeBoxScore(95) : null,
            completed);

    private static CachedGame MakeCachedGame(string id) => new()
    {
        Id = id,
        Date = DateTime.UtcNow.AddDays(-1),
        HomeTeamId = "home-team",
        HomeTeamShortName = "home-team",
        HomeTeamNickName = "home-team-nick",
        HomeTeamLogo = "logo.png",
        VisitorTeamId = "visitor-team",
        VisitorTeamShortName = "visitor-team",
        VisitorTeamNickName = "visitor-team-nick",
        VisitorTeamLogo = "logo.png",
        HomePoints = 100,
        HomeFG = 40, HomeFGA = 80, HomeFGPct = 0.5,
        Home3P = 10, Home3PA = 25, Home3PPct = 0.4,
        HomeFT = 5, HomeFTA = 8, HomeFTPct = 0.625,
        HomeOffReb = 8, HomeDefReb = 32, HomeTotalReb = 40,
        HomeAssists = 22, HomeSteals = 7, HomeBlocks = 5, HomeTurnovers = 12,
        VisitorPoints = 95,
        VisitorFG = 38, VisitorFGA = 82, VisitorFGPct = 0.463,
        Visitor3P = 9, Visitor3PA = 24, Visitor3PPct = 0.375,
        VisitorFT = 6, VisitorFTA = 9, VisitorFTPct = 0.667,
        VisitorOffReb = 7, VisitorDefReb = 33, VisitorTotalReb = 40,
        VisitorAssists = 20, VisitorSteals = 6, VisitorBlocks = 4, VisitorTurnovers = 14,
        CachedAt = DateTime.UtcNow
    };
}
