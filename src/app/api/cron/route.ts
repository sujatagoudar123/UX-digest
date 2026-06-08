import { NextRequest, NextResponse } from 'next/server'
import { fetchUXEvents } from '@/lib/events'
import { getSubscribers, saveEvents, recordDigestSent, wasDigestSentToday } from '@/lib/db'
import { sendDigestEmail } from '@/lib/mailer'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function GET(req: NextRequest) {
  // Protect cron endpoint — only Vercel or you can call it
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  console.log('[Cron] Starting daily UX events digest...')

  try {
    // 1. Fetch events
    const events = await fetchUXEvents()
    console.log(`[Cron] Found ${events.length} events`)

    if (events.length === 0) {
      return NextResponse.json({ message: 'No events found today' })
    }

    // 2. Save to DB
    await saveEvents(events)

    // 3. Get subscribers
    const subscribers = await getSubscribers()
    console.log(`[Cron] Sending to ${subscribers.length} subscribers`)

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ux-event-digest.vercel.app'

    let sent = 0
    let skipped = 0

    for (const sub of subscribers) {
      // Skip if already sent today
      const alreadySent = await wasDigestSentToday(sub.id)
      if (alreadySent) {
        skipped++
        continue
      }

      try {
        const unsubscribeUrl = `${appUrl}/unsubscribe?email=${encodeURIComponent(sub.email)}`
        await sendDigestEmail(sub.email, events, unsubscribeUrl)
        await recordDigestSent(sub.id)
        sent++
        console.log(`[Cron] Sent to ${sub.email}`)
      } catch (err) {
        console.error(`[Cron] Failed to send to ${sub.email}:`, err)
      }
    }

    return NextResponse.json({
      success: true,
      events: events.length,
      sent,
      skipped,
    })
  } catch (err) {
    console.error('[Cron] Fatal error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
