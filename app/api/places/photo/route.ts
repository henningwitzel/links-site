import { NextRequest, NextResponse } from 'next/server'

// Proxies Google Places photos so the API key never reaches the client.
export async function GET(req: NextRequest) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY
  const placeId = req.nextUrl.searchParams.get('place_id')

  if (!apiKey || !placeId) {
    return new NextResponse(null, { status: 404 })
  }

  try {
    const detailsRes = await fetch(
      `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}?fields=photos`,
      {
        headers: {
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': 'photos',
        },
        cache: 'no-store',
      },
    )

    if (!detailsRes.ok) {
      return new NextResponse(null, { status: 404 })
    }

    const data = (await detailsRes.json()) as { photos?: Array<{ name?: string }> }
    const photoName = data.photos?.[0]?.name

    if (!photoName) {
      return new NextResponse(null, { status: 404 })
    }

    // Key stays server-side; fetch follows the 302 to the actual image bytes.
    const mediaUrl = `https://places.googleapis.com/v1/${photoName}/media?maxHeightPx=600&key=${encodeURIComponent(apiKey)}`
    const photoRes = await fetch(mediaUrl, { cache: 'no-store' })

    if (!photoRes.ok || !photoRes.body) {
      return new NextResponse(null, { status: 404 })
    }

    return new NextResponse(photoRes.body, {
      status: 200,
      headers: {
        'Content-Type': photoRes.headers.get('content-type') ?? 'image/jpeg',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
      },
    })
  } catch {
    return new NextResponse(null, { status: 404 })
  }
}
