'use client'

import { useEffect, useState } from 'react'

interface Link {
  date: string
  title: string
  url: string
  notes: string
  domain: string
}

function formatDate(iso: string) {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!m) return iso
  return `${m[3]}.${m[2]}.${m[1]}`
}

function formatAccessed(ts: number): string {
  const now = Date.now()
  const diff = now - ts
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days === 1) return 'yesterday'
  if (days < 7) return `${days}d ago`
  const d = new Date(ts)
  return `${String(d.getDate()).padStart(2,'0')}.${String(d.getMonth()+1).padStart(2,'0')}.${d.getFullYear()}`
}

export default function Home() {
  const [links, setLinks] = useState<Link[]>([])
  const [query, setQuery] = useState('')
  const [accessed, setAccessed] = useState<Record<string, number>>({})

  useEffect(() => {
    fetch('/api/links').then(r => r.json()).then(setLinks)
    fetch('/api/track').then(r => r.json()).then(setAccessed)
  }, [])

  const filtered = query
    ? links.filter(l =>
        l.title.toLowerCase().includes(query.toLowerCase()) ||
        l.notes.toLowerCase().includes(query.toLowerCase()) ||
        l.domain.toLowerCase().includes(query.toLowerCase())
      )
    : links

  function handleClick(url: string) {
    const ts = Date.now()
    setAccessed(prev => ({ ...prev, [url]: ts }))
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    })
  }

  return (
    <main className="max-w-[820px] mx-auto px-5 sm:px-8 pb-20" style={{ background: '#0e1117', minHeight: '100vh' }}>
      <header className="flex items-baseline justify-between gap-4 pt-8 pb-5 border-b border-white/10">
        <h1 className="font-serif text-[1.75rem] tracking-tight" style={{ color: '#f0f0f0' }}>Links</h1>
        <span className="text-sm" style={{ color: '#666' }}>Things worth coming back to</span>
      </header>

      <div className="flex items-center gap-3 py-3">
        <input
          type="text"
          placeholder="Search…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="flex-1 rounded-lg px-3.5 py-2 text-sm outline-none transition-colors"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#f0f0f0' }}
        />
        <span className="text-xs shrink-0" style={{ color: '#555' }}>{filtered.length} links</span>
      </div>

      <div>
        {filtered.map((link, i) => {
          const lastAccess = accessed[link.url]
          return (
            <a
              key={i}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => handleClick(link.url)}
              className="grid gap-x-3 items-start py-4 -mx-1 px-1 rounded-lg transition-all group"
              style={{
                gridTemplateColumns: '72px 22px 1fr 14px',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <div className="pt-0.5">
                <span className="text-xs tabular-nums leading-5 block" style={{ color: '#555' }}>
                  {formatDate(link.date)}
                </span>
                {lastAccess && (
                  <span className="text-[10px] tabular-nums leading-4 block mt-0.5" style={{ color: '#6366f1' }}>
                    {formatAccessed(lastAccess)}
                  </span>
                )}
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://www.google.com/s2/favicons?sz=32&domain=${link.domain}`}
                width={18}
                height={18}
                className="rounded-sm mt-0.5"
                alt=""
                onError={e => (e.currentTarget.style.display = 'none')}
              />
              <div className="min-w-0">
                <p className="text-sm font-medium truncate mb-0.5 leading-5" style={{ color: '#e8e8e8' }}>{link.title}</p>
                {link.notes && (
                  <p className="text-xs leading-relaxed mb-1" style={{ color: '#666' }}>{link.notes}</p>
                )}
                <span className="text-[11px] truncate block" style={{ color: '#444' }}>
                  {link.url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}
                </span>
              </div>
              <span className="text-sm pt-0.5 transition-colors" style={{ color: '#444' }}>↗</span>
            </a>
          )
        })}
        {filtered.length === 0 && (
          <p className="text-sm text-zinc-600 text-center py-16">No links found</p>
        )}
      </div>
    </main>
  )
}
