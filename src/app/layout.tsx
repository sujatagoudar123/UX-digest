import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'UX Events Digest',
  description: 'Daily UX & Design events digest for Bangalore designers',
  openGraph: {
    title: 'UX Events Digest',
    description: 'Get daily UX, UI & Product Design events delivered to your inbox.',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}
