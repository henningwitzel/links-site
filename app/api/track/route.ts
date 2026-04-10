import { NextRequest, NextResponse } from 'next/server'
import { getRedis } from '@/lib/redis'
import { isAllowedLinkUrl } from '@/lib/allowed-links'

const RATE_LIMIT_WINDOW_SECONDS = 60
const RATE_LIMIT_MAX = 30

function clientIp(req: NextRequest): string {
  const fwd = req.headers.get('x-forwarded-for')
  if (fwd) return fwd.split(',')[0]!.trim()
  return req.headers.get('x-real-ip') ?? 'unknown'
}

// POST /api/track — record a click
export async function POST(req: NextRequest) {
  const { url } = await req.json().catch(() => ({ url: null }))
  if (typeof url !== 'string' || !url) {
    return NextResponse.json({ error: 'Missing url' }, { status: 400 })
  }

  // Only URLs we ship in the bundle are trackable — stops the endpoint from
  // being used as an open Redis-write oracle.
  if (!isAllowedLinkUrl(url)) {
    return NextResponse.json({ error: 'URL not allowed' }, { status: 403 })
  }

  const client = await getRedis()
  if (!client) {
    return NextResponse.json({ ok: true })
  }

  // Per-IP fixed-window rate limit. Cheap enough to be worth doing.
  const ip = clientIp(req)
  const rlKey = `rl:track:${ip}`
  const count = await client.incr(rlKey)
  if (count === 1) {
    await client.expire(rlKey, RATE_LIMIT_WINDOW_SECONDS)
  }
  if (count > RATE_LIMIT_MAX) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  await client.hset('link-access', url, Date.now().toString())
  return NextResponse.json({ ok: true })
}

// GET /api/track — return all access timestamps
export async function GET() {
  const client = await getRedis()
  if (!client) {
    return NextResponse.json({})
  }

  const data = await client.hgetall('link-access')
  const result: Record<string, number> = {}
  for (const [k, v] of Object.entries(data || {})) {
    result[k] = parseInt(v)
  }
  return NextResponse.json(result)
}
