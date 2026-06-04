import { useState, useRef, useEffect } from 'react'
import { sendChatMessage } from '../api/nbaApi'

const WELCOME = "Hi! I'm your NBA Tracker assistant. Ask me how to navigate the app, find stats, or anything about the teams and games!"

export default function ChatBot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([{ role: 'bot', text: WELCOME }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend(e) {
    e.preventDefault()
    const text = input.trim()
    if (!text || loading) return

    setMessages((prev) => [...prev, { role: 'user', text }])
    setInput('')
    setLoading(true)

    try {
      const data = await sendChatMessage(text)
      setMessages((prev) => [...prev, { role: 'bot', text: data.response }])
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'bot', text: 'Sorry, I had trouble connecting. Please try again.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-brand hover:bg-brand-dark rounded-full shadow-lg flex items-center justify-center text-2xl transition-transform hover:scale-105"
        aria-label="Toggle chat"
      >
        {open ? '✕' : '💬'}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 card shadow-2xl flex flex-col overflow-hidden">
          <div className="bg-brand px-4 py-3 flex items-center gap-2">
            <span className="text-lg">🤖</span>
            <span className="font-semibold text-white">NBA Assistant</span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 h-80">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-brand text-white rounded-br-sm'
                      : 'bg-gray-800 text-gray-100 rounded-bl-sm'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-800 px-3 py-2 rounded-2xl rounded-bl-sm text-gray-400 text-sm">
                  <span className="animate-pulse">Thinking…</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <form onSubmit={handleSend} className="border-t border-gray-800 p-3 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask something…"
              className="flex-1 bg-gray-800 text-white placeholder-gray-500 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-brand"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="btn-primary text-sm px-3 py-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </>
  )
}
