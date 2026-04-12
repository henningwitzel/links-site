'use client'

import { useState } from 'react'

interface YouTubeCardProps {
  link: {
    date: string
    title: string
    url: string
    notes: string
    relevance?: string
    tags?: string[]
    domain: string
  }
  lastAccess?: number
  onClickLink: (url: string) => void
  index?: number
}

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('de-DE', { year: 'numeric', month: '2-digit', day: '2-digit' })
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
  return formatDate(new Date(ts).toISOString().split('T')[0])
}

export default function YouTubeCard({ link, lastAccess, onClickLink, index = 0 }: YouTubeCardProps) {
  const [showModal, setShowModal] = useState(false)
  const videoId = extractYouTubeId(link.url)

  if (!videoId) return null

  return (
    <>
      <article
        className="ig-post ig-post-video"
        style={{ '--card-index': Math.min(index || 0, 12) } as React.CSSProperties}
      >
        <div className="ig-post-header">
          <div className="ig-post-user">
            <div className="ig-avatar-ring">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://www.google.com/s2/favicons?sz=64&domain=${link.domain}`}
                width={32}
                height={32}
                className="ig-avatar"
                alt=""
                onError={(e) => ((e.currentTarget as HTMLImageElement).style.visibility = 'hidden')}
              />
            </div>
            <div className="ig-user-meta">
              <span className="ig-username">{link.domain.replace(/^www\./, '')}</span>
              <span className="ig-location">video save</span>
            </div>
          </div>
          <span className="ig-menu" aria-hidden="true">•••</span>
        </div>

        <button
          type="button"
          className="youtube-thumbnail ig-media-button"
          onClick={() => {
            setShowModal(true)
            onClickLink(link.url)
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`}
            alt={link.title}
            className="youtube-thumb-img ig-media"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
            }}
          />
          <div className="youtube-play-button">
            <svg viewBox="0 0 24 24" fill="white" className="play-icon">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </button>

        <div className="ig-actions">
          <div className="ig-actions-left" aria-hidden="true">
            <span className="ig-icon">♡</span>
            <span className="ig-icon">💬</span>
            <span className="ig-icon">↗</span>
          </div>
          <span className="ig-icon" aria-hidden="true">⌁</span>
        </div>

        <div className="ig-body">
          <div className="ig-likes">Saved video</div>
          <h2 className="ig-title">{link.title}</h2>
          {link.notes && (
            <p className="ig-caption">
              <span className="ig-caption-author">henning</span>{' '}
              {link.notes}
            </p>
          )}
          {link.relevance && (
            <p className="ig-relevance">💡 {link.relevance}</p>
          )}
          {link.tags && link.tags.length > 0 && (
            <div className="ig-tags">
              {link.tags.map((tag) => (
                <button key={tag} type="button" className="ig-tag">#{tag}</button>
              ))}
            </div>
          )}
          <div className="ig-meta-row">
            <span>{formatDate(link.date)}</span>
            {lastAccess && <span>{formatAccessed(lastAccess)}</span>}
          </div>
        </div>
      </article>

      {showModal && (
        <div className="youtube-modal" onClick={() => setShowModal(false)}>
          <div className="youtube-modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="youtube-modal-close"
              onClick={() => setShowModal(false)}
              aria-label="Close video"
            >
              ✕
            </button>
            <div className="youtube-player-wrapper">
              <iframe
                className="youtube-player"
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                title={link.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
