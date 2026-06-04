import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getGames } from '../api/nbaApi'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'

const LIMIT_OPTIONS = [10, 25, 50, 100]

export default function GamesPage() {
  const [limit, setLimit] = useState(50)
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    getGames(null, limit)
      .then(setGames)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [limit])

  const grouped = games.reduce((acc, game) => {
    const date = game.date.split('T')[0]
    ;(acc[date] = acc[date] || []).push(game)
    return acc
  }, {})
  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a))

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Games</h1>
          <p className="text-gray-400 mt-1">{games.length} games loaded</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="stat-label">Show</span>
          <div className="flex gap-1">
            {LIMIT_OPTIONS.map((opt) => (
              <button
                key={opt}
                onClick={() => setLimit(opt)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  limit === opt
                    ? 'bg-brand text-white'
                    : 'bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
          <span className="stat-label">games</span>
        </div>
      </div>

      {loading && <LoadingSpinner message="Loading games…" />}
      {error && <ErrorMessage message={error} />}

      {!loading && !error && sortedDates.map((date) => (
        <section key={date}>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
            {new Date(date + 'T12:00:00').toLocaleDateString('en-US', {
              weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
            })}
          </h2>
          <div className="space-y-2">
            {grouped[date].map((game) => (
              <Link
                key={game.id}
                to={`/games/${game.id}`}
                className="card px-5 py-4 flex items-center justify-between hover:border-brand hover:bg-gray-800/50 transition-all group"
              >
                <TeamLabel team={game.homeTeam} score={game.homeBoxScore?.points} />
                <div className="text-center px-4">
                  {game.isCompleted ? (
                    <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">Final</span>
                  ) : (
                    <span className="text-xs bg-green-900/40 text-green-400 px-2 py-0.5 rounded-full animate-pulse">
                      Live
                    </span>
                  )}
                  <p className="text-gray-600 text-xs mt-1">vs</p>
                </div>
                <TeamLabel team={game.visitorTeam} score={game.visitorBoxScore?.points} right />
              </Link>
            ))}
          </div>
        </section>
      ))}

      {!loading && !error && games.length === 0 && (
        <p className="text-center text-gray-500 py-16">No games found.</p>
      )}
    </div>
  )
}

function TeamLabel({ team, score, right }) {
  return (
    <div className={`flex items-center gap-3 ${right ? 'flex-row-reverse' : ''}`}>
      {team.logo ? (
        <img src={team.logo} alt={team.nickName} className="w-10 h-10 object-contain"
          onError={(e) => { e.target.style.display = 'none' }} />
      ) : (
        <div className="w-10 h-10 flex items-center justify-center text-xs font-bold text-brand bg-gray-800 rounded-lg">
          {team.abbreviation || team.shortName?.slice(0, 3)}
        </div>
      )}
      <div className={right ? 'text-right' : ''}>
        <p className="text-xs text-gray-400">{team.shortName}</p>
        <p className="font-semibold text-white text-sm">{team.nickName}</p>
      </div>
      {score != null && (
        <span className="text-2xl font-bold text-white tabular-nums">{score}</span>
      )}
    </div>
  )
}
