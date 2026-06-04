# NbaTracker.Tests

Unit tests for the NbaTracker.Api backend controllers.

## Stack

- [xUnit](https://xunit.net/) — test framework
- [Moq](https://github.com/moq/moq4) — mocking `INbaService`
- [EF Core InMemory](https://learn.microsoft.com/en-us/ef/core/providers/in-memory/) — in-process database for `AppDbContext`

## Running the tests

From the repo root:

```bash
dotnet test NbaTracker.Tests/
```

Or from inside the test project directory:

```bash
cd NbaTracker.Tests
dotnet test
```

No running database or API keys required — all external dependencies are mocked.

## What's covered

### `TeamsControllerTests` (5 tests)
- `GET /api/teams` returns 200 with the team list
- `GET /api/teams` returns 200 with an empty list when no teams exist
- `GET /api/teams/{id}` returns 200 with the team when found
- `GET /api/teams/{id}` returns 404 when the team doesn't exist
- The team ID is passed through to the service correctly

### `GamesControllerTests` (9 tests)
- `GET /api/games` returns 200 with the games list
- `GET /api/games` passes `teamId` and `limit` query params to the service
- `GET /api/games/{id}` returns a cached game from the database without calling the NBA API
- `GET /api/games/{id}` maps all box score and team fields correctly from the cache
- `GET /api/games/{id}` fetches from the NBA API on a cache miss and returns 200
- `GET /api/games/{id}` returns 404 when the game isn't found in the cache or the API
- `GET /api/games/{id}` saves a completed game to the database after fetching it
- `GET /api/games/{id}` does not save an incomplete game to the database
- Play-by-play events are serialized into `EventsJson` when a completed game is cached

### `ChatControllerTests` (2 tests)
`AnthropicClient` has no interface, so the happy path requires a real API key and is left
for integration testing. These tests cover the error-handling path using an invalid key:

- `POST /api/chat` returns 200 (not 500) when the Anthropic client throws
- The response body contains a `"Something went wrong: ..."` message rather than an empty or null response
