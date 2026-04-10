import { promises as fs } from 'fs'
import path from 'path'
import type { Place } from './types'
import { getRedis } from './redis'

const KEY = 'places:list'
const FILE_PATH = path.join(process.cwd(), 'data', 'places.json')

async function readFromFile(): Promise<Place[]> {
  try {
    const raw = await fs.readFile(FILE_PATH, 'utf8')
    return JSON.parse(raw) as Place[]
  } catch (err) {
    if ((err as NodeJS.ErrnoException)?.code === 'ENOENT') return []
    throw err
  }
}

async function writeToFile(places: Place[]): Promise<void> {
  await fs.writeFile(FILE_PATH, JSON.stringify(places, null, 2) + '\n', 'utf8')
}

export async function readPlaces(): Promise<Place[]> {
  const redis = await getRedis()
  if (!redis) return readFromFile()

  const raw = await redis.get(KEY)
  if (raw) return JSON.parse(raw) as Place[]

  // First boot on a Redis-backed environment: seed from the bundled JSON.
  const seed = await readFromFile()
  if (seed.length > 0) await redis.set(KEY, JSON.stringify(seed))
  return seed
}

export async function writePlaces(places: Place[]): Promise<void> {
  const redis = await getRedis()
  if (!redis) {
    await writeToFile(places)
    return
  }
  await redis.set(KEY, JSON.stringify(places))
}
