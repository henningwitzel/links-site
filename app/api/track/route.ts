import { NextRequest, NextResponse } from 'next/server'
import Redis from 'ioredis'

const redis = new Redis(process.env.REDIS_URL!)

// POST /api/track — record a click
export async function POST(req: NextRequest) {
  const { url } = await req.json()
  if (!url) return NextResponse.json({ error: 'Missing url' }, { status: 400 })
  await redis.hset('link-access', url, Date.now().toString())
  return NextResponse.json({ ok: true })
}

// GET /api/track — return all access timestamps
export async function GET() {
  const data = await redis.hgetall('link-access')
  // Convert string timestamps to numbers
  const result: Record<string, number> = {}
  for (const [k, v] of Object.entries(data || {})) {
    result[k] = parseInt(v)
  }
  return NextResponse.json(result)
}
