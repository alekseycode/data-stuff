import { NavLink } from 'react-router-dom'

export default function Navbar() {
  const linkClass = ({ isActive }) =>
    `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-brand text-white'
        : 'text-gray-300 hover:text-white hover:bg-gray-800'
    }`

  return (
    <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-40">
      <div className="container mx-auto px-4 max-w-7xl h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🏀</span>
          <span className="text-xl font-bold text-white tracking-tight">
            NBA <span className="text-brand">Tracker</span>
          </span>
        </div>
        <nav className="flex items-center gap-2">
          <NavLink to="/teams" className={linkClass}>
            Teams
          </NavLink>
          <NavLink to="/playoffs" className={linkClass}>
            Playoffs
          </NavLink>
          <NavLink to="/games" className={linkClass}>
            Games
          </NavLink>
        </nav>
      </div>
    </header>
  )
}
