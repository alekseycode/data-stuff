using Microsoft.AspNetCore.Mvc;
using NbaTracker.Api.Services;

namespace NbaTracker.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TeamsController(INbaService nba) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll() =>
        Ok(await nba.GetTeamsAsync());

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id)
    {
        var team = await nba.GetTeamAsync(id);
        return team is null ? NotFound() : Ok(team);
    }
}
