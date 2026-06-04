namespace NbaTracker.Api.Models;

public record TeamDto(
    string Id,
    string ShortName,
    string NickName,
    string Abbreviation,
    string Conference,
    string Division,
    string Logo
);

public record PlayerDto(
    string Id,
    string FirstName,
    string LastName,
    string JerseyNumber,
    string Position,
    string Height,
    string Weight
);

public record TeamWithPlayersDto(
    string Id,
    string ShortName,
    string NickName,
    string Abbreviation,
    string Conference,
    string Division,
    string Logo,
    List<PlayerDto> Players
);

public record BoxScoreDto(
    int Points,
    int FieldGoals,
    int FieldGoalsAttempted,
    double FieldGoalPercentage,
    int ThreePointers,
    int ThreePointersAttempted,
    double ThreePointPercentage,
    int FreeThrows,
    int FreeThrowsAttempted,
    double FreeThrowPercentage,
    int OffensiveRebounds,
    int DefensiveRebounds,
    int TotalRebounds,
    int Assists,
    int Steals,
    int Blocks,
    int Turnovers
);

public record GameEventDto(
    int Id,
    int Period,
    int WallClock,
    string EventType,
    string PlayByPlay
);

public record GameDto(
    string Id,
    DateTime Date,
    TeamDto HomeTeam,
    TeamDto VisitorTeam,
    BoxScoreDto? HomeBoxScore,
    BoxScoreDto? VisitorBoxScore,
    bool IsCompleted,
    List<GameEventDto>? Events = null
);

public record ChatMessageDto(string Message);
public record ChatResponseDto(string Response);
