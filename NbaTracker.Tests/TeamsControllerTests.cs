using Microsoft.AspNetCore.Mvc;
using Moq;
using NbaTracker.Api.Controllers;
using Xunit;
using NbaTracker.Api.Models;
using NbaTracker.Api.Services;

namespace NbaTracker.Tests;

public class TeamsControllerTests
{
    private readonly Mock<INbaService> _nba = new();
    private readonly TeamsController _controller;

    public TeamsControllerTests()
    {
        _controller = new TeamsController(_nba.Object);
    }

    [Fact]
    public async Task GetAll_ReturnsOkWithTeamList()
    {
        var teams = new List<TeamDto>
        {
            new("1", "Lakers", "Lakers", "LAL", "West", "Pacific", "logo1.png"),
            new("2", "Celtics", "Celtics", "BOS", "East", "Atlantic", "logo2.png"),
        };
        _nba.Setup(s => s.GetTeamsAsync()).ReturnsAsync(teams);

        var result = await _controller.GetAll();

        var ok = Assert.IsType<OkObjectResult>(result);
        Assert.Equal(teams, ok.Value);
    }

    [Fact]
    public async Task GetAll_ReturnsOkWithEmptyList_WhenNoTeams()
    {
        _nba.Setup(s => s.GetTeamsAsync()).ReturnsAsync([]);

        var result = await _controller.GetAll();

        var ok = Assert.IsType<OkObjectResult>(result);
        var list = Assert.IsType<List<TeamDto>>(ok.Value);
        Assert.Empty(list);
    }

    [Fact]
    public async Task GetById_ExistingTeam_ReturnsOk()
    {
        var team = new TeamWithPlayersDto("1", "Lakers", "Lakers", "LAL", "West", "Pacific", "logo.png",
        [
            new("p1", "LeBron", "James", "23", "F", "6-9", "250"),
        ]);
        _nba.Setup(s => s.GetTeamAsync("1")).ReturnsAsync(team);

        var result = await _controller.GetById("1");

        var ok = Assert.IsType<OkObjectResult>(result);
        Assert.Equal(team, ok.Value);
    }

    [Fact]
    public async Task GetById_NonExistentTeam_ReturnsNotFound()
    {
        _nba.Setup(s => s.GetTeamAsync("999")).ReturnsAsync((TeamWithPlayersDto?)null);

        var result = await _controller.GetById("999");

        Assert.IsType<NotFoundResult>(result);
    }

    [Fact]
    public async Task GetById_PassesIdToService()
    {
        _nba.Setup(s => s.GetTeamAsync(It.IsAny<string>())).ReturnsAsync((TeamWithPlayersDto?)null);

        await _controller.GetById("abc-123");

        _nba.Verify(s => s.GetTeamAsync("abc-123"), Times.Once);
    }
}
