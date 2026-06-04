using NbaTracker.Api.Models;

namespace NbaTracker.Api.Services;

public interface INbaService
{
    Task<List<TeamDto>> GetTeamsAsync();
    Task<TeamWithPlayersDto?> GetTeamAsync(string teamId);
    Task<List<GameDto>> GetGamesAsync(string? teamId = null, int limit = 50);
    Task<GameDto?> GetGameAsync(string gameId);
}
