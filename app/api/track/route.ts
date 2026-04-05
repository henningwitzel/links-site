import { NextRequest, NextResponse } from 'next/server'

let redis: import('ioredis').default | null = null

async function getRedis() {
  if (redis) return redis
  if (!process.env.REDIS_URL) return null
  const { default: Redis } = await import('ioredis')
  redis = new Redis(process.env.REDIS_URL)
  return redis
}

// POST /api/track — record a click
export async function POST(req: NextRequest) {
  const { url } = await req.json()
  if (!url) return NextResponse.json({ error: 'Missing url' }, { status: 400 })
  const client = await getRedis()
  if (!client) {
    return NextResponse.json({ ok: true })
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
  // Convert string timestamps to numbers
  const result: Record<string, number> = {}
  for (const [k, v] of Object.entries(data || {})) {
    result[k] = parseInt(v)
  }
  return NextResponse.json(result)
}
