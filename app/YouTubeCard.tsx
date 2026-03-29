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
  return date.toLocaleDateString('de-DE', { year: 'numeric', month: 'long', day: 'numeric' })
}

export default function YouTubeCard({ link, lastAccess, onClickLink, index = 0 }: YouTubeCardProps) {
  const [showModal, setShowModal] = useState(false)
  const videoId = extractYouTubeId(link.url)
  
  if (!videoId) return null

  return (
    <>
      {/* Card */}
      <div
        className="link-card youtube-card"
        style={{ '--card-index': Math.min(index || 0, 12) } as React.CSSProperties}
        onClick={() => {
          setShowModal(true)
          onClickLink(link.url)
        }}
      >
        {/* YouTube thumbnail with play button overlay */}
        <div className="youtube-thumbnail">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`}
            alt={link.title}
            className="youtube-thumb-img"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
            }}
          />
          <div className="youtube-play-button">
            <svg viewBox="0 0 24 24" fill="white" className="play-icon">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>

        {/* Top: favicon + title */}
        <div className="card-top">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://www.google.com/s2/favicons?sz=32&domain=${link.domain}`}
            width={20}
            height={20}
            className="card-favicon"
            alt=""
            onError={(e) => ((e.currentTarget as HTMLImageElement).style.visibility = 'hidden')}
          />
          <span className="card-title">{link.title}</span>
        </div>

        {/* Body: notes + relevance + url */}
        <div className="card-body">
          {link.notes && (
            <p className="card-notes">{link.notes}</p>
          )}
          {link.relevance && (
            <p className="card-relevance">💡 {link.relevance}</p>
          )}
          <span className="card-url">
            youtube.com
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
            <span className="meta-accessed" title="Last accessed">
              Accessed {formatDate(new Date(lastAccess).toISOString().split('T')[0])}
            </span>
          )}
        </div>
      </div>

      {/* Modal */}
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
