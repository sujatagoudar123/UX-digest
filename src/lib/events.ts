import { UXEvent } from '@/types'

const UX_KEYWORDS = [
  'UX Design event',
  'UI Design conference',
  'Product Design meetup',
  'User Research event',
  'Design Systems conference',
  'Figma event',
  'Design Thinking workshop',
  'Accessibility design event',
  'Interaction Design conference',
]

const BANGALORE_TERMS = ['Bangalore', 'Bengaluru', 'India']

// Fetches events using Google Custom Search API (free: 100 queries/day)
// Falls back to scraping public Eventbrite/Meetup search pages
export async function fetchUXEvents(): Promise<UXEvent[]> {
  const events: UXEvent[] = []

  // Try Google Custom Search first
  if (process.env.GOOGLE_API_KEY && process.env.GOOGLE_CSE_ID) {
    const searchEvents = await searchViaGoogle()
    events.push(...searchEvents)
  }

  // Always include curated public sources
  const publicEvents = await fetchPublicSources()
  events.push(...publicEvents)

  // Deduplicate by title
  const seen = new Set<string>()
  const unique = events.filter((e) => {
    const key = e.title.toLowerCase().trim()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  // Sort: Bangalore events first, then online, then by date
  unique.sort((a, b) => {
    const aIsBlr = BANGALORE_TERMS.some((t) =>
      a.city.toLowerCase().includes(t.toLowerCase())
    )
    const bIsBlr = BANGALORE_TERMS.some((t) =>
      b.city.toLowerCase().includes(t.toLowerCase())
    )
    if (aIsBlr && !bIsBlr) return -1
    if (!aIsBlr && bIsBlr) return 1
    return a.event_date.localeCompare(b.event_date)
  })

  return unique.slice(0, 15)
}

async function searchViaGoogle(): Promise<UXEvent[]> {
  const events: UXEvent[] = []
  const query = encodeURIComponent(
    'UX design conference OR meetup OR workshop 2025 site:eventbrite.com OR site:meetup.com'
  )

  try {
    const url = `https://www.googleapis.com/customsearch/v1?key=${process.env.GOOGLE_API_KEY}&cx=${process.env.GOOGLE_CSE_ID}&q=${query}&num=10`
    const res = await fetch(url, { next: { revalidate: 0 } })
    if (!res.ok) return []
    const data = await res.json()

    if (!data.items) return []

    for (const item of data.items) {
      const title = item.title?.replace(/ - Eventbrite| \| Meetup/gi, '').trim()
      const snippet = item.snippet || ''
      const link = item.link || ''

      // Guess event type
      const isOnline =
        snippet.toLowerCase().includes('online') ||
        snippet.toLowerCase().includes('virtual') ||
        snippet.toLowerCase().includes('webinar')

      // Guess city
      let city = 'Online'
      const blrMatch = snippet.match(/bangalore|bengaluru/i)
      if (blrMatch) city = 'Bangalore, India'
      else if (!isOnline) {
        const cityMatch = snippet.match(/in ([A-Z][a-z]+(,\s*[A-Z]{2})?)/i)
        if (cityMatch) city = cityMatch[1]
      }

      // Extract date from snippet
      const dateMatch = snippet.match(
        /(\w+ \d{1,2},?\s*\d{4}|\d{1,2}\s+\w+\s+\d{4})/i
      )
      const eventDate = dateMatch ? dateMatch[0] : 'See website for date'

      if (title && link) {
        events.push({
          title,
          description: snippet,
          event_date: eventDate,
          event_time: 'See website',
          city,
          type: isOnline ? 'online' : 'offline',
          registration_url: link,
          source: link.includes('eventbrite') ? 'Eventbrite' : 'Meetup',
        })
      }
    }
  } catch (err) {
    console.error('[fetchViaGoogle] error:', err)
  }

  return events
}

// Scrapes publicly accessible event pages without needing an API key
async function fetchPublicSources(): Promise<UXEvent[]> {
  const events: UXEvent[] = []

  const sources = [
    {
      url: 'https://www.eventbrite.com/d/india--bangalore/ux-design/',
      sourceName: 'Eventbrite Bangalore',
    },
    {
      url: 'https://www.eventbrite.com/d/online/ux-design/',
      sourceName: 'Eventbrite Online',
    },
    {
      url: 'https://www.meetup.com/find/?keywords=UX+Design&location=Bangalore%2C+India',
      sourceName: 'Meetup Bangalore',
    },
  ]

  for (const { url, sourceName } of sources) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (compatible; UXEventDigestBot/1.0; +https://ux-event-digest.vercel.app)',
          Accept: 'text/html',
        },
        next: { revalidate: 0 },
      })

      if (!res.ok) continue
      const html = await res.text()

      // Extract JSON-LD structured data (most event sites embed this)
      const jsonLdMatches = html.matchAll(
        /<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi
      )

      for (const match of jsonLdMatches) {
        try {
          const json = JSON.parse(match[1])
          const items = Array.isArray(json) ? json : [json]

          for (const item of items) {
            if (item['@type'] !== 'Event') continue

            const startDate = item.startDate || ''
            const location = item.location?.name || item.location?.address?.addressLocality || ''
            const isOnline =
              item.eventAttendanceMode?.includes('Online') ||
              location.toLowerCase().includes('online') ||
              !location

            const city = isOnline
              ? 'Online'
              : location || 'See website'

            const regUrl =
              item.url || item.offers?.url || url

            events.push({
              title: item.name || 'UX Event',
              description: (item.description || '').slice(0, 200),
              event_date: startDate
                ? new Date(startDate).toDateString()
                : 'See website',
              event_time: startDate
                ? new Date(startDate).toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : 'See website',
              city,
              type: isOnline ? 'online' : 'offline',
              registration_url: regUrl,
              source: sourceName,
            })
          }
        } catch {
          // Skip malformed JSON-LD
        }
      }
    } catch (err) {
      console.error(`[fetchPublicSources] failed for ${url}:`, err)
    }
  }

  // If no live events found (e.g. scraping blocked), use curated fallback list
  // so the digest is never empty during testing
  if (events.length === 0) {
    return getFallbackEvents()
  }

  return events
}

