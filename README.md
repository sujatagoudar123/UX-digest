# UX Events Digest

A simple, **100% free** Next.js app that emails daily UX event digests to subscribers.

- Runs on **Vercel** (free tier)
- Uses **Gmail SMTP** (free — no paid email service)
- Uses **Vercel Postgres** (free tier — up to 256MB)
- Sends at **8:00 AM IST** every day via **Vercel Cron**

---

## How It Works

1. Vercel Cron triggers `/api/cron` at 8 AM IST (2:30 AM UTC)
2. The app scrapes Eventbrite and Meetup for UX/UI/Design events
3. Sends a clean email digest to all subscribers
4. Each email has an unsubscribe link

---

## Deploy in 5 Steps

### Step 1 — Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/ux-event-digest.git
git push -u origin main
```

### Step 2 — Create Vercel Project

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import your GitHub repo
3. Click **Deploy**

### Step 3 — Add Vercel Postgres

1. In your Vercel project → **Storage** tab
2. Click **Create Database** → choose **Postgres**
3. Name it `ux-event-digest-db` → Create
4. Vercel will automatically add the `POSTGRES_*` env vars

### Step 4 — Run the SQL Migration

1. In Vercel → **Storage** → your database → **Query** tab
2. Paste and run the contents of `sql/schema.sql`

### Step 5 — Add Environment Variables

In Vercel → **Settings** → **Environment Variables**, add:

| Variable | Value |
|---|---|
| `GMAIL_USER` | `youremail@gmail.com` |
| `GMAIL_APP_PASSWORD` | Your Gmail App Password (see below) |
| `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` |
| `CRON_SECRET` | Any random string (e.g. `openssl rand -hex 32`) |

Then **Redeploy** so the new env vars take effect.

---

## Gmail App Password Setup

You **cannot** use your real Gmail password. You need an App Password:

1. Go to [myaccount.google.com/security](https://myaccount.google.com/security)
2. Enable **2-Step Verification** (required)
3. Go to **App passwords** → Select app: **Mail** → Select device: **Other**
4. Type `UX Event Digest` → Generate
5. Copy the 16-character password → paste as `GMAIL_APP_PASSWORD` in Vercel

---

## Test the Email

After deploying, test it by visiting:

```
https://your-app.vercel.app/api/test-email?to=your@email.com
```

With the Authorization header:
```
Authorization: Bearer YOUR_CRON_SECRET
```

Or use curl:
```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
  "https://your-app.vercel.app/api/test-email?to=your@email.com"
```

---

## Project Structure

```
src/
  app/
    page.tsx              ← Homepage with subscribe form
    unsubscribe/page.tsx  ← Unsubscribe page
    api/
      subscribe/route.ts  ← POST: add subscriber
      unsubscribe/route.ts← POST: remove subscriber
      cron/route.ts       ← GET: daily digest job
      test-email/route.ts ← GET: manual test send
  lib/
    events.ts             ← Fetches UX events from web
    mailer.ts             ← Gmail SMTP email sender
    db.ts                 ← Vercel Postgres queries
sql/
  schema.sql              ← Run this once to create tables
vercel.json               ← Cron schedule (2:30 AM UTC = 8 AM IST)
```

---

## Optional: Better Event Discovery

Add a **Google Custom Search API** key for more event results (100 free searches/day):

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Enable **Custom Search API**
3. Create credentials → API key → copy to `GOOGLE_API_KEY`
4. Go to [programmablesearchengine.google.com](https://programmablesearchengine.google.com)
5. Create a search engine → copy the ID to `GOOGLE_CSE_ID`

---

## Cost

| Service | Cost |
|---|---|
| Vercel Hobby (hosting + cron) | **Free** |
| Vercel Postgres (up to 256MB) | **Free** |
| Gmail SMTP | **Free** |
| Google Custom Search (optional) | **Free** (100/day) |
| **Total** | **$0/month** |
