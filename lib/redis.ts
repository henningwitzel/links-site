import type Redis from 'ioredis'

let client: Redis | null = null

export async function getRedis(): Promise<Redis | null> {
  if (client) return client
  if (!process.env.REDIS_URL) return null
  const { default: IORedis } = await import('ioredis')
  client = new IORedis(process.env.REDIS_URL)
  return client
}
