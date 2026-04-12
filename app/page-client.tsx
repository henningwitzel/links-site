'use client'

import { useState } from 'react'

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

export default function HomeClient({ initialLinks }: { initialLinks: LinkItem[] }) {
  const [query, setQuery] = useState('')

  const filtered = initialLinks.filter((l) => {
    if (!query) return true
    const q = query.toLowerCase()
    return l.title.toLowerCase().includes(q) || l.notes.toLowerCase().includes(q)
  })

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '24px 16px' }}>
      <h1 style={{ fontSize: '1.8rem', margin: '0 0 4px' }}>Henning&apos;s saved links</h1>
      <p style={{ color: '#888', margin: '0 0 16px' }}>{filtered.length} links</p>

      <input
        type="text"
        placeholder="Search..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{
          width: '100%',
          padding: '12px 16px',
          fontSize: '1rem',
          border: '1px solid #ddd',
          borderRadius: '8px',
          marginBottom: '20px',
          boxSizing: 'border-box',
        }}
      />

      {filtered.map((link, i) => (
        <div key={`${link.url}-${i}`} style={{
          border: '1px solid #ddd',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '12px',
          background: '#fff',
        }}>
          <a href={link.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: '#111' }}>
            <strong style={{ fontSize: '1rem', display: 'block', marginBottom: '6px' }}>{link.title}</strong>
          </a>
          {link.notes && <p style={{ margin: '0 0 6px', color: '#555', fontSize: '0.85rem', lineHeight: '1.5' }}>{link.notes}</p>}
          <span style={{ fontSize: '0.75rem', color: '#aaa' }}>{link.domain} · {link.date}</span>
        </div>
      ))}
    </div>
  )
}
