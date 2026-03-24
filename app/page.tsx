'use client'

import { useEffect, useState } from 'react'

interface Link {
  date: string
  title: string
  url: string
  notes: string
  domain: string
}

const STORAGE_KEY = 'links-last-accessed'

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

function getAccessMap(): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
  } catch { return {} }
}

function recordAccess(url: string) {
  const map = getAccessMap()
  map[url] = Date.now()
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map))
}

export default function Home() {
  const [links, setLinks] = useState<Link[]>([])
  const [query, setQuery] = useState('')
  const [accessed, setAccessed] = useState<Record<string, number>>({})

  useEffect(() => {
    fetch('/api/links').then(r => r.json()).then(setLinks)
    setAccessed(getAccessMap())
  }, [])

  const filtered = query
    ? links.filter(l =>
        l.title.toLowerCase().includes(query.toLowerCase()) ||
        l.notes.toLowerCase().includes(query.toLowerCase()) ||
        l.domain.toLowerCase().includes(query.toLowerCase())
      )
    : links

  function handleClick(url: string) {
    recordAccess(url)
    setAccessed(getAccessMap())
  }

  return (
    <main className="max-w-[820px] mx-auto px-6 sm:px-8 pb-20">
      <header className="flex items-baseline justify-between gap-4 py-10 border-b border-white/10">
        <h1 className="font-serif text-[1.75rem] tracking-tight">Links</h1>
        <span className="text-sm text-zinc-500">Things worth coming back to</span>
      </header>

      <div className="flex items-center gap-3 py-4">
        <input
          type="text"
          placeholder="Search…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3.5 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-indigo-500 transition-colors"
        />
        <span className="text-xs text-zinc-600 shrink-0">{filtered.length} links</span>
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
              className="grid gap-x-3 items-start py-4 border-b border-white/[0.07] hover:bg-white/[0.03] -mx-2 px-2 rounded-lg transition-colors group"
              style={{ gridTemplateColumns: '72px 24px 1fr 16px' }}
            >
              <div className="pt-0.5">
                <span className="text-xs text-zinc-600 tabular-nums leading-5 block">
                  {formatDate(link.date)}
                </span>
                {lastAccess && (
                  <span className="text-[10px] text-indigo-500/70 tabular-nums leading-4 block mt-0.5">
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
                <p className="text-sm font-medium text-zinc-100 truncate mb-0.5 leading-5">{link.title}</p>
                {link.notes && (
                  <p className="text-xs text-zinc-500 leading-relaxed mb-1">{link.notes}</p>
                )}
                <span className="text-[11px] text-zinc-700 truncate block">
                  {link.url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}
                </span>
              </div>
              <span className="text-zinc-700 group-hover:text-zinc-400 text-sm pt-0.5 transition-colors">↗</span>
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
