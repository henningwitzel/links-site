'use client'

import { useEffect, useState } from 'react'

interface Link {
  date: string
  title: string
  url: string
  notes: string
  relevance?: string
  tags?: string[]
  domain: string
}

interface Preview {
  image?: string
  description?: string
}

function LinkCard({ link, lastAccess, onClickLink, index = 0 }: {
  link: Link
  lastAccess?: number
  onClickLink: (url: string) => void
  index?: number
}) {
  const [preview, setPreview] = useState<Preview | null>(null)

  useEffect(() => {
    const delay = index * 150
    const timer = setTimeout(() => {
      fetch(`/api/preview?url=${encodeURIComponent(link.url)}`)
        .then(r => r.json())
        .then((data: Preview) => setPreview(data))
        .catch(() => {})
    }, delay)
    return () => clearTimeout(timer)
  }, [link.url, index])

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => onClickLink(link.url)}
      className="link-card"
      style={{ '--card-index': Math.min(index, 12) } as React.CSSProperties}
    >
      {/* OG preview image */}
      {preview?.image && (
        <div className="card-preview">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview.image}
            alt={link.title}
            className="card-preview-img"
            onError={e => ((e.currentTarget as HTMLImageElement).parentElement!.style.display = 'none')}
          />
        </div>
      )}

      {/* Top: favicon + title */}
      <div className="card-top">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`https://www.google.com/s2/favicons?sz=32&domain=${link.domain}`}
          width={20}
          height={20}
          className="card-favicon"
          alt=""
          onError={e => ((e.currentTarget as HTMLImageElement).style.visibility = 'hidden')}
        />
        <span className="card-title">{link.title}</span>
      </div>

      {/* Body: notes + relevance + url */}
      <div className="card-body">
        {(link.notes || preview?.description) && (
          <p className="card-notes">{link.notes || preview?.description}</p>
        )}
        {link.relevance && (
          <p className="card-relevance">💡 {link.relevance}</p>
        )}
        <span className="card-url">
          {link.url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}
        </span>
      </div>

      {/* Tags */}
      {link.tags && link.tags.length > 0 && (
        <div className="card-tags">
          {link.tags.map((tag) => (
            <span key={tag} className="card-tag">{tag}</span>
          ))}
        </div>
      )}

      {/* Footer: dates */}
      <div className="card-footer">
        <span className="meta-date">{formatDate(link.date)}</span>
        {lastAccess && (
          <span className="meta-accessed">{formatAccessed(lastAccess)}</span>
        )}
      </div>
    </a>
  )
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
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const [accessed, setAccessed] = useState<Record<string, number>>({})
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    fetch('/api/links')
      .then(r => r.json())
      .then(data => {
        setLinks(data)
        setLoaded(true)
      })
    fetch('/api/track').then(r => r.json()).then(setAccessed)
  }, [])

  // Collect all unique tags
  const allTags = Array.from(new Set(links.flatMap(l => l.tags || []))).sort()

  const filtered = links.filter(l => {
    const matchesTag = !activeTag || (l.tags && l.tags.includes(activeTag))
    const matchesQuery = !query || (
      l.title.toLowerCase().includes(query.toLowerCase()) ||
      l.notes.toLowerCase().includes(query.toLowerCase()) ||
      (l.relevance && l.relevance.toLowerCase().includes(query.toLowerCase())) ||
      (l.tags && l.tags.some(t => t.toLowerCase().includes(query.toLowerCase()))) ||
      l.domain.toLowerCase().includes(query.toLowerCase())
    )
    return matchesTag && matchesQuery
  })

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
    <main className="page-wrap">
      {/* ── Header ── */}
      <header className="page-header">
        <div className="header-row">
          <h1 className="page-title font-serif">Henning&apos;s Link Collection</h1>
          <p className="header-sub">Things worth coming back to</p>
        </div>

        <div className="search-wrap">
          <svg
            className="search-icon"
            width="15"
            height="15"
            viewBox="0 0 15 15"
            fill="none"
            aria-hidden="true"
          >
            <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.4" />
            <path
              d="M10.5 10.5L13.5 13.5"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          </svg>
          <input
            type="text"
            placeholder="Search links..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            aria-label="Search links"
            className="search-input"
            autoComplete="off"
            spellCheck={false}
          />
          <span className="search-count">{loaded ? filtered.length : ''}</span>
        </div>
        {/* Tag filter */}
        {loaded && allTags.length > 0 && (
          <div className="tag-filter">
            <button
              className={`tag-btn ${activeTag === null ? 'tag-btn-active' : ''}`}
              onClick={() => setActiveTag(null)}
            >
              All
            </button>
            {allTags.map(tag => (
              <button
                key={tag}
                className={`tag-btn ${activeTag === tag ? 'tag-btn-active' : ''}`}
                onClick={() => setActiveTag(activeTag === tag ? null : tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* ── Skeleton loading ── */}
      {!loaded && (
        <div className="skeleton-grid">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton-card">
              <div className="skeleton-line skeleton-line-title" />
              <div className="skeleton-line skeleton-line-notes" />
              <div className="skeleton-line skeleton-line-notes2" />
              <div className="skeleton-line skeleton-line-url" />
            </div>
          ))}
        </div>
      )}

      {/* ── Cards ── */}
      {loaded && filtered.length > 0 && (
        <div className="card-grid">
          {filtered.map((link, i) => (
            <LinkCard
              key={i}
              index={i}
              link={link}
              lastAccess={accessed[link.url]}
              onClickLink={handleClick}
            />
          ))}
        </div>
      )}

      {loaded && filtered.length === 0 && (
        <p className="empty-state">
          {query ? 'No links match that search.' : 'No links yet.'}
        </p>
      )}
    </main>
  )
}
