using System.ComponentModel.DataAnnotations;

namespace NbaTracker.Api.Models;

public class CachedGame
{
    [Key]
    public string Id { get; set; } = string.Empty;
    public DateTime Date { get; set; }

    public string HomeTeamId { get; set; } = string.Empty;
    public string HomeTeamShortName { get; set; } = string.Empty;
    public string HomeTeamNickName { get; set; } = string.Empty;
    public string HomeTeamLogo { get; set; } = string.Empty;

    public string VisitorTeamId { get; set; } = string.Empty;
    public string VisitorTeamShortName { get; set; } = string.Empty;
    public string VisitorTeamNickName { get; set; } = string.Empty;
    public string VisitorTeamLogo { get; set; } = string.Empty;

    // Home box score
    public int HomePoints { get; set; }
    public int HomeFG { get; set; }
    public int HomeFGA { get; set; }
    public double HomeFGPct { get; set; }
    public int Home3P { get; set; }
    public int Home3PA { get; set; }
    public double Home3PPct { get; set; }
    public int HomeFT { get; set; }
    public int HomeFTA { get; set; }
    public double HomeFTPct { get; set; }
    public int HomeOffReb { get; set; }
    public int HomeDefReb { get; set; }
    public int HomeTotalReb { get; set; }
    public int HomeAssists { get; set; }
    public int HomeSteals { get; set; }
    public int HomeBlocks { get; set; }
    public int HomeTurnovers { get; set; }

    // Visitor box score
    public int VisitorPoints { get; set; }
    public int VisitorFG { get; set; }
    public int VisitorFGA { get; set; }
    public double VisitorFGPct { get; set; }
    public int Visitor3P { get; set; }
    public int Visitor3PA { get; set; }
    public double Visitor3PPct { get; set; }
    public int VisitorFT { get; set; }
    public int VisitorFTA { get; set; }
    public double VisitorFTPct { get; set; }
    public int VisitorOffReb { get; set; }
    public int VisitorDefReb { get; set; }
    public int VisitorTotalReb { get; set; }
    public int VisitorAssists { get; set; }
    public int VisitorSteals { get; set; }
    public int VisitorBlocks { get; set; }
    public int VisitorTurnovers { get; set; }

    public string? EventsJson { get; set; }
    public DateTime CachedAt { get; set; }
}
