using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using NbaTracker.Api.Models;

namespace NbaTracker.Api.Services;

public class NbaGraphQLService(HttpClient http, IConfiguration config) : INbaService
{
    private static readonly JsonSerializerOptions JsonOpts = new() { PropertyNameCaseInsensitive = true };

    private string SeasonId => config["Nba:SeasonId"]!;

    private async Task<T?> QueryAsync<T>(string query, object? variables = null)
    {
        var body = JsonSerializer.Serialize(new { query, variables });
        using var request = new HttpRequestMessage(HttpMethod.Post, config["Nba:ApiUrl"])
        {
            Content = new StringContent(body, Encoding.UTF8, "application/json")
        };
        request.Headers.Add("client-id", config["Nba:ClientId"]);
        request.Headers.Add("client-api-key", config["Nba:ClientApiKey"]);

        var response = await http.SendAsync(request);
        response.EnsureSuccessStatusCode();

        var json = await response.Content.ReadAsStringAsync();
        return JsonSerializer.Deserialize<T>(json, JsonOpts);
    }

    public async Task<List<TeamDto>> GetTeamsAsync()
    {
        const string query = """
            query($leagueId: ID!, $seasonId: ID) {
              teams(leagueId: $leagueId, seasonId: $seasonId) {
                id shortName nickName abbreviation conference division logo
              }
            }
            """;

        var result = await QueryAsync<GqlResponse<TeamsData>>(query, new { leagueId = "00", seasonId = SeasonId });
        return result?.Data?.Teams?.Select(MapTeam).ToList() ?? [];
    }

    public async Task<TeamWithPlayersDto?> GetTeamAsync(string teamId)
    {
        const string query = """
            query($id: ID!, $seasonId: ID!, $leagueId: ID!) {
              team(id: $id, seasonId: $seasonId, leagueId: $leagueId) {
                id shortName nickName abbreviation conference division logo
                players {
                  id firstName lastName
                  info { jerseyNumber position height weight }
                }
              }
            }
            """;

        var result = await QueryAsync<GqlResponse<TeamData>>(query, new { id = teamId, seasonId = SeasonId, leagueId = "00" });
        var t = result?.Data?.Team;
        if (t == null) return null;

        var players = t.Players?.Select(p => new PlayerDto(
            p.Id ?? "",
            p.FirstName ?? "",
            p.LastName ?? "",
            p.Info?.JerseyNumber ?? "",
            p.Info?.Position ?? "",
            p.Info?.Height ?? "",
            p.Info?.Weight ?? ""
        )).ToList() ?? [];

        return new TeamWithPlayersDto(t.Id ?? "", t.ShortName ?? "", t.NickName ?? "",
            t.Abbreviation ?? "", t.Conference ?? "", t.Division ?? "", t.Logo ?? "", players);
    }

    public async Task<List<GameDto>> GetGamesAsync(string? teamId = null, int limit = 50)
    {
        const string query = """
            query($leagueId: ID, $seasonId: ID, $teamId: String, $options: ListOptionsInput) {
              games(leagueId: $leagueId, seasonId: $seasonId, teamId: $teamId, options: $options) {
                id date
                homeTeam { id shortName nickName logo }
                visitorTeam { id shortName nickName logo }
                homeTeamContext { boxScore { points fieldGoals fieldGoalsAttempted fieldGoalPercentage threePointers threePointersAttempted threePointPercentage freeThrows freeThrowsAttempted freeThrowPercentage offensiveRebounds defensiveRebounds totalRebounds assists steals blockedShots turnovers } }
                visitorTeamContext { boxScore { points fieldGoals fieldGoalsAttempted fieldGoalPercentage threePointers threePointersAttempted threePointPercentage freeThrows freeThrowsAttempted freeThrowPercentage offensiveRebounds defensiveRebounds totalRebounds assists steals blockedShots turnovers } }
              }
            }
            """;

        var result = await QueryAsync<GqlResponse<GamesData>>(query, new
        {
            leagueId = "00",
            seasonId = SeasonId,
            teamId,
            options = new { limit }
        });

        return result?.Data?.Games?.Select(MapGame).ToList() ?? [];
    }

