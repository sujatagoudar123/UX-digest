-- Run this once in Vercel Postgres query editor

CREATE TABLE IF NOT EXISTS subscribers (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS events (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  event_date TEXT,
  event_time TEXT,
  city TEXT,
  type TEXT DEFAULT 'online',  -- 'online' or 'offline'
  registration_url TEXT,
  source TEXT,
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(title, event_date)
);

CREATE TABLE IF NOT EXISTS sent_digests (
  id SERIAL PRIMARY KEY,
  subscriber_id INTEGER REFERENCES subscribers(id) ON DELETE CASCADE,
  sent_at TIMESTAMPTZ DEFAULT NOW()
);
