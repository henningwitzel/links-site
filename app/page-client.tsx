'use client'

import { useMemo, useState } from 'react'
import { AppShell } from './ui'

export interface LinkItem {
  date: string
  date_added?: string
  title: string
  url: string
  notes: string
  summary?: string
  relevance?: string
  tags?: string[]
  domain: string
}

function formatDate(iso: string) {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!m) return iso
  return `${m[3]}.${m[2]}.${m[1]}`
}

function LinkCard({ link, index = 0 }: { link: LinkItem; index?: number }) {
  const cleanUrl = link.url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')

  return (
    <article className="simple-card" style={{ '--card-index': Math.min(index, 12) } as React.CSSProperties}>
      <div className="simple-card-top">
        <div className="simple-card-site">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://www.google.com/s2/favicons?sz=64&domain=${link.domain}`}
            width={20}
            height={20}
            className="simple-card-favicon"
            alt=""
            onError={(e) => ((e.currentTarget as HTMLImageElement).style.visibility = 'hidden')}
          />
          <span className="simple-card-domain">{link.domain.replace(/^www\./, '')}</span>
        </div>
        <span className="simple-card-date">{formatDate(link.date)}</span>
      </div>

      <a href={link.url} target="_blank" rel="noopener noreferrer" className="simple-card-link">
        <h2 className="simple-card-title">{link.title}</h2>
      </a>

      {link.notes && <p className="simple-card-text">{link.notes}</p>}
      {link.relevance && <p className="simple-card-callout">💡 {link.relevance}</p>}

      {link.tags && link.tags.length > 0 && (
        <div className="simple-card-tags">
          {link.tags.map((tag) => (
            <span key={tag} className="simple-card-tag">#{tag}</span>
          ))}
        </div>
      )}

      <div className="simple-card-footer">{cleanUrl}</div>
    </article>
  )
}

export default function HomeClient({ initialLinks }: { initialLinks: LinkItem[] }) {
  const [query, setQuery] = useState('')
  const [activeTag, setActiveTag] = useState<string | null>(null)

  const allTags = useMemo(() => Array.from(new Set(initialLinks.flatMap((l) => l.tags || []))).sort(), [initialLinks])

  const filtered = initialLinks.filter((l) => {
    const matchesTag = !activeTag || (l.tags && l.tags.includes(activeTag))
    const matchesQuery = !query || (
      l.title.toLowerCase().includes(query.toLowerCase()) ||
      l.notes.toLowerCase().includes(query.toLowerCase()) ||
      (l.relevance && l.relevance.toLowerCase().includes(query.toLowerCase())) ||
      (l.tags && l.tags.some((t) => t.toLowerCase().includes(query.toLowerCase()))) ||
      l.domain.toLowerCase().includes(query.toLowerCase())
    )
    return matchesTag && matchesQuery
  })

  const right = (
    <div className="ig-search-block">
      <input
        type="text"
        placeholder="Search saved links..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Search links"
        className="ig-search-input"
        autoComplete="off"
        spellCheck={false}
      />
      <span className="ig-search-count">{`${filtered.length} links`}</span>
    </div>
  )

  return (
    <AppShell
      active="home"
      title="Henning’s saved links"
      subtitle="Clear, fast, and visible first."
      right={right}
    >
      {allTags.length > 0 && (
        <div className="ig-chip-row">
          <button
            className={`ig-chip ${activeTag === null ? 'ig-chip-active' : ''}`}
            onClick={() => setActiveTag(null)}
          >
            All
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              className={`ig-chip ${activeTag === tag ? 'ig-chip-active' : ''}`}
              onClick={() => setActiveTag(activeTag === tag ? null : tag)}
            >
              #{tag}
            </button>
          ))}
        </div>
      )}

      <p style={{ color: 'red', fontSize: '1.2rem', padding: '1rem', background: 'yellow' }}>
        DEBUG: {filtered.length} links, {initialLinks.length} total
      </p>

      {filtered.length > 0 ? (
        <div className="simple-card-grid">
          {filtered.map((link, i) => (
            <LinkCard key={`${link.url}-${i}`} link={link} index={i} />
          ))}
        </div>
      ) : (
        <p className="empty-state">No links match that search.</p>
      )}
    </AppShell>
  )
}
