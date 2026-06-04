import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getTeam, getGames } from '../api/nbaApi'
import NBA_TEAMS from '../data/nbaTeams'
import STATIC_ROSTERS from '../data/nbaRosters'
import LoadingSpinner from '../components/LoadingSpinner'

const PLAYOFF_IDS = new Set([
  '1610612737','1610612738','1610612739','1610612740',
  '1610612741','1610612742','1610612743','1610612744',
  '1610612745','1610612746',
])

export default function TeamPage() {
  const { id } = useParams()
  const staticTeam = NBA_TEAMS.find((t) => t.id === id)
  const isPlayoff = PLAYOFF_IDS.has(id)

  const [liveData, setLiveData] = useState(null)
  const [loadingRoster, setLoadingRoster] = useState(isPlayoff)
  const [games, setGames] = useState([])
  const [loadingGames, setLoadingGames] = useState(true)

  useEffect(() => {
    if (!isPlayoff) return
    getTeam(id)
      .then(setLiveData)
      .catch(() => {})
      .finally(() => setLoadingRoster(false))
  }, [id, isPlayoff])

  useEffect(() => {
    getGames(id, 20)
      .then(setGames)
      .catch(() => {})
      .finally(() => setLoadingGames(false))
  }, [id])

  const staticRoster = STATIC_ROSTERS[id] ?? []

  if (!staticTeam) {
    return (
      <div className="text-center py-24 text-gray-500">
        Team not found.{' '}
        <Link to="/teams" className="text-brand hover:underline">Back to teams</Link>
      </div>
    )
  }

  const players = liveData?.players ?? staticRoster
  const rosterSeason = isPlayoff ? '2025–26 Playoffs' : '2024–25 Season'

  return (
    <div className="space-y-8">
      <Link to="/teams" className="text-sm text-gray-400 hover:text-white flex items-center gap-1 transition-colors">
        ← All Teams
      </Link>

      {/* Header */}
      <div className="card p-6 flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <img
          src={staticTeam.logo}
          alt={staticTeam.nickName}
          className="w-24 h-24 object-contain"
          onError={(e) => { e.target.style.display = 'none' }}
        />
        <div className="flex-1">
          <p className="text-gray-400 text-sm">{staticTeam.shortName}</p>
          <h1 className="text-4xl font-bold text-white">{staticTeam.nickName}</h1>
          <div className="flex flex-wrap gap-2 mt-3">
            <span className="bg-gray-800 text-gray-300 text-xs px-3 py-1 rounded-full">
              {staticTeam.conference} Conference
            </span>
            <span className="bg-gray-800 text-gray-300 text-xs px-3 py-1 rounded-full">
              {staticTeam.division} Division
            </span>
            <span className="bg-brand/20 text-brand text-xs px-3 py-1 rounded-full font-mono font-semibold">
              {staticTeam.abbreviation}
            </span>
            {isPlayoff && (
              <span className="bg-yellow-900/30 text-yellow-400 text-xs px-3 py-1 rounded-full font-semibold">
                🏆 2025–26 Playoffs
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <InfoCard label="Arena" value={staticTeam.arena} />
        <InfoCard label="Founded" value={staticTeam.founded} />
        <InfoCard label="Abbreviation" value={staticTeam.abbreviation} mono />
      </div>

      {/* Two-column: Roster (left) + Schedule (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

        {/* Left: Roster */}
        <div>
          <h2 className="text-xl font-bold text-white mb-4">
            Roster
            {!loadingRoster && players.length > 0 && (
              <span className="ml-2 text-sm font-normal text-gray-400">
                ({players.length} players · {rosterSeason})
              </span>
            )}
          </h2>

          {loadingRoster && <LoadingSpinner message="Loading roster…" />}

          {!loadingRoster && players.length === 0 && (
            <p className="text-gray-500 text-sm">No roster data available.</p>
          )}

          {players.length > 0 && (
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
                  {players.map((player, i) => (
                    <tr
                      key={player.id}
                      className={`border-b border-gray-800/50 hover:bg-gray-800/50 transition-colors ${i % 2 === 0 ? '' : 'bg-gray-900/30'}`}
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

        {/* Right: Schedule */}
        <div>
          <h2 className="text-xl font-bold text-white mb-4">Schedule</h2>

          {loadingGames && <LoadingSpinner message="Loading schedule…" />}

          {!loadingGames && games.length === 0 && (
            <p className="text-gray-500 text-sm">No games found.</p>
          )}

          {!loadingGames && games.length > 0 && (
            <div className="space-y-2">
              {games.map((game) => {
                const dateStr = new Date(
                  game.date.split('T')[0] + 'T12:00:00'
                ).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

                return (
                  <div key={game.id} className="card px-4 py-3 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 mb-1">{dateStr}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm text-gray-300">
                          {game.homeTeam?.abbreviation ?? game.homeTeam?.nickName}
                        </span>
                        {game.homeBoxScore?.points != null && game.visitorBoxScore?.points != null && (
                          <span className="font-bold text-white text-sm tabular-nums">
                            {game.homeBoxScore.points}–{game.visitorBoxScore.points}
                          </span>
                        )}
                        <span className="text-sm text-gray-300">
                          {game.visitorTeam?.abbreviation ?? game.visitorTeam?.nickName}
                        </span>
                        {game.isCompleted && (
                          <span className="text-xs text-gray-600">Final</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Link
                        to={`/games/${game.id}`}
                        className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-medium transition-colors"
                      >
                        Details
                      </Link>
                      <Link
                        to={`/scorecard/${game.id}?teamId=${id}`}
                        className="px-3 py-1.5 rounded-lg bg-brand/20 hover:bg-brand/40 text-brand text-xs font-semibold transition-colors"
                      >
                        Record
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function InfoCard({ label, value, mono }) {
  return (
    <div className="card p-4">
      <p className="stat-label mb-1">{label}</p>
      <p className={`text-white font-semibold ${mono ? 'font-mono text-brand' : ''}`}>{value}</p>
    </div>
  )
}
