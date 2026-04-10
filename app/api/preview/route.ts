import { NextRequest, NextResponse } from 'next/server'
import { getRedis } from '@/lib/redis'
import { isAllowedLinkUrl } from '@/lib/allowed-links'
import type { Preview } from '@/lib/types'

const CACHE_PREFIX = 'og-preview:'
const CACHE_TTL = 60 * 60 * 24 * 7 // 7 days
const MAX_BYTES = 512 * 1024

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
    description: get('description'),
    image: get('image'),
    siteName: get('site_name'),
  }
}

async function readCapped(res: Response, maxBytes: number): Promise<string> {
  const reader = res.body?.getReader()
  if (!reader) return ''
  const chunks: Uint8Array[] = []
  let total = 0
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    total += value.byteLength
    if (total > maxBytes) {
      await reader.cancel()
      break
    }
    chunks.push(value)
  }
  return new TextDecoder('utf-8').decode(Buffer.concat(chunks))
}

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url')
  if (!url) return NextResponse.json({ error: 'Missing url' }, { status: 400 })

  // Only fetch URLs we know about — this prevents the route from being
  // used as a generic SSRF proxy against internal hosts.
  if (!isAllowedLinkUrl(url)) {
    return NextResponse.json({ error: 'URL not allowed' }, { status: 403 })
  }

  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return NextResponse.json({ error: 'Invalid url' }, { status: 400 })
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return NextResponse.json({ error: 'Invalid protocol' }, { status: 400 })
  }

  const client = await getRedis()
  const cacheKey = CACHE_PREFIX + url
  const cached = client ? await client.get(cacheKey) : null
  if (cached) {
    return NextResponse.json(JSON.parse(cached), {
      headers: { 'Cache-Control': 'public, max-age=3600' },
    })
  }

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LinkPreview/1.0)',
        Accept: 'text/html',
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(5000),
    })

    if (!res.ok) throw new Error(`HTTP ${res.status}`)

    const contentType = res.headers.get('content-type') ?? ''
    if (!contentType.includes('text/html') && !contentType.includes('application/xhtml')) {
      return NextResponse.json({} satisfies Preview)
    }

    const html = await readCapped(res, MAX_BYTES)
    const preview = extractMeta(html)

    if (client) {
      await client.setex(cacheKey, CACHE_TTL, JSON.stringify(preview))
    }

    return NextResponse.json(preview, {
      headers: { 'Cache-Control': 'public, max-age=3600' },
    })
  } catch {
    return NextResponse.json({} satisfies Preview)
  }
}
