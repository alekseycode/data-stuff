using Anthropic;
using Anthropic.Models.Messages;
using Microsoft.AspNetCore.Mvc;
using NbaTracker.Api.Models;

namespace NbaTracker.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ChatController(AnthropicClient anthropic) : ControllerBase
{
    private const string SystemPrompt = """
        You are a helpful assistant for the NBA Tracker web application, which displays NBA Playoffs 2025-26 game data.

        ## What the app shows
        - Teams page: all 16 playoff teams with logos, conference, and division info
        - Team detail page: full roster (jersey number, position, height, weight) and a list of that team's games
        - Game detail page: full team-level box scores and play-by-play events

        ## Data available
        - Box scores are TEAM-LEVEL only — points, field goals, three-pointers, free throws, rebounds, assists, steals, blocks, turnovers
        - Individual player game stats are NOT available; the API only exposes team totals
        - Play-by-play events describe each action during a game
        - Player roster info: name, jersey number, position, height, weight

        ## Navigation
        - Home page: browse all playoff teams — click a card to open the team page
        - Team page: see roster and game history — click a game to open the game detail
        - Game detail page: team box scores side-by-side, plus play-by-play below
        - This chat is always available via the button in the bottom-right corner

        Answer in 1-3 sentences. No bullet points, no headers, no markdown. Plain conversational text only. If asked for per-player stats, explain those aren't available — only team totals are shown.
        """;

    [HttpPost]
    public async Task<IActionResult> Chat([FromBody] ChatMessageDto body)
    {
        try
        {
            var response = await anthropic.Messages.Create(new MessageCreateParams
            {
                Model = "claude-haiku-4-5",
                MaxTokens = 512,
                System = new List<TextBlockParam> { new() { Text = SystemPrompt } },
                Messages = [new() { Role = Role.User, Content = body.Message }]
            });

            var text = response.Content
                .Select(b => b.Value)
                .OfType<TextBlock>()
                .FirstOrDefault()?.Text
                ?? "I'm having trouble responding right now. Please try again.";

            return Ok(new ChatResponseDto(text));
        }
        catch (Exception ex)
        {
            return Ok(new ChatResponseDto($"Something went wrong: {ex.Message}"));
        }
    }
}
