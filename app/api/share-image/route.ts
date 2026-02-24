import { BlobNotFoundError, head, put } from '@vercel/blob'
import { createHash } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'

import { canonicalizeShareParams } from '@/app/lib/shareParams'

export const runtime = 'nodejs'
const MAX_SHARE_IMAGE_BYTES = 6 * 1024 * 1024

function signatureForParams(sortedParamKeys: string[], sortedValues: string[]): string {
  const material = `params:${sortedParamKeys.join('|')}::values:${sortedValues.join('|')}`
  return createHash('sha256').update(material).digest('hex')
}

function decodePngDataUrl(input: string): Buffer {
  const match = /^data:image\/png;base64,([A-Za-z0-9+/=]+)$/.exec(input.trim())
  if (!match) {
    throw new Error('Invalid share image payload. Expected PNG data URL.')
  }
  const png = Buffer.from(match[1], 'base64')
  if (png.length === 0) {
    throw new Error('Share image payload is empty.')
  }
  if (png.length > MAX_SHARE_IMAGE_BYTES) {
    throw new Error('Share image payload exceeds size limit.')
  }
  return png
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
    const suppliedDataUrl = typeof body?.dataUrl === 'string' ? body.dataUrl : null

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

    if (!suppliedDataUrl) {
      return NextResponse.json({
        missing: true,
        signature,
        canonicalQuery: canonical.canonicalQuery,
      })
    }

    const png = decodePngDataUrl(suppliedDataUrl)

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
