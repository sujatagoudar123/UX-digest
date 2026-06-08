'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

function UnsubscribeForm() {
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const emailParam = searchParams.get('email')
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam))
    }
  }, [searchParams])

  async function handleUnsubscribe(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')

    try {
      const res = await fetch('/api/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()

      if (res.ok) {
        setStatus('success')
        setMessage("You've been unsubscribed. Sorry to see you go! 👋")
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
    <form onSubmit={handleUnsubscribe} className="flex flex-col gap-3 max-w-sm mx-auto">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        required
        disabled={status === 'loading' || status === 'success'}
        className="input"
      />
      <button
        type="submit"
        disabled={status === 'loading' || status === 'success'}
        className="btn-primary"
      >
        {status === 'loading' ? 'Removing...' : status === 'success' ? '✓ Unsubscribed' : 'Unsubscribe'}
      </button>
      {message && (
        <p className={`text-sm text-center ${status === 'success' ? 'text-green-400' : 'text-red-400'}`}>
          {message}
        </p>
      )}
      {status === 'success' && (
        <a href="/" className="text-sm text-indigo-400 text-center hover:underline">
          Changed your mind? Subscribe again →
        </a>
      )}
    </form>
  )
}

export default function UnsubscribePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <div className="max-w-md mx-auto">
        <div className="text-4xl mb-4">😢</div>
        <h1 className="text-2xl font-bold text-white mb-2">Unsubscribe</h1>
        <p className="text-gray-400 mb-8">
          Enter your email below and we&apos;ll remove you immediately. No questions asked.
        </p>
        <Suspense fallback={<div className="text-gray-500">Loading...</div>}>
          <UnsubscribeForm />
        </Suspense>
      </div>
    </main>
  )
}
