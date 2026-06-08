'use client'

import { useState } from 'react'

export default function HomePage() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function handleSubscribe(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    setMessage('')

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()

      if (res.ok) {
        setStatus('success')
        setMessage(data.message || 'You\'re subscribed! 🎉')
        setEmail('')
      } else {
        setStatus('error')
        setMessage(data.error || 'Something went wrong.')
      }
    } catch {
      setStatus('error')
      setMessage('Network error. Please try again.')
    }
  }

  return (
    <main className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="border-b border-[var(--border)] px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-2">
          <span className="text-xl">🎨</span>
          <span className="font-semibold text-white">UX Events Digest</span>
        </div>
      </nav>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center">
        <div className="max-w-2xl mx-auto">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-indigo-950 border border-indigo-800 text-indigo-300 text-sm px-4 py-1.5 rounded-full mb-8">
            <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse"></span>
            Daily digest every morning at 8:00 AM IST
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-5 leading-tight">
            Never miss a UX event
            <br />
            <span className="text-indigo-400">in Bangalore & online</span>
          </h1>

          <p className="text-lg text-gray-400 mb-10 leading-relaxed">
            Get a daily email with the best UX, UI, and Product Design events —
            meetups, conferences, webinars, and workshops — handpicked for designers.
          </p>

          {/* Subscribe Form */}
          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto mb-6">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              disabled={status === 'loading' || status === 'success'}
              className="input flex-1"
            />
            <button
              type="submit"
              disabled={status === 'loading' || status === 'success'}
              className="btn-primary whitespace-nowrap"
            >
              {status === 'loading' ? 'Subscribing...' : status === 'success' ? '✓ Subscribed!' : 'Subscribe Free'}
            </button>
          </form>

          {/* Status message */}
          {message && (
            <p className={`text-sm ${status === 'success' ? 'text-green-400' : 'text-red-400'}`}>
              {message}
            </p>
          )}

          <p className="text-xs text-gray-600 mt-4">
            Free forever · No spam · Unsubscribe any time
          </p>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-3 mt-16 max-w-xl mx-auto">
          {[
            '📍 Bangalore events',
            '🌐 Online worldwide',
            '🔬 User Research',
            '🎯 Design Systems',
            '♿ Accessibility',
            '✏️ Figma events',
            '🧠 Design Thinking',
          ].map((tag) => (
            <span
              key={tag}
              className="text-sm px-3 py-1.5 rounded-lg border border-[var(--border)] text-gray-400"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* How it works */}
        <div className="mt-20 max-w-3xl mx-auto w-full">
          <h2 className="text-2xl font-bold text-white mb-8">How it works</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { step: '1', icon: '🔍', title: 'We search daily', desc: 'Every morning we scan Eventbrite, Meetup, and UX community sites for new events.' },
              { step: '2', icon: '📬', title: 'We send a digest', desc: 'At 8 AM IST you get a clean email with the best events — Bangalore first, then online.' },
              { step: '3', icon: '🎫', title: 'You register', desc: 'Click any event card to go directly to the registration page.' },
            ].map((item) => (
              <div key={item.step} className="card p-6 text-left">
                <div className="text-2xl mb-3">{item.icon}</div>
                <h3 className="font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] px-6 py-6 text-center text-sm text-gray-600">
        UX Events Digest · Built for Bangalore designers ·{' '}
        <a href="/unsubscribe" className="underline hover:text-gray-400">Unsubscribe</a>
      </footer>
    </main>
  )
}
