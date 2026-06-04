import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import ChatBot from './components/ChatBot'
import AllTeamsPage from './pages/AllTeamsPage'
import PlayoffsPage from './pages/PlayoffsPage'
import TeamPage from './pages/TeamPage'
import GamesPage from './pages/GamesPage'
import GameDetailPage from './pages/GameDetailPage'
import ScorecardPage from './pages/ScorecardPage'

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-6 max-w-7xl">
        <Routes>
          <Route path="/" element={<Navigate to="/teams" replace />} />
          <Route path="/teams" element={<AllTeamsPage />} />
          <Route path="/teams/:id" element={<TeamPage />} />
          <Route path="/playoffs" element={<PlayoffsPage />} />
          <Route path="/playoffs/:id" element={<TeamPage />} />
          <Route path="/games" element={<GamesPage />} />
          <Route path="/games/:id" element={<GameDetailPage />} />
          <Route path="/scorecard/:gameId" element={<ScorecardPage />} />
        </Routes>
      </main>
      <ChatBot />
    </div>
  )
}
