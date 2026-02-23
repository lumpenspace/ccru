import { BlobNotFoundError, head, put } from '@vercel/blob'
import { createHash } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'

import { canonicalizeShareParams } from '@/app/lib/shareParams'

export const runtime = 'nodejs'

function signatureForParams(sortedParamKeys: string[], sortedValues: string[]): string {
  const material = `params:${sortedParamKeys.join('|')}::values:${sortedValues.join('|')}`
  return createHash('sha256').update(material).digest('hex')
}

async function renderPreview(origin: string, canonicalQuery: string): Promise<Buffer> {
  const url = `${origin}/api/share-preview?${canonicalQuery}`
  const response = await fetch(url, { cache: 'no-store' })
  if (!response.ok) {
    throw new Error(`Failed to render preview image (${response.status}).`)
  }
  return Buffer.from(await response.arrayBuffer())
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({} as Record<string, unknown>))
    const rawParams =
      typeof body?.params === 'object' && body?.params !== null
        ? (body.params as Record<string, unknown>)
        : (body as Record<string, unknown>)

    const canonical = canonicalizeShareParams(rawParams)
    const signature = signatureForParams(canonical.sortedParamKeys, canonical.sortedValues)
    const pathname = `numogram/share/${signature}.png`

    // Must verify this image does not already exist before any generation/upload.
    try {
      const existing = await head(pathname)
      return NextResponse.json({
        imageUrl: existing.url,
        signature,
        reused: true,
        canonicalQuery: canonical.canonicalQuery,
      })
    } catch (error) {
      if (!(error instanceof BlobNotFoundError)) {
        throw error
      }
    }

    const png = await renderPreview(req.nextUrl.origin, canonical.canonicalQuery)

    try {
      const uploaded = await put(pathname, png, {
        access: 'public',
        contentType: 'image/png',
        addRandomSuffix: false,
        allowOverwrite: false,
      })
      return NextResponse.json({
        imageUrl: uploaded.url,
        signature,
        reused: false,
        canonicalQuery: canonical.canonicalQuery,
      })
    } catch {
      // Handle race conditions where another request wrote this pathname first.
      const existing = await head(pathname)
      return NextResponse.json({
        imageUrl: existing.url,
        signature,
        reused: true,
        canonicalQuery: canonical.canonicalQuery,
      })
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create share image.'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
