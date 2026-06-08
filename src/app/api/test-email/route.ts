import { NextRequest, NextResponse } from 'next/server'
import { fetchUXEvents } from '@/lib/events'
import { sendDigestEmail } from '@/lib/mailer'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const to = searchParams.get('to')

  if (!to) {
    return NextResponse.json({ error: 'Missing ?to= email param' }, { status: 400 })
  }

  try {
    const events = await fetchUXEvents()
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ux-event-digest.vercel.app'
    await sendDigestEmail(to, events, `${appUrl}/unsubscribe?email=${encodeURIComponent(to)}`)
    return NextResponse.json({ success: true, eventsFound: events.length })
  } catch (err) {
    console.error('[Test Email]', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
