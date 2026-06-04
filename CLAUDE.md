# NBA Tracker — Project Context

## What this is
A web app that tracks NBA Playoff teams, rosters, and game results. Data comes from the NBA OneGraph GraphQL API. Completed game box scores are cached in SQL Server to avoid redundant API calls.

## Repo layout
```
nba-tracker/
├── NbaTracker.Api/       C# .NET 9 Web API (backend)
└── nba-tracker-ui/       Vite + React + Tailwind (frontend)
```

---

## Backend — NbaTracker.Api

**Run:** `dotnet run` from `NbaTracker.Api/`
**Ports:** HTTP `5079`, HTTPS `7087`

### Endpoints
| Method | Route | Notes |
|--------|-------|-------|
| GET | `/api/teams` | All teams in current season |
| GET | `/api/teams/{id}` | Team + full roster |
| GET | `/api/games?teamId=&limit=` | Games list, live from API |
| GET | `/api/games/{id}` | Game + box scores + play-by-play. Cached in DB if completed |
| POST | `/api/chat` | AI-powered help bot (Claude Haiku 4.5). Body: `{ "message": "..." }` |

### Key files
- `Services/NbaGraphQLService.cs` — all NBA API calls; GraphQL queries and response deserialization are here
- `Controllers/GamesController.cs` — cache-first logic for game detail; list endpoint is always live
- `Models/Dtos.cs` — all API response types
- `Models/Entities.cs` — `CachedGame` EF Core entity (includes `EventsJson` for play-by-play)
- `Data/AppDbContext.cs` — single `Games` DbSet; schema auto-created via `EnsureCreated()`
- `Controllers/ChatController.cs` — calls Claude Haiku 4.5 via the Anthropic SDK; system prompt describes app structure and data constraints
- `appsettings.json` — non-sensitive config only (NBA API URL, season ID). All secrets are in `.env` (gitignored)

### NBA API
- **URL:** `https://apis-dev.nba.com/v1/onegraph/graphql`
- **Auth headers:** `client-id` and `client-api-key` (in appsettings.json)
- **Active season:** NBA Playoffs 2025-26, `seasonId: 42025`
- **Stats:** Box scores are **team-level only** — the API does not expose per-player stat totals. Player data is roster info only (position, jersey #, height, weight).

### Caching strategy
- `GET /api/games/{id}` — checks SQL Server first; on cache miss, fetches from API and writes to DB if game is completed (`date < now && boxScore != null`)
- `GET /api/games` (list) — always live, never caches
- Events (play-by-play) are stored in `CachedGame.EventsJson` as a JSON string

### Chatbot
- Uses the official `Anthropic` NuGet SDK (v12.24.1), registered as a singleton in DI
- Model: `claude-haiku-4-5` — fast and cost-effective for help-bot Q&A
- Stateless — each request is a single-turn call (no conversation history)
- System prompt covers app navigation, available data, and the team-level-only stats constraint
- To switch models, change the string in `ChatController.cs`; to upgrade to Opus, use `claude-opus-4-8`
- Requires `ANTHROPIC__ApiKey` in `.env`

### SQL Server
- Container name: `sqlserver`, port `1433`
- Credentials loaded from `.env` via `ConnectionStrings__DefaultConnection`
- Database: `NbaTracker`
- Schema changes require a manual `ALTER TABLE` (no EF migrations are set up — `EnsureCreated` only runs on a missing DB)

---

## Frontend — nba-tracker-ui

**Run:** `npm run dev` from `nba-tracker-ui/`
**Port:** `5173` (default Vite)

### Pages
| File | Route | Purpose |
|------|-------|---------|
| `TeamsPage.jsx` | `/` | Grid of all teams |
| `TeamDetailPage.jsx` | `/teams/:id` | Roster + team's games |
| `GamesPage.jsx` | `/games` | Full game schedule |
| `GameDetailPage.jsx` | `/games/:id` | Box score + play-by-play |

### Key files
- `src/api/nbaApi.js` — all fetch calls to the backend
- `src/components/ChatBot.jsx` — floating chat widget, calls `POST /api/chat`
- `vite.config.js` — proxies `/api` → `https://localhost:5001`

### ⚠️ Known port mismatch
The Vite proxy targets `https://localhost:5001` but the backend HTTPS port is `7087`. Either:
- Update `vite.config.js` proxy target to `https://localhost:7087`, or
- Run the backend with `dotnet run --launch-profile https` and confirm it binds to `7087`

---

## Running the full stack
```bash
# Terminal 1 — backend
cd NbaTracker.Api && dotnet run

# Terminal 2 — frontend
cd nba-tracker-ui && npm run dev
```
