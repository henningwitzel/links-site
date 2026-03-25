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
  return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`
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
    <main
      style={{
        maxWidth: 860,
        margin: '0 auto',
        padding: '0 1.25rem 5rem',
        minHeight: '100vh',
      }}
    >
      {/* ── Header ── */}
      <header
        style={{
          paddingTop: '2.5rem',
          paddingBottom: '1.25rem',
          borderBottom: '1px solid var(--border)',
          marginBottom: 0,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            gap: '1rem',
            marginBottom: '1rem',
          }}
        >
          <h1
            className="font-serif"
            style={{
              fontSize: '2rem',
              lineHeight: 1,
              letterSpacing: '-0.01em',
              color: 'var(--text)',
              margin: 0,
            }}
          >
            Links
          </h1>
          <span
            style={{
              fontSize: '0.8125rem',
              color: 'var(--text-faint)',
              flexShrink: 0,
            }}
          >
            Things worth coming back to
          </span>
        </div>

        {/* Search row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            borderBottom: '1px solid var(--border)',
            paddingBottom: '0.5rem',
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            style={{ color: 'var(--text-faint)', flexShrink: 0 }}
          >
            <circle cx="5.5" cy="5.5" r="4" stroke="currentColor" strokeWidth="1.5" />
            <path d="M9 9l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            placeholder="Search links..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="search-input"
            autoComplete="off"
            spellCheck={false}
          />
          <span
            style={{
              fontSize: '0.75rem',
              color: 'var(--text-faint)',
              flexShrink: 0,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {filtered.length}
          </span>
        </div>
      </header>

      {/* ── Link list ── */}
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
              style={{
                display: 'grid',
                gridTemplateColumns: '68px 20px 1fr',
                gap: '0 0.75rem',
                alignItems: 'start',
                padding: '0.875rem 0.5rem',
                margin: '0 -0.5rem',
                borderBottom: '1px solid var(--border)',
                textDecoration: 'none',
                borderRadius: 4,
                transition: 'background 0.1s ease',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              {/* Date + last accessed */}
              <div style={{ paddingTop: 2 }}>
                <span
                  style={{
                    display: 'block',
                    fontSize: '0.6875rem',
                    lineHeight: '1.4',
                    color: 'var(--text-faint)',
                    fontVariantNumeric: 'tabular-nums',
                    letterSpacing: '0.01em',
                  }}
                >
                  {formatDate(link.date)}
                </span>
                {lastAccess && (
                  <span
                    style={{
                      display: 'block',
                      fontSize: '0.625rem',
                      lineHeight: '1.4',
                      marginTop: 2,
                      color: 'var(--indigo)',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {formatAccessed(lastAccess)}
                  </span>
                )}
              </div>

              {/* Favicon */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://www.google.com/s2/favicons?sz=32&domain=${link.domain}`}
                width={16}
                height={16}
                style={{ borderRadius: 3, marginTop: 3, display: 'block' }}
                alt=""
                onError={e => (e.currentTarget.style.visibility = 'hidden')}
              />

              {/* Content */}
              <div style={{ minWidth: 0 }}>
                <p
                  style={{
                    margin: '0 0 0.2rem',
                    fontSize: '0.9375rem',
                    fontWeight: 500,
                    lineHeight: '1.35',
                    color: 'var(--text)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {link.title}
                </p>
                {link.notes && (
                  <p
                    style={{
                      margin: '0 0 0.2rem',
                      fontSize: '0.8125rem',
                      lineHeight: '1.5',
                      color: 'var(--text-muted)',
                    }}
                  >
                    {link.notes}
                  </p>
                )}
                <span
                  style={{
                    display: 'block',
                    fontSize: '0.6875rem',
                    color: 'var(--text-url)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {link.url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}
                </span>
              </div>
            </a>
          )
        })}

        {filtered.length === 0 && (
          <p
            style={{
              textAlign: 'center',
              padding: '4rem 0',
              fontSize: '0.875rem',
              color: 'var(--text-faint)',
            }}
          >
            No links found
          </p>
        )}
      </div>
    </main>
  )
}
