import { NextResponse } from 'next/server'
import links from '../../../data/links.json'

export async function GET() {
  return NextResponse.json(links)
}
