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

function LinkCard({ link }: { link: LinkItem }) {
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #ddd',
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '12px',
    }}>
      <a href={link.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: '#000' }}>
        <h3 style={{ margin: '0 0 8px', fontSize: '1.05rem', fontWeight: 700 }}>{link.title}</h3>
      </a>
      {link.notes && <p style={{ margin: '0 0 8px', color: '#666', fontSize: '0.9rem', lineHeight: 1.5 }}>{link.notes}</p>}
      <span style={{ fontSize: '0.75rem', color: '#999' }}>{link.domain}</span>
    </div>
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
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          {filtered.map((link, i) => (
            <LinkCard key={`${link.url}-${i}`} link={link} />
          ))}
        </div>
      ) : (
        <p className="empty-state">No links match that search.</p>
      )}
    </AppShell>
  )
}
