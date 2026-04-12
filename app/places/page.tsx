'use client'

import type { CSSProperties } from 'react'
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
        <div className="ig-feed-grid">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="ig-post ig-post-skeleton">
              <div className="skeleton-line skeleton-line-title" style={{ width: '40%', margin: '1rem' }} />
              <div className="ig-skeleton-media" />
              <div style={{ padding: '1rem' }}>
                <div className="skeleton-line skeleton-line-title" style={{ width: '72%' }} />
                <div className="skeleton-line skeleton-line-notes" style={{ marginTop: '0.75rem' }} />
                <div className="skeleton-line skeleton-line-notes2" style={{ marginTop: '0.5rem' }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {loaded && places.length > 0 && (
        <div className="ig-feed-grid">
          {places.map((place, index) => (
            <article
              key={place.id}
              className="ig-post ig-place-post"
              style={{ '--card-index': Math.min(index, 12) } as CSSProperties}
            >
              <div className="ig-post-header">
                <div className="ig-post-user">
                  <div className="ig-avatar-ring ig-place-avatar-ring">
                    <span className="ig-place-emoji" aria-hidden="true">📍</span>
                  </div>
                  <div className="ig-user-meta">
                    <span className="ig-username">{place.name}</span>
                    <span className="ig-location">{place.category}</span>
                  </div>
                </div>
                <button
                  type="button"
                  className="place-remove"
                  onClick={() => removePlace(place.id)}
                  aria-label={`Remove ${place.name}`}
                >
                  ✕
                </button>
              </div>

              <div className="ig-media-frame ig-place-media">
                {(() => {
                  const src = placePhotoSrc(place)
                  return src ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={src}
                      alt={place.name}
                      className="ig-media"
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

              <div className="ig-actions">
                <div className="ig-actions-left">
                  <button
                    type="button"
                    className={`visited-toggle ${place.visited ? 'visited-toggle-active' : ''}`}
                    onClick={() => toggleVisited(place)}
                    aria-pressed={place.visited}
                    aria-label={place.visited ? `Mark ${place.name} as not visited` : `Mark ${place.name} as visited`}
                  >
                    {place.visited ? '✓ Visited' : '○ Want to go'}
                  </button>
                </div>
                <a
                  href={place.maps_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="maps-link"
                >
                  Maps ↗
                </a>
              </div>

              <div className="ig-body">
                <div className="ig-likes">Saved place</div>
                <h2 className="ig-title">{place.name}</h2>
                <p className="ig-caption">
                  <span className="ig-caption-author">address</span>{' '}
                  {place.address}
                </p>
                {place.note && (
                  <p className="ig-caption">
                    <span className="ig-caption-author">note</span>{' '}
                    {place.note}
                  </p>
                )}
                {place.description && <p className="ig-caption">{place.description}</p>}
                {place.what_to_order && (
                  <p className="ig-relevance">🍽️ What to order: {place.what_to_order}</p>
                )}
                {place.tags.length > 0 && (
                  <div className="ig-tags">
                    {place.tags.map((tag) => (
                      <span key={tag} className="ig-tag">#{tag}</span>
                    ))}
                  </div>
                )}
                <div className="ig-meta-row">
                  <span>Added {formatDate(place.date_added)}</span>
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
