import { useState } from 'react'
import { Link } from 'react-router-dom'
import NBA_TEAMS from '../data/nbaTeams'

const PLAYOFF_IDS = new Set([
  '1610612737','1610612738','1610612739','1610612740',
  '1610612741','1610612742','1610612743','1610612744',
  '1610612745','1610612746',
])

const DIVISIONS = [
  'Atlantic', 'Central', 'Southeast',
  'Pacific', 'Northwest', 'Southwest',
]

export default function AllTeamsPage() {
  const [search, setSearch] = useState('')
  const [view, setView] = useState('conference') // 'conference' | 'division'

  const filtered = NBA_TEAMS.filter((t) => {
    const q = search.toLowerCase()
    return (
      t.nickName.toLowerCase().includes(q) ||
      t.shortName.toLowerCase().includes(q) ||
      t.abbreviation.toLowerCase().includes(q) ||
      t.arena.toLowerCase().includes(q)
    )
  })

  const groups =
    view === 'conference'
      ? {
          East: filtered.filter((t) => t.conference === 'East'),
          West: filtered.filter((t) => t.conference === 'West'),
        }
      : DIVISIONS.reduce((acc, div) => {
          const teams = filtered.filter((t) => t.division === div)
          if (teams.length) acc[div] = teams
          return acc
        }, {})

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">All NBA Teams</h1>
          <p className="text-gray-400 mt-1">All 30 teams — click any team to view details</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <input
            type="text"
            placeholder="Search teams…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-gray-900 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-brand w-48"
          />
          <div className="flex rounded-lg overflow-hidden border border-gray-700">
            <button
              onClick={() => setView('conference')}
              className={`px-3 py-2 text-sm font-medium transition-colors ${view === 'conference' ? 'bg-brand text-white' : 'bg-gray-900 text-gray-400 hover:text-white'}`}
            >
              Conference
            </button>
            <button
              onClick={() => setView('division')}
              className={`px-3 py-2 text-sm font-medium transition-colors ${view === 'division' ? 'bg-brand text-white' : 'bg-gray-900 text-gray-400 hover:text-white'}`}
            >
              Division
            </button>
          </div>
        </div>
      </div>

      {/* Groups */}
      {Object.entries(groups).map(([group, teams]) =>
        teams.length === 0 ? null : (
          <section key={group}>
            <h2 className="text-lg font-semibold text-gray-300 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand inline-block" />
              {group}{view === 'conference' ? ' Conference' : ' Division'}
              <span className="text-gray-600 text-sm font-normal">({teams.length})</span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {teams.map((team) => (
                <TeamCard key={team.id} team={team} />
              ))}
            </div>
          </section>
        )
      )}

      {filtered.length === 0 && (
        <p className="text-center text-gray-500 py-16">No teams match "{search}"</p>
      )}
    </div>
  )
}

function TeamCard({ team }) {
  const isPlayoff = PLAYOFF_IDS.has(team.id)

  return (
    <Link to={`/teams/${team.id}`} className="card p-4 flex flex-col items-center gap-3 hover:border-brand hover:bg-gray-800 transition-all group relative">
      {isPlayoff && (
        <span className="absolute top-2 right-2 text-[10px] bg-brand/20 text-brand font-semibold px-1.5 py-0.5 rounded-full uppercase tracking-wide">
          Playoffs
        </span>
      )}
      <img
        src={team.logo}
        alt={team.nickName}
        className="w-14 h-14 object-contain"
        onError={(e) => { e.target.style.display = 'none' }}
      />
      <div className="text-center">
        <p className="text-xs text-gray-400">{team.shortName}</p>
        <p className="font-semibold text-sm text-white group-hover:text-brand transition-colors">
          {team.nickName}
        </p>
        <p className="text-xs text-gray-600 mt-0.5">{team.arena}</p>
      </div>
    </Link>
  )
}