// Curated fallback — always-fresh links to browse events manually
function getFallbackEvents(): UXEvent[] {
  return [
    {
      title: 'Upcoming UX Events — Eventbrite Bangalore',
      description:
        'Browse the latest UX Design and Product Design events happening in Bangalore and nearby.',
      event_date: 'Multiple dates',
      event_time: 'Various',
      city: 'Bangalore, India',
      type: 'offline',
      registration_url: 'https://www.eventbrite.com/d/india--bangalore/ux-design/',
      source: 'Eventbrite',
    },
    {
      title: 'UX & Design Meetups — Meetup.com Bangalore',
      description:
        'Find local UX designer meetup groups in Bangalore. Free and paid events for all skill levels.',
      event_date: 'Multiple dates',
      event_time: 'Various',
      city: 'Bangalore, India',
      type: 'offline',
      registration_url:
        'https://www.meetup.com/find/?keywords=UX+Design&location=Bangalore%2C+India',
      source: 'Meetup',
    },
    {
      title: 'Online UX Conferences & Webinars — Eventbrite',
      description:
        'Discover online UX, UI, and Product Design conferences and webinars open worldwide.',
      event_date: 'Multiple dates',
      event_time: 'Various',
      city: 'Online',
      type: 'online',
      registration_url: 'https://www.eventbrite.com/d/online/ux-design/',
      source: 'Eventbrite',
    },
    {
      title: 'NN/g UX Conference — Nielsen Norman Group',
      description:
        'World-leading UX research and training. Annual conferences covering UX strategy, research, and design.',
      event_date: 'See website',
      event_time: 'See website',
      city: 'Online / USA',
      type: 'online',
      registration_url: 'https://www.nngroup.com/training/',
      source: 'NNGroup',
    },
    {
      title: 'UXPA International Conference',
      description:
        'User Experience Professionals Association annual global conference for UX practitioners.',
      event_date: 'See website',
      event_time: 'See website',
      city: 'Online',
      type: 'online',
      registration_url: 'https://uxpa.org/uxpa-international-conference/',
      source: 'UXPA',
    },
  ]
}
