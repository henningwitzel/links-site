import { NextRequest, NextResponse } from 'next/server'
import Redis from 'ioredis'

const redis = new Redis(process.env.REDIS_URL!)
const CACHE_PREFIX = 'og-preview:'
const CACHE_TTL = 60 * 60 * 24 * 7 // 7 days

interface Preview {
  title?: string
  description?: string
  image?: string
  siteName?: string
}

function extractMeta(html: string): Preview {
  const get = (prop: string): string | undefined => {
    const patterns = [
      new RegExp(`<meta[^>]+property=["']og:${prop}["'][^>]+content=["']([^"']+)["']`, 'i'),
      new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:${prop}["']`, 'i'),
      new RegExp(`<meta[^>]+name=["']${prop}["'][^>]+content=["']([^"']+)["']`, 'i'),
      new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${prop}["']`, 'i'),
    ]
    for (const re of patterns) {
      const m = html.match(re)
      if (m?.[1]) return m[1].trim()
    }
  }

  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)

  return {
    title: get('title') || titleMatch?.[1]?.trim(),
    description: get('description') || get('description'),
    image: get('image'),
    siteName: get('site_name'),
  }
}

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url')
  if (!url) return NextResponse.json({ error: 'Missing url' }, { status: 400 })

  // Check cache
  const cacheKey = CACHE_PREFIX + url
  const cached = await redis.get(cacheKey)
  if (cached) {
    return NextResponse.json(JSON.parse(cached), {
      headers: { 'Cache-Control': 'public, max-age=3600' }
    })
  }

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LinkPreview/1.0)',
        'Accept': 'text/html',
      },
      signal: AbortSignal.timeout(5000),
    })

    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const html = await res.text()
    const preview = extractMeta(html)

    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(preview))

    return NextResponse.json(preview, {
      headers: { 'Cache-Control': 'public, max-age=3600' }
    })
  } catch (err) {
    const empty: Preview = {}
    return NextResponse.json(empty)
  }
}
