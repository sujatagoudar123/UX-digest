import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { addSubscriber, subscriberExists } from '@/lib/db'

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

// Simple in-memory rate limiting (resets on cold start — fine for small scale)
const rateLimitMap = new Map<string, number>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const last = rateLimitMap.get(ip) || 0
  if (now - last < 60_000) return true // 1 request per minute per IP
  rateLimitMap.set(ip, now)
  return false
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || 'unknown'

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait a minute.' },
      { status: 429 }
    )
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const result = schema.safeParse(body)
  if (!result.success) {
    return NextResponse.json(
      { error: result.error.errors[0].message },
      { status: 400 }
    )
  }

  const { email } = result.data

  try {
    const exists = await subscriberExists(email)
    if (exists) {
      return NextResponse.json(
        { error: 'This email is already subscribed!' },
        { status: 409 }
      )
    }

    await addSubscriber(email)
    return NextResponse.json({ success: true, message: 'Subscribed successfully!' })
  } catch (err) {
    console.error('[Subscribe] DB error:', err)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
