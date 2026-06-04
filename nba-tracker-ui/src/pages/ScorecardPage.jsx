import { useState, useEffect } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { getTeam, getGame } from '../api/nbaApi'
import LoadingSpinner from '../components/LoadingSpinner'

const QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4', 'OT']

export default function ScorecardPage() {
  const { gameId } = useParams()
  const [searchParams] = useSearchParams()
  const originTeamId = searchParams.get('teamId')

  const [game, setGame] = useState(null)
  const [homePlayers, setHomePlayers] = useState([])
  const [visitorPlayers, setVisitorPlayers] = useState([])
  const [loading, setLoading] = useState(true)

  const [scores, setScores] = useState({})   // { playerId: pts }
  const [log, setLog] = useState([])          // [{ teamAbbr, name, pts, quarter }]
  const [quarter, setQuarter] = useState('Q1')

  useEffect(() => {
    getGame(gameId)
      .then(async (g) => {
        setGame(g)
        const [home, visitor] = await Promise.all([
          getTeam(g.homeTeam.id).catch(() => ({ players: [] })),
          getTeam(g.visitorTeam.id).catch(() => ({ players: [] })),
        ])
        setHomePlayers(home.players ?? [])
        setVisitorPlayers(visitor.players ?? [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [gameId])

  const addPoints = (player, teamAbbr, pts) => {
    setScores((prev) => ({ ...prev, [player.id]: (prev[player.id] || 0) + pts }))
    setLog((prev) => [
      ...prev,
      { teamAbbr, name: `${player.firstName} ${player.lastName}`, pts, quarter },
    ])
  }

  const homeTotal = homePlayers.reduce((sum, p) => sum + (scores[p.id] || 0), 0)
  const visitorTotal = visitorPlayers.reduce((sum, p) => sum + (scores[p.id] || 0), 0)

  const backTo = originTeamId ? `/teams/${originTeamId}` : '/games'

  if (loading) return <LoadingSpinner message="Loading scorecard…" />
  if (!game) return <p className="text-gray-500 text-sm">Game not found.</p>

  const gameDate = new Date(game.date).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link to={backTo} className="text-sm text-gray-400 hover:text-white flex items-center gap-1 transition-colors">
          ← Back
        </Link>
        <button
          onClick={() => { setScores({}); setLog([]) }}
          className="text-xs text-gray-500 hover:text-red-400 transition-colors"
        >
          Reset
        </button>
      </div>

      {/* Scoreboard */}
      <div className="card p-6">
        <div className="text-center mb-5">
          <p className="text-gray-400 text-sm">{gameDate}</p>
          <p className="text-xs text-gray-600 mt-0.5">Live Scorecard</p>
        </div>

        <div className="flex items-center justify-between gap-4">
          {/* Home team */}
          <div className="flex flex-col items-center gap-2 flex-1">
            <span className="text-xs text-gray-500 font-semibold tracking-widest">HOME</span>
            {game.homeTeam.logo ? (
              <img src={game.homeTeam.logo} alt={game.homeTeam.nickName} className="w-16 h-16 object-contain"
                onError={(e) => { e.target.style.display = 'none' }} />
            ) : (
              <div className="w-16 h-16 flex items-center justify-center text-xl font-bold text-brand bg-gray-800 rounded-xl">
                {game.homeTeam.abbreviation}
              </div>
            )}
            <p className="text-xs text-gray-400">{game.homeTeam.shortName}</p>
            <p className="font-bold text-white text-sm">{game.homeTeam.nickName}</p>
          </div>

          {/* Scores */}
          <div className="flex items-center gap-4 shrink-0">
            <span className={`text-6xl font-black tabular-nums transition-all ${homeTotal > visitorTotal ? 'text-white' : 'text-gray-500'}`}>
              {homeTotal}
            </span>
            <span className="text-2xl font-light text-gray-600">–</span>
            <span className={`text-6xl font-black tabular-nums transition-all ${visitorTotal > homeTotal ? 'text-white' : 'text-gray-500'}`}>
              {visitorTotal}
            </span>
          </div>

          {/* Visitor team */}
          <div className="flex flex-col items-center gap-2 flex-1">
            <span className="text-xs text-gray-500 font-semibold tracking-widest">AWAY</span>
            {game.visitorTeam.logo ? (
              <img src={game.visitorTeam.logo} alt={game.visitorTeam.nickName} className="w-16 h-16 object-contain"
                onError={(e) => { e.target.style.display = 'none' }} />
            ) : (
              <div className="w-16 h-16 flex items-center justify-center text-xl font-bold text-brand bg-gray-800 rounded-xl">
                {game.visitorTeam.abbreviation}
              </div>
            )}
            <p className="text-xs text-gray-400">{game.visitorTeam.shortName}</p>
            <p className="font-bold text-white text-sm">{game.visitorTeam.nickName}</p>
          </div>
        </div>

        {/* Quarter selector */}
        <div className="flex justify-center gap-2 mt-6">
          {QUARTERS.map((q) => (
            <button
              key={q}
              onClick={() => setQuarter(q)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                quarter === q
                  ? 'bg-brand text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Two-team rosters */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <TeamRoster
          team={game.homeTeam}
          players={homePlayers}
          scores={scores}
          onScore={addPoints}
        />
        <TeamRoster
          team={game.visitorTeam}
          players={visitorPlayers}
          scores={scores}
          onScore={addPoints}
        />
      </div>

      {/* Scoring log */}
      {log.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-white mb-3">Scoring Log</h2>
          <div className="card divide-y divide-gray-800/60 max-h-64 overflow-y-auto">
            {[...log].reverse().map((entry, i) => (
              <div key={i} className="px-4 py-2.5 flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 font-mono w-6">{entry.quarter}</span>
                  <span className="text-xs font-semibold text-brand">{entry.teamAbbr}</span>
                  <span className="text-gray-300">{entry.name}</span>
                </div>
                <span className={`font-semibold tabular-nums ${entry.pts === 3 ? 'text-green-400' : 'text-blue-400'}`}>
                  +{entry.pts}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function TeamRoster({ team, players, scores, onScore }) {
  const total = players.reduce((sum, p) => sum + (scores[p.id] || 0), 0)

  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        {team.logo ? (
          <img src={team.logo} alt={team.nickName} className="w-8 h-8 object-contain"
            onError={(e) => { e.target.style.display = 'none' }} />
        ) : null}
        <h2 className="text-lg font-bold text-white">{team.nickName}</h2>
      </div>

      {players.length === 0 ? (
        <p className="text-gray-500 text-sm">No roster data available.</p>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-left">
                <th className="px-3 py-2.5 stat-label">#</th>
                <th className="px-3 py-2.5 stat-label">Player</th>
                <th className="px-3 py-2.5 stat-label text-center">Pts</th>
                <th className="px-3 py-2.5 stat-label text-center">Score</th>
              </tr>
            </thead>
            <tbody>
              {players.map((player, i) => (
                <tr
                  key={player.id}
                  className={`border-b border-gray-800/50 ${i % 2 === 0 ? '' : 'bg-gray-900/30'}`}
                >
                  <td className="px-3 py-2.5 font-mono text-brand font-semibold text-xs">
                    {player.jerseyNumber || '—'}
                  </td>
                  <td className="px-3 py-2.5 text-white font-medium">
                    {player.firstName} {player.lastName}
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <span className={`text-base font-bold tabular-nums ${scores[player.id] ? 'text-white' : 'text-gray-600'}`}>
                      {scores[player.id] || 0}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => onScore(player, team.abbreviation, 2)}
                        className="px-2.5 py-1 rounded-md bg-blue-900/40 hover:bg-blue-800/70 text-blue-300 font-semibold text-xs transition-colors"
                      >
                        +2
                      </button>
                      <button
                        onClick={() => onScore(player, team.abbreviation, 3)}
                        className="px-2.5 py-1 rounded-md bg-green-900/40 hover:bg-green-800/70 text-green-300 font-semibold text-xs transition-colors"
                      >
                        +3
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-gray-700 bg-gray-800/50">
                <td colSpan={2} className="px-3 py-2.5 text-gray-400 font-semibold text-xs">
                  Team Total
                </td>
                <td className="px-3 py-2.5 text-center">
                  <span className="text-base font-bold text-brand tabular-nums">{total}</span>
                </td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  )
}
