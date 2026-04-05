'use client'

import type { CSSProperties } from 'react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

interface Place {
  id: string
  name: string
  address: string
  category: string
  maps_url: string
  note: string
  tags: string[]
  date_added: string
  visited: boolean
}

function formatDate(iso: string) {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!m) return iso
  return `${m[3]}.${m[2]}.${m[1]}`
}

export default function PlacesPage() {
  const [places, setPlaces] = useState<Place[]>([])
  const [loaded, setLoaded] = useState(false)
  const [dark, setDark] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('theme')
    if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setDark(true)
      document.documentElement.setAttribute('data-theme', 'dark')
    }
  }, [])

  function toggleTheme() {
    const next = !dark
    setDark(next)
    document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light')
    localStorage.setItem('theme', next ? 'dark' : 'light')
  }

  useEffect(() => {
    fetch('/api/places')
      .then((r) => r.json())
      .then((data) => {
        setPlaces(Array.isArray(data) ? data : [])
        setLoaded(true)
      })
      .catch(() => setLoaded(true))
  }, [])

  async function removePlace(id: string) {
    const res = await fetch(`/api/places/${encodeURIComponent(id)}`, { method: 'DELETE' })
    if (!res.ok) return
    setPlaces((prev) => prev.filter((place) => place.id !== id))
  }

  async function toggleVisited(place: Place) {
    const nextVisited = !place.visited
    setPlaces((prev) => prev.map((item) => item.id === place.id ? { ...item, visited: nextVisited } : item))

    const res = await fetch(`/api/places/${encodeURIComponent(place.id)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visited: nextVisited }),
    })

    if (!res.ok) {
      setPlaces((prev) => prev.map((item) => item.id === place.id ? { ...item, visited: place.visited } : item))
    }
  }

  return (
    <main className="page-wrap">
      <header className="page-header">
        <div className="header-row">
          <div>
            <h1 className="page-title font-serif">Places to Try</h1>
            <p className="header-sub">Saved spots worth visiting</p>
          </div>
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
          >
            {dark ? '☀️' : '🌙'}
          </button>
        </div>

        <nav className="section-nav" aria-label="Sections">
          <Link href="/" className="section-nav-link">Links</Link>
          <Link href="/places" className="section-nav-link section-nav-link-active">Places</Link>
        </nav>
      </header>

      {!loaded && (
        <div className="skeleton-grid">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton-card">
              <div className="skeleton-line skeleton-line-title" />
              <div className="skeleton-line skeleton-line-notes" />
              <div className="skeleton-line skeleton-line-notes2" />
              <div className="skeleton-line skeleton-line-url" />
            </div>
          ))}
        </div>
      )}

      {loaded && places.length > 0 && (
        <div className="card-grid">
          {places.map((place, index) => (
            <article
              key={place.id}
              className="link-card place-card"
              style={{ '--card-index': Math.min(index, 12) } as CSSProperties}
            >
              <button
                type="button"
                className="place-remove"
                onClick={() => removePlace(place.id)}
                aria-label={`Remove ${place.name}`}
              >
                ✕
              </button>

              <div className="card-top place-card-top">
                <div className="place-card-heading">
                  <span className="card-title">{place.name}</span>
                  <span className="place-category">{place.category}</span>
                </div>
                <button
                  type="button"
                  className={`visited-toggle ${place.visited ? 'visited-toggle-active' : ''}`}
                  onClick={() => toggleVisited(place)}
                  aria-pressed={place.visited}
                  aria-label={place.visited ? `Mark ${place.name} as not visited` : `Mark ${place.name} as visited`}
                >
                  ✓
                </button>
              </div>

              <div className="card-body">
                <p className="card-notes">{place.address}</p>
                {place.note && <p className="card-notes">{place.note}</p>}
              </div>

              {place.tags.length > 0 && (
                <div className="card-tags">
                  {place.tags.map((tag) => (
                    <span key={tag} className="card-tag">{tag}</span>
                  ))}
                </div>
              )}

              <div className="card-footer">
                <span className="meta-date">Added {formatDate(place.date_added)}</span>
                <a
                  href={place.maps_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="maps-link"
                >
                  Maps ↗
                </a>
              </div>
            </article>
          ))}
        </div>
      )}

      {loaded && places.length === 0 && (
        <p className="empty-state">No places saved yet.</p>
      )}
    </main>
  )
}
