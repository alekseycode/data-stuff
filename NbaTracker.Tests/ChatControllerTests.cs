using Anthropic;
using Microsoft.AspNetCore.Mvc;
using NbaTracker.Api.Controllers;
using NbaTracker.Api.Models;
using Xunit;

namespace NbaTracker.Tests;

public class ChatControllerTests
{
    // ChatController takes AnthropicClient directly (no interface), so we test the error
    // handling path by providing an invalid API key — the SDK throws, and the controller
    // catches it and returns 200 with a friendly error message.

    [Fact]
    public async Task Chat_WhenClientThrows_ReturnsOkWithErrorMessage()
    {
        var client = new AnthropicClient { ApiKey = "invalid-key-for-testing" };
        var controller = new ChatController(client);

        var result = await controller.Chat(new ChatMessageDto("hello"));

        var ok = Assert.IsType<OkObjectResult>(result);
        var response = Assert.IsType<ChatResponseDto>(ok.Value);
        Assert.StartsWith("Something went wrong", response.Response);
    }

    [Fact]
    public async Task Chat_EmptyMessage_WhenClientThrows_ReturnsOkWithErrorMessage()
    {
        var client = new AnthropicClient { ApiKey = "invalid-key-for-testing" };
        var controller = new ChatController(client);

        var result = await controller.Chat(new ChatMessageDto(""));

        var ok = Assert.IsType<OkObjectResult>(result);
        var response = Assert.IsType<ChatResponseDto>(ok.Value);
        Assert.False(string.IsNullOrEmpty(response.Response));
    }
}
