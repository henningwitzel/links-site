'use client'

import { useEffect, useState } from 'react'
import type { Place } from '@/lib/types'
import { AppShell } from '../ui'

function placePhotoSrc(place: Place): string | null {
  if (place.photo_url) return place.photo_url
  if (place.google_place_id) {
    return `/api/places/photo?place_id=${encodeURIComponent(place.google_place_id)}`
  }
  return null
}

function formatDate(iso: string) {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!m) return iso
  return `${m[3]}.${m[2]}.${m[1]}`
}

export default function PlacesPage() {
  const [places, setPlaces] = useState<Place[]>([])
  const [loaded, setLoaded] = useState(false)

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
    <AppShell
      active="places"
      title="Saved places"
      subtitle="Restaurants, cafés, and spots worth trying, polished into the same system."
    >
      {!loaded && (
        <div className="simple-card-grid">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="simple-card">
              <div className="simple-card-top">
                <div className="simple-card-site">
                  <div className="skeleton-line" style={{ width: '20px', height: '20px', borderRadius: '999px' }} />
                  <div className="skeleton-line skeleton-line-title" style={{ width: '88px', height: '12px' }} />
                </div>
                <div className="skeleton-line skeleton-line-title" style={{ width: '64px', height: '12px' }} />
              </div>
              <div className="ig-skeleton-media place-card-media-skeleton" />
              <div className="place-card-stack">
                <div className="skeleton-line skeleton-line-title" style={{ width: '72%' }} />
                <div className="skeleton-line skeleton-line-notes" />
                <div className="skeleton-line skeleton-line-notes2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {loaded && places.length > 0 && (
        <div className="simple-card-grid">
          {places.map((place) => (
            <article key={place.id} className="simple-card place-card">
              <div className="simple-card-top">
                <div className="simple-card-site">
                  <span className="place-card-dot" aria-hidden="true">📍</span>
                  <span className="simple-card-domain">{place.category}</span>
                </div>
                <span className="simple-card-date">{formatDate(place.date_added)}</span>
              </div>

              <div className="card-media place-card-media">
                {(() => {
                  const src = placePhotoSrc(place)
                  return src ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={src}
                      alt={place.name}
                      className="card-media-img"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).parentElement!.classList.add('place-preview-failed')
                      }}
                    />
                  ) : (
                    <div className="place-preview-placeholder" aria-hidden="true">
                      <span className="place-preview-emoji">🗺️</span>
                    </div>
                  )
                })()}
              </div>

              <h2 className="simple-card-title">{place.name}</h2>
              <p className="simple-card-text"><strong>address</strong> {place.address}</p>
              {place.note && <p className="simple-card-text"><strong>note</strong> {place.note}</p>}
              {place.description && <p className="simple-card-text">{place.description}</p>}
              {place.what_to_order && <p className="simple-card-callout">🍽️ What to order: {place.what_to_order}</p>}

              {place.tags.length > 0 && (
                <div className="simple-card-tags">
                  {place.tags.map((tag) => (
                    <span key={tag} className="simple-card-tag">#{tag}</span>
                  ))}
                </div>
              )}

              <div className="place-card-actions">
                <button
                  type="button"
                  className={`visited-toggle ${place.visited ? 'visited-toggle-active' : ''}`}
                  onClick={() => toggleVisited(place)}
                  aria-pressed={place.visited}
                  aria-label={place.visited ? `Mark ${place.name} as not visited` : `Mark ${place.name} as visited`}
                >
                  {place.visited ? '✓ Visited' : '○ Want to go'}
                </button>

                <div className="place-card-actions-right">
                  <a
                    href={place.maps_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="maps-link"
                  >
                    Maps ↗
                  </a>
                  <button
                    type="button"
                    className="place-remove"
                    onClick={() => removePlace(place.id)}
                    aria-label={`Remove ${place.name}`}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {loaded && places.length === 0 && (
        <p className="empty-state">No places saved yet.</p>
      )}
    </AppShell>
  )
}
