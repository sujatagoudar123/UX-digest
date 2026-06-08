export interface UXEvent {
  title: string
  description: string
  event_date: string
  event_time: string
  city: string
  type: 'online' | 'offline'
  registration_url: string
  source: string
}

export interface Subscriber {
  id: number
  email: string
  created_at: string
}
