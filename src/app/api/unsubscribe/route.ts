import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { removeSubscriber } from '@/lib/db'

const schema = z.object({
  email: z.string().email(),
})

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const result = schema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
  }

  try {
    await removeSubscriber(result.data.email)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[Unsubscribe] error:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
