import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getTeams } from '../api/nbaApi'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'

export default function PlayoffsPage() {
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    getTeams()
      .then(setTeams)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const filtered = teams.filter((t) => {
    const q = search.toLowerCase()
    return (
      t.nickName.toLowerCase().includes(q) ||
      t.shortName.toLowerCase().includes(q) ||
      t.abbreviation.toLowerCase().includes(q)
    )
  })

  const byConference = filtered.reduce((acc, team) => {
    const key = team.conference || 'Other'
    ;(acc[key] = acc[key] || []).push(team)
    return acc
  }, {})

  if (loading) return <LoadingSpinner message="Loading teams…" />
  if (error) return <ErrorMessage message={error} />

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-white">Playoffs</h1>
            <span className="bg-brand/20 text-brand text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider">
              2025–26
            </span>
          </div>
          <p className="text-gray-400 mt-1">
            {teams.length} active playoff teams — live data from NBA API
          </p>
        </div>
        <input
          type="text"
          placeholder="Search teams…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-gray-900 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-brand w-full sm:w-64"
        />
      </div>

      {Object.entries(byConference).sort().map(([conf, confTeams]) => (
        <section key={conf}>
          <h2 className="text-lg font-semibold text-gray-300 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand inline-block" />
            {conf} Conference
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {confTeams.map((team) => (
              <Link
                key={team.id}
                to={`/playoffs/${team.id}`}
                className="card p-4 flex flex-col items-center gap-3 hover:border-brand hover:bg-gray-800 transition-all group"
              >
                {team.logo ? (
                  <img
                    src={team.logo}
                    alt={team.nickName}
                    className="w-16 h-16 object-contain"
                    onError={(e) => { e.target.style.display = 'none' }}
                  />
                ) : (
                  <div className="w-16 h-16 flex items-center justify-center text-3xl font-bold text-brand">
                    {team.abbreviation}
                  </div>
                )}
                <div className="text-center">
                  <p className="text-xs text-gray-400">{team.shortName}</p>
                  <p className="font-semibold text-white text-sm group-hover:text-brand transition-colors">
                    {team.nickName}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{team.division}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}

      {filtered.length === 0 && (
        <p className="text-center text-gray-500 py-16">No teams match "{search}"</p>
      )}
    </div>
  )
}
