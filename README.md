# NBA Tracker

NBA game data tracker with a C# .NET Core backend, Vite/React frontend, and SQL Server cache.

---

## Architecture

```
frontend/          Vite + React + Tailwind (port 5173)
NbaTracker.Api/    ASP.NET Core 9 Web API (port 5079)
SQL Server         Caches completed game results
NBA GraphQL API    https://apis-dev.nba.com/v1/onegraph/graphql
```

---

## Setup

### 1. Environment variables

Copy `.env.example` to `.env` inside `NbaTracker.Api/` and fill in the values:

```
ANTHROPIC__ApiKey=
ConnectionStrings__DefaultConnection=
Nba__ClientId=
Nba__ClientApiKey=
```

### 2. SQL Server

Requires a SQL Server instance on `localhost:1433`. The `NbaTracker` database and schema are created automatically on first run.

### 3. Run the API

```bash
cd NbaTracker.Api
dotnet run
```

### 4. Run the frontend

```bash
cd nba-tracker-ui
npm install
npm run dev
```

---

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/teams` | All teams in the current season |
| GET | `/api/teams/{id}` | Team detail with full roster |
| GET | `/api/games?teamId=&limit=` | Games list, optionally filtered by team |
| GET | `/api/games/{id}` | Single game with box scores and play-by-play |
| POST | `/api/chat` | AI chatbot (Claude Haiku 4.5) — body: `{ "message": "..." }` |

---

## Data & Caching Strategy

**Live (always fetched from NBA API):**
- Teams and rosters

**Cached in SQL Server:**
- Completed game box scores — fetched on first request, then served from DB

The `GET /api/games/{id}` endpoint checks the DB first; on a cache miss it fetches from the API and writes to DB if the game is finished.

---

## NBA API

- **Endpoint:** `https://apis-dev.nba.com/v1/onegraph/graphql`
- **Season:** NBA Playoffs 2025-26 (`seasonId: 42025`)
- **Stats available:** Team-level box scores only (points, FG, 3P, FT, rebounds, assists, steals, blocks, turnovers)
- **Note:** Per-player game stats are not available — player data is roster info only

To change the active season, update `Nba:SeasonId` in `appsettings.json`.
