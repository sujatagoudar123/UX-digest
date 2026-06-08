import { sql } from '@vercel/postgres'
import { Subscriber, UXEvent } from '@/types'

export async function getSubscribers(): Promise<Subscriber[]> {
  const { rows } = await sql<Subscriber>`SELECT * FROM subscribers ORDER BY created_at DESC`
  return rows
}

export async function addSubscriber(email: string): Promise<void> {
  await sql`INSERT INTO subscribers (email) VALUES (${email}) ON CONFLICT (email) DO NOTHING`
}

export async function removeSubscriber(email: string): Promise<void> {
  await sql`DELETE FROM subscribers WHERE email = ${email}`
}

export async function subscriberExists(email: string): Promise<boolean> {
  const { rows } = await sql`SELECT id FROM subscribers WHERE email = ${email}`
  return rows.length > 0
}

export async function saveEvents(events: UXEvent[]): Promise<void> {
  for (const e of events) {
    await sql`
      INSERT INTO events (title, description, event_date, event_time, city, type, registration_url, source, last_seen)
      VALUES (${e.title}, ${e.description}, ${e.event_date}, ${e.event_time}, ${e.city}, ${e.type}, ${e.registration_url}, ${e.source}, NOW())
      ON CONFLICT (title, event_date) DO UPDATE SET last_seen = NOW()
    `
  }
}

export async function recordDigestSent(subscriberId: number): Promise<void> {
  await sql`INSERT INTO sent_digests (subscriber_id, sent_at) VALUES (${subscriberId}, NOW())`
}

export async function wasDigestSentToday(subscriberId: number): Promise<boolean> {
  const { rows } = await sql`
    SELECT id FROM sent_digests
    WHERE subscriber_id = ${subscriberId}
      AND sent_at > NOW() - INTERVAL '20 hours'
  `
  return rows.length > 0
}
