# Getting Started

## Prerequisites

- [.NET 9 SDK](https://dotnet.microsoft.com/download)
- [Node.js 18+](https://nodejs.org)
- [Docker](https://www.docker.com) (for SQL Server)
- A free [Anthropic API key](https://console.anthropic.com) (for the chatbot)

---

## 1. Start SQL Server

If you don't have a SQL Server container running:

```bash
docker run -e "ACCEPT_EULA=Y" -e "SA_PASSWORD=YourPassword123!" \
  -p 1433:1433 --name sqlserver -d mcr.microsoft.com/mssql/server:2022-latest
```

The database and schema are created automatically when the API starts.

---

## 2. Configure environment variables

Copy the example file and fill in your values:

```bash
cp NbaTracker.Api/.env.example NbaTracker.Api/.env
```

Open `NbaTracker.Api/.env` and set:

```
ANTHROPIC__ApiKey=sk-ant-...

ConnectionStrings__DefaultConnection=Server=localhost,1433;Database=NbaTracker;User Id=sa;Password=YourPassword123!;TrustServerCertificate=True

Nba__ClientId=your-nba-client-id
Nba__ClientApiKey=your-nba-client-api-key
```

---

## 3. Start the backend

```bash
cd NbaTracker.Api
dotnet run
```

The API will be available at `http://localhost:5079`.

---

## 4. Start the frontend

In a new terminal:

```bash
cd nba-tracker-ui
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Verify it's working

- Open `http://localhost:5173` — you should see the playoff teams grid
- Click a team to see the roster and games
- Click a game to see the box score and play-by-play
- Use the chat button (bottom-right) to ask questions about the app
