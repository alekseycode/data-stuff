import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getGame } from '../api/nbaApi'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'

const BOX_SCORE_ROWS = [
  { label: 'Points', key: 'points' },
  { label: 'FG', format: (b) => `${b.fieldGoals}/${b.fieldGoalsAttempted}` },
  { label: 'FG%', format: (b) => `${(b.fieldGoalPercentage * 100).toFixed(1)}%` },
  { label: '3PT', format: (b) => `${b.threePointers}/${b.threePointersAttempted}` },
  { label: '3PT%', format: (b) => `${(b.threePointPercentage * 100).toFixed(1)}%` },
  { label: 'FT', format: (b) => `${b.freeThrows}/${b.freeThrowsAttempted}` },
  { label: 'FT%', format: (b) => `${(b.freeThrowPercentage * 100).toFixed(1)}%` },
  { label: 'Off Reb', key: 'offensiveRebounds' },
  { label: 'Def Reb', key: 'defensiveRebounds' },
  { label: 'Rebounds', key: 'totalRebounds' },
  { label: 'Assists', key: 'assists' },
  { label: 'Steals', key: 'steals' },
  { label: 'Blocks', key: 'blocks' },
  { label: 'Turnovers', key: 'turnovers' },
]

function getVal(row, boxScore) {
  if (!boxScore) return '—'
  if (row.format) return row.format(boxScore)
  return boxScore[row.key] ?? '—'
}

export default function GameDetailPage() {
  const { id } = useParams()
  const [game, setGame] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    getGame(id)
      .then(setGame)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <LoadingSpinner message="Loading game…" />
  if (error) return <ErrorMessage message={error} />
  if (!game) return null

  const gameDate = new Date(game.date).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  })

  return (
    <div className="space-y-8">
      <Link to="/games" className="text-sm text-gray-400 hover:text-white flex items-center gap-1 transition-colors">
        ← All Games
      </Link>

      {/* Scoreboard */}
      <div className="card p-6">
        <div className="text-center mb-6">
          <p className="text-gray-400 text-sm">{gameDate}</p>
          <span className={`mt-1 inline-block text-xs px-3 py-0.5 rounded-full ${
            game.isCompleted
              ? 'bg-gray-800 text-gray-400'
              : 'bg-green-900/40 text-green-400 animate-pulse'
          }`}>
            {game.isCompleted ? 'Final' : 'Live'}
          </span>
        </div>

        <div className="flex items-center justify-between gap-4">
          <TeamScore team={game.homeTeam} score={game.homeBoxScore?.points} label="HOME" />
          <span className="text-3xl font-light text-gray-600">–</span>
          <TeamScore team={game.visitorTeam} score={game.visitorBoxScore?.points} label="AWAY" right />
        </div>
      </div>

      {/* Box Score */}
      {(game.homeBoxScore || game.visitorBoxScore) && (
        <div>
          <h2 className="text-xl font-bold text-white mb-4">Box Score</h2>
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="px-4 py-3 text-left stat-label">Stat</th>
                  <th className="px-4 py-3 text-right stat-label">
                    {game.homeTeam.abbreviation || game.homeTeam.nickName}
                  </th>
                  <th className="px-4 py-3 text-right stat-label">
                    {game.visitorTeam.abbreviation || game.visitorTeam.nickName}
                  </th>
                </tr>
              </thead>
              <tbody>
                {BOX_SCORE_ROWS.map((row) => (
                  <tr key={row.label} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                    <td className="px-4 py-2.5 text-gray-400">{row.label}</td>
                    <td className="px-4 py-2.5 text-right font-semibold text-white">
                      {getVal(row, game.homeBoxScore)}
                    </td>
                    <td className="px-4 py-2.5 text-right font-semibold text-white">
                      {getVal(row, game.visitorBoxScore)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Play-by-play */}
      {game.events?.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-white mb-4">Play-by-Play</h2>
          <div className="card divide-y divide-gray-800/60 max-h-96 overflow-y-auto">
            {game.events.map((event) => (
              <div key={event.id} className="px-4 py-3 flex items-start gap-4 hover:bg-gray-800/30 text-sm">
                <span className="text-gray-500 shrink-0 w-12 text-right font-mono">
                  Q{event.period}
                </span>
                <span className="text-brand shrink-0 text-xs uppercase font-semibold pt-0.5">
                  {event.eventType}
                </span>
                <span className="text-gray-300">{event.playByPlay}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function TeamScore({ team, score, label, right }) {
  return (
    <div className={`flex flex-col items-center gap-2 flex-1 ${right ? 'items-end' : 'items-start'} sm:items-center`}>
      <span className="text-xs text-gray-500 font-semibold tracking-widest">{label}</span>
      {team.logo ? (
        <img src={team.logo} alt={team.nickName} className="w-16 h-16 object-contain"
          onError={(e) => { e.target.style.display = 'none' }} />
      ) : (
        <div className="w-16 h-16 flex items-center justify-center text-xl font-bold text-brand bg-gray-800 rounded-xl">
          {team.abbreviation}
        </div>
      )}
      <div className="text-center">
        <p className="text-xs text-gray-400">{team.shortName}</p>
        <p className="font-bold text-white">{team.nickName}</p>
      </div>
      {score != null && (
        <span className="text-5xl font-black text-white tabular-nums">{score}</span>
      )}
    </div>
  )
}
