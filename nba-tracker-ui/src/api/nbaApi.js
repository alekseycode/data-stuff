const BASE = '/api'

async function request(path, options) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  return res.json()
}

export const getTeams = () => request('/teams')

export const getTeam = (id) => request(`/teams/${id}`)

export const getGames = (teamId, limit = 50) => {
  const params = new URLSearchParams({ limit })
  if (teamId) params.set('teamId', teamId)
  return request(`/games?${params}`)
}

export const getGame = (id) => request(`/games/${id}`)

export const sendChatMessage = (message) =>
  request('/chat', { method: 'POST', body: JSON.stringify({ message }) })