    public async Task<GameDto?> GetGameAsync(string gameId)
    {
        const string gameQuery = """
            query($id: ID!) {
              game(id: $id) {
                id date
                homeTeam { id shortName nickName logo }
                visitorTeam { id shortName nickName logo }
                homeTeamContext { boxScore { points fieldGoals fieldGoalsAttempted fieldGoalPercentage threePointers threePointersAttempted threePointPercentage freeThrows freeThrowsAttempted freeThrowPercentage offensiveRebounds defensiveRebounds totalRebounds assists steals blockedShots turnovers } }
                visitorTeamContext { boxScore { points fieldGoals fieldGoalsAttempted fieldGoalPercentage threePointers threePointersAttempted threePointPercentage freeThrows freeThrowsAttempted freeThrowPercentage offensiveRebounds defensiveRebounds totalRebounds assists steals blockedShots turnovers } }
              }
            }
            """;

        const string eventsQuery = """
            query($gameId: ID!, $options: ListOptionsInput) {
              gameEvents(gameId: $gameId, options: $options) {
                id period wallClock
                type { description }
                action { description playByPlay }
              }
            }
            """;

        var gameTask = QueryAsync<GqlResponse<GameData>>(gameQuery, new { id = gameId });
        var eventsTask = QueryAsync<GqlResponse<GameEventsData>>(eventsQuery, new { gameId, options = new { limit = 500 } });

        await Task.WhenAll(gameTask, eventsTask);

        var g = (await gameTask)?.Data?.Game;
        if (g == null) return null;

        var events = (await eventsTask)?.Data?.GameEvents?.Select(e => new GameEventDto(
            e.Id,
            e.Period,
            e.WallClock,
            e.Type?.Description ?? "",
            e.Action?.PlayByPlay ?? ""
        )).ToList();

        var dto = MapGame(g);
        return dto with { Events = events };
    }

    private static TeamDto MapTeam(GqlTeam t) =>
        new(t.Id ?? "", t.ShortName ?? "", t.NickName ?? "", t.Abbreviation ?? "", t.Conference ?? "", t.Division ?? "", t.Logo ?? "");

    private static GameDto MapGame(GqlGame g)
    {
        var home = g.HomeTeam != null ? MapTeam(g.HomeTeam) : new TeamDto("", "", "", "", "", "", "");
        var visitor = g.VisitorTeam != null ? MapTeam(g.VisitorTeam) : new TeamDto("", "", "", "", "", "", "");
        var homeBox = MapBoxScore(g.HomeTeamContext?.BoxScore);
        var visitorBox = MapBoxScore(g.VisitorTeamContext?.BoxScore);
        var isCompleted = g.Date < DateTime.UtcNow && homeBox != null;

        return new GameDto(g.Id ?? "", g.Date, home, visitor, homeBox, visitorBox, isCompleted);
    }

    private static BoxScoreDto? MapBoxScore(GqlBoxScore? b)
    {
        if (b == null || b.Points == 0) return null;
        return new BoxScoreDto(
            b.Points, b.FieldGoals, b.FieldGoalsAttempted, b.FieldGoalPercentage,
            b.ThreePointers, b.ThreePointersAttempted, b.ThreePointPercentage,
            b.FreeThrows, b.FreeThrowsAttempted, b.FreeThrowPercentage,
            b.OffensiveRebounds, b.DefensiveRebounds, b.TotalRebounds,
            b.Assists, b.Steals, b.BlockedShots, b.Turnovers
        );
    }

    // --- GraphQL response shape types ---

    private record GqlResponse<T>([property: JsonPropertyName("data")] T? Data);

    private record TeamsData([property: JsonPropertyName("teams")] List<GqlTeam>? Teams);
    private record TeamData([property: JsonPropertyName("team")] GqlTeam? Team);
    private record GamesData([property: JsonPropertyName("games")] List<GqlGame>? Games);
    private record GameData([property: JsonPropertyName("game")] GqlGame? Game);
    private record GameEventsData([property: JsonPropertyName("gameEvents")] List<GqlGameEvent>? GameEvents);

    private record GqlTeam(
        string? Id, string? ShortName, string? NickName, string? Abbreviation,
        string? Conference, string? Division, string? Logo,
        List<GqlPlayer>? Players);

    private record GqlPlayer(string? Id, string? FirstName, string? LastName, GqlPlayerInfo? Info);
    private record GqlPlayerInfo(string? JerseyNumber, string? Position, string? Height, string? Weight);

    private record GqlGame(
        string? Id, DateTime Date,
        GqlTeam? HomeTeam, GqlTeam? VisitorTeam,
        GqlTeamContext? HomeTeamContext, GqlTeamContext? VisitorTeamContext);

    private record GqlTeamContext(GqlBoxScore? BoxScore);

    private record GqlBoxScore(
        int Points, int FieldGoals, int FieldGoalsAttempted, double FieldGoalPercentage,
        int ThreePointers, int ThreePointersAttempted, double ThreePointPercentage,
        int FreeThrows, int FreeThrowsAttempted, double FreeThrowPercentage,
        int OffensiveRebounds, int DefensiveRebounds, int TotalRebounds,
        int Assists, int Steals, int BlockedShots, int Turnovers);

    private record GqlGameEvent(int Id, int Period, int WallClock, GqlEventType? Type, GqlEventAction? Action);
    private record GqlEventType(string? Description);
    private record GqlEventAction(string? Description, string? PlayByPlay);
}
