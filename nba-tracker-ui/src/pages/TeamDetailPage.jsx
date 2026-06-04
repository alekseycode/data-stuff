import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getTeam } from '../api/nbaApi'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'

export default function TeamDetailPage() {
  const { id } = useParams()
  const [team, setTeam] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    getTeam(id)
      .then(setTeam)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <LoadingSpinner message="Loading team…" />
  if (error) return <ErrorMessage message={error} />
  if (!team) return null

  return (
    <div className="space-y-8">
      {/* Back */}
      <Link to="/playoffs" className="text-sm text-gray-400 hover:text-white flex items-center gap-1 transition-colors">
        ← Playoffs
      </Link>

      {/* Header */}
      <div className="card p-6 flex flex-col sm:flex-row items-center sm:items-start gap-6">
        {team.logo ? (
          <img
            src={team.logo}
            alt={team.nickName}
            className="w-24 h-24 object-contain"
            onError={(e) => { e.target.style.display = 'none' }}
          />
        ) : (
          <div className="w-24 h-24 flex items-center justify-center text-4xl font-bold text-brand bg-gray-800 rounded-xl">
            {team.abbreviation}
          </div>
        )}
        <div>
          <p className="text-gray-400 text-sm">{team.shortName}</p>
          <h1 className="text-4xl font-bold text-white">{team.nickName}</h1>
          <div className="flex flex-wrap gap-3 mt-3">
            <span className="bg-gray-800 text-gray-300 text-xs px-3 py-1 rounded-full">
              {team.conference} Conference
            </span>
            <span className="bg-gray-800 text-gray-300 text-xs px-3 py-1 rounded-full">
              {team.division} Division
            </span>
            <span className="bg-brand/20 text-brand text-xs px-3 py-1 rounded-full font-mono font-semibold">
              {team.abbreviation}
            </span>
          </div>
        </div>
      </div>

      {/* Roster */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">
          Roster
          <span className="ml-2 text-sm font-normal text-gray-400">
            ({team.players?.length ?? 0} players)
          </span>
        </h2>

        {!team.players?.length ? (
          <p className="text-gray-500 text-sm">No roster data available.</p>
        ) : (
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-left">
                  <th className="px-4 py-3 stat-label">#</th>
                  <th className="px-4 py-3 stat-label">Player</th>
                  <th className="px-4 py-3 stat-label">Pos</th>
                  <th className="px-4 py-3 stat-label">Ht</th>
                  <th className="px-4 py-3 stat-label">Wt</th>
                </tr>
              </thead>
              <tbody>
                {team.players.map((player, i) => (
                  <tr
                    key={player.id}
                    className={`border-b border-gray-800/50 hover:bg-gray-800/50 transition-colors ${
                      i % 2 === 0 ? '' : 'bg-gray-900/30'
                    }`}
                  >
                    <td className="px-4 py-3 font-mono text-brand font-semibold">
                      {player.jerseyNumber || '—'}
                    </td>
                    <td className="px-4 py-3 text-white font-medium">
                      {player.firstName} {player.lastName}
                    </td>
                    <td className="px-4 py-3 text-gray-400">{player.position || '—'}</td>
                    <td className="px-4 py-3 text-gray-400">{player.height || '—'}</td>
                    <td className="px-4 py-3 text-gray-400">
                      {player.weight ? `${player.weight} lbs` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
