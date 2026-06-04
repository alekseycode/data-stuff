using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using NbaTracker.Api.Data;
using NbaTracker.Api.Models;
using NbaTracker.Api.Services;

namespace NbaTracker.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class GamesController(INbaService nba, AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? teamId, [FromQuery] int limit = 50) =>
        Ok(await nba.GetGamesAsync(teamId, limit));

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id)
    {
        var cached = await db.Games.FindAsync(id);
        if (cached != null)
            return Ok(MapCachedToDto(cached));

        var game = await nba.GetGameAsync(id);
        if (game is null) return NotFound();

        if (game.IsCompleted)
        {
            db.Games.Add(ToEntity(game));
            await db.SaveChangesAsync();
        }

        return Ok(game);
    }

    private static CachedGame ToEntity(GameDto g) => new()
    {
        Id = g.Id,
        Date = g.Date,
        HomeTeamId = g.HomeTeam.Id,
        HomeTeamShortName = g.HomeTeam.ShortName,
        HomeTeamNickName = g.HomeTeam.NickName,
        HomeTeamLogo = g.HomeTeam.Logo,
        VisitorTeamId = g.VisitorTeam.Id,
        VisitorTeamShortName = g.VisitorTeam.ShortName,
        VisitorTeamNickName = g.VisitorTeam.NickName,
        VisitorTeamLogo = g.VisitorTeam.Logo,
        HomePoints = g.HomeBoxScore?.Points ?? 0,
        HomeFG = g.HomeBoxScore?.FieldGoals ?? 0,
        HomeFGA = g.HomeBoxScore?.FieldGoalsAttempted ?? 0,
        HomeFGPct = g.HomeBoxScore?.FieldGoalPercentage ?? 0,
        Home3P = g.HomeBoxScore?.ThreePointers ?? 0,
        Home3PA = g.HomeBoxScore?.ThreePointersAttempted ?? 0,
        Home3PPct = g.HomeBoxScore?.ThreePointPercentage ?? 0,
        HomeFT = g.HomeBoxScore?.FreeThrows ?? 0,
        HomeFTA = g.HomeBoxScore?.FreeThrowsAttempted ?? 0,
        HomeFTPct = g.HomeBoxScore?.FreeThrowPercentage ?? 0,
        HomeOffReb = g.HomeBoxScore?.OffensiveRebounds ?? 0,
        HomeDefReb = g.HomeBoxScore?.DefensiveRebounds ?? 0,
        HomeTotalReb = g.HomeBoxScore?.TotalRebounds ?? 0,
        HomeAssists = g.HomeBoxScore?.Assists ?? 0,
        HomeSteals = g.HomeBoxScore?.Steals ?? 0,
        HomeBlocks = g.HomeBoxScore?.Blocks ?? 0,
        HomeTurnovers = g.HomeBoxScore?.Turnovers ?? 0,
        VisitorPoints = g.VisitorBoxScore?.Points ?? 0,
        VisitorFG = g.VisitorBoxScore?.FieldGoals ?? 0,
        VisitorFGA = g.VisitorBoxScore?.FieldGoalsAttempted ?? 0,
        VisitorFGPct = g.VisitorBoxScore?.FieldGoalPercentage ?? 0,
        Visitor3P = g.VisitorBoxScore?.ThreePointers ?? 0,
        Visitor3PA = g.VisitorBoxScore?.ThreePointersAttempted ?? 0,
        Visitor3PPct = g.VisitorBoxScore?.ThreePointPercentage ?? 0,
        VisitorFT = g.VisitorBoxScore?.FreeThrows ?? 0,
        VisitorFTA = g.VisitorBoxScore?.FreeThrowsAttempted ?? 0,
        VisitorFTPct = g.VisitorBoxScore?.FreeThrowPercentage ?? 0,
        VisitorOffReb = g.VisitorBoxScore?.OffensiveRebounds ?? 0,
        VisitorDefReb = g.VisitorBoxScore?.DefensiveRebounds ?? 0,
        VisitorTotalReb = g.VisitorBoxScore?.TotalRebounds ?? 0,
        VisitorAssists = g.VisitorBoxScore?.Assists ?? 0,
        VisitorSteals = g.VisitorBoxScore?.Steals ?? 0,
        VisitorBlocks = g.VisitorBoxScore?.Blocks ?? 0,
        VisitorTurnovers = g.VisitorBoxScore?.Turnovers ?? 0,
        EventsJson = g.Events != null ? JsonSerializer.Serialize(g.Events) : null,
        CachedAt = DateTime.UtcNow
    };

    private static GameDto MapCachedToDto(CachedGame c)
    {
        var events = c.EventsJson != null
            ? JsonSerializer.Deserialize<List<GameEventDto>>(c.EventsJson)
            : null;

        return new(
            c.Id, c.Date,
            new(c.HomeTeamId, c.HomeTeamShortName, c.HomeTeamNickName, "", "", "", c.HomeTeamLogo),
            new(c.VisitorTeamId, c.VisitorTeamShortName, c.VisitorTeamNickName, "", "", "", c.VisitorTeamLogo),
            new(c.HomePoints, c.HomeFG, c.HomeFGA, c.HomeFGPct, c.Home3P, c.Home3PA, c.Home3PPct,
                c.HomeFT, c.HomeFTA, c.HomeFTPct, c.HomeOffReb, c.HomeDefReb, c.HomeTotalReb,
                c.HomeAssists, c.HomeSteals, c.HomeBlocks, c.HomeTurnovers),
            new(c.VisitorPoints, c.VisitorFG, c.VisitorFGA, c.VisitorFGPct, c.Visitor3P, c.Visitor3PA, c.Visitor3PPct,
                c.VisitorFT, c.VisitorFTA, c.VisitorFTPct, c.VisitorOffReb, c.VisitorDefReb, c.VisitorTotalReb,
                c.VisitorAssists, c.VisitorSteals, c.VisitorBlocks, c.VisitorTurnovers),
            true,
            events
        );
    }
}
