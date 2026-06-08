import nodemailer from 'nodemailer'
import { UXEvent } from '@/types'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD, // Gmail App Password (not your real password)
  },
})

function buildEmailHtml(events: UXEvent[], unsubscribeUrl: string): string {
  const bangaloreEvents = events.filter(
    (e) =>
      e.city.toLowerCase().includes('bangalore') ||
      e.city.toLowerCase().includes('bengaluru') ||
      e.city.toLowerCase().includes('india')
  )
  const onlineEvents = events.filter((e) => e.type === 'online')
  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  function eventCard(e: UXEvent): string {
    const badge =
      e.type === 'online'
        ? `<span style="background:#dbeafe;color:#1d4ed8;padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:600;">🌐 Online</span>`
        : `<span style="background:#dcfce7;color:#166534;padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:600;">📍 In Person</span>`

    return `
      <div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;padding:20px;margin-bottom:16px;">
        <div style="margin-bottom:8px;">${badge}</div>
        <h3 style="margin:0 0 6px 0;font-size:16px;font-weight:700;color:#111827;line-height:1.3;">${e.title}</h3>
        <p style="margin:0 0 4px 0;font-size:13px;color:#6b7280;">
          📅 ${e.event_date} &nbsp;|&nbsp; 📍 ${e.city}
        </p>
        <p style="margin:8px 0 14px 0;font-size:14px;color:#374151;line-height:1.5;">
          ${e.description ? e.description.slice(0, 140) + (e.description.length > 140 ? '...' : '') : 'Click below to learn more about this event.'}
        </p>
        <a href="${e.registration_url}"
           style="display:inline-block;background:#4f46e5;color:#ffffff;text-decoration:none;padding:9px 20px;border-radius:8px;font-size:13px;font-weight:600;">
          View &amp; Register →
        </a>
      </div>
    `
  }

  const bangaloreSection =
    bangaloreEvents.length > 0
      ? `
      <h2 style="font-size:18px;font-weight:700;color:#111827;margin:32px 0 12px 0;border-bottom:2px solid #e5e7eb;padding-bottom:8px;">
        📍 Bangalore Events
      </h2>
      ${bangaloreEvents.map(eventCard).join('')}
    `
      : ''

  const onlineSection =
    onlineEvents.length > 0
      ? `
      <h2 style="font-size:18px;font-weight:700;color:#111827;margin:32px 0 12px 0;border-bottom:2px solid #e5e7eb;padding-bottom:8px;">
        🌐 Online Events
      </h2>
      ${onlineEvents.map(eventCard).join('')}
    `
      : ''

  const noEventsMsg =
    bangaloreEvents.length === 0 && onlineEvents.length === 0
      ? `<p style="color:#6b7280;text-align:center;padding:24px 0;">No specific events found today. Check Eventbrite and Meetup for the latest!</p>`
      : ''

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>UX Events Digest</title>
</head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:24px 16px;">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%);border-radius:16px;padding:32px 28px;margin-bottom:24px;text-align:center;">
      <p style="margin:0 0 4px 0;color:#c7d2fe;font-size:12px;letter-spacing:2px;text-transform:uppercase;font-weight:600;">Daily Digest</p>
      <h1 style="margin:0 0 8px 0;color:#ffffff;font-size:26px;font-weight:800;">UX Events Digest</h1>
      <p style="margin:0;color:#c7d2fe;font-size:14px;">${today}</p>
    </div>

    <!-- Intro -->
    <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 8px 0;">
      Hey there! 👋 Here are today's top UX, UI, and Design events handpicked for you.
      Whether you're in Bangalore or prefer online events — there's something for everyone.
    </p>

    ${bangaloreSection}
    ${onlineSection}
    ${noEventsMsg}

    <!-- Browse More -->
    <div style="background:#f3f4f6;border-radius:12px;padding:20px;text-align:center;margin-top:24px;">
      <p style="margin:0 0 12px 0;font-size:14px;color:#374151;font-weight:600;">Want to explore more events?</p>
      <a href="https://www.eventbrite.com/d/india--bangalore/ux-design/" style="display:inline-block;margin:4px;background:#ffffff;border:1px solid #d1d5db;color:#374151;text-decoration:none;padding:8px 16px;border-radius:8px;font-size:13px;">Eventbrite Bangalore</a>
      <a href="https://www.meetup.com/find/?keywords=UX+Design&location=Bangalore" style="display:inline-block;margin:4px;background:#ffffff;border:1px solid #d1d5db;color:#374151;text-decoration:none;padding:8px 16px;border-radius:8px;font-size:13px;">Meetup Groups</a>
      <a href="https://www.eventbrite.com/d/online/ux-design/" style="display:inline-block;margin:4px;background:#ffffff;border:1px solid #d1d5db;color:#374151;text-decoration:none;padding:8px 16px;border-radius:8px;font-size:13px;">Online Events</a>
    </div>

    <!-- Footer -->
    <div style="text-align:center;margin-top:24px;padding-top:16px;border-top:1px solid #e5e7eb;">
      <p style="font-size:12px;color:#9ca3af;margin:0 0 6px 0;">
        You're receiving this because you subscribed to UX Events Digest.
      </p>
      <a href="${unsubscribeUrl}" style="font-size:12px;color:#6b7280;">Unsubscribe</a>
    </div>

  </div>
</body>
</html>
  `
}

export async function sendDigestEmail(
  to: string,
  events: UXEvent[],
  unsubscribeUrl: string
): Promise<void> {
  const today = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })

  await transporter.sendMail({
    from: `"UX Events Digest" <${process.env.GMAIL_USER}>`,
    to,
    subject: `🎨 UX Events Digest – ${today}`,
    html: buildEmailHtml(events, unsubscribeUrl),
  })
}
