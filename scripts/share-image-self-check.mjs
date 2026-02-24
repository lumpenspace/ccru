#!/usr/bin/env node
import assert from 'node:assert/strict'

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'
const HAS_BLOB_TOKEN = Boolean(process.env.BLOB_READ_WRITE_TOKEN)

// 1x1 transparent PNG.
const TEST_PNG_DATA_URL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAukB9p7h8i8AAAAASUVORK5CYII='

function randomSelected() {
  const values = Array.from({ length: 10 }, (_, i) => i)
  for (let i = values.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[values[i], values[j]] = [values[j], values[i]]
  }
  return values.slice(0, 3).sort((a, b) => a - b).join(',')
}

async function postShareImage(payload) {
  const res = await fetch(`${BASE_URL}/api/share-image`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const json = await res.json().catch(() => ({}))
  return { ok: res.ok, status: res.status, json }
}

async function ensureImageForParams(params) {
  const first = await postShareImage({ params })
  assert.equal(first.ok, true, `First check failed (${first.status}): ${JSON.stringify(first.json)}`)

  if (typeof first.json.imageUrl === 'string' && first.json.imageUrl.length > 0) {
    return { skippedUpload: false, data: first.json }
  }

  assert.equal(first.json.missing, true, `Expected missing=true before upload, got: ${JSON.stringify(first.json)}`)
  if (!HAS_BLOB_TOKEN) {
    return { skippedUpload: true, data: first.json }
  }

  const uploaded = await postShareImage({ params, dataUrl: TEST_PNG_DATA_URL })
  assert.equal(uploaded.ok, true, `Upload failed (${uploaded.status}): ${JSON.stringify(uploaded.json)}`)
  assert.equal(typeof uploaded.json.imageUrl, 'string', `Upload did not return imageUrl: ${JSON.stringify(uploaded.json)}`)
  return { skippedUpload: false, data: uploaded.json }
}

async function assertReuse(params) {
  const a = await ensureImageForParams(params)
  if (a.skippedUpload) {
    return { skippedUpload: true }
  }
  const b = await postShareImage({ params })
  assert.equal(b.ok, true, `Reuse check failed (${b.status}): ${JSON.stringify(b.json)}`)
  assert.equal(typeof b.json.imageUrl, 'string', `Missing imageUrl on reuse response: ${JSON.stringify(b.json)}`)
  assert.equal(b.json.imageUrl, a.data.imageUrl, 'Expected same image URL for identical params')
  assert.equal(b.json.reused, true, `Expected reused=true, got: ${JSON.stringify(b.json)}`)
  assert.equal(b.json.canonicalQuery, a.data.canonicalQuery, 'Canonical query should remain stable')
  return { skippedUpload: false }
}

async function main() {
  console.log(`[share-self-check] Base URL: ${BASE_URL}`)
  if (!HAS_BLOB_TOKEN) {
    console.log('[share-self-check] BLOB_READ_WRITE_TOKEN not set; skipping share-image API checks.')
    return
  }

  const a = await assertReuse({
    layout: 'labyrinth',
    selected: randomSelected(),
    layers: 'currents,gates,syzygies',
    particles: '1',
  })
  console.log(a.skippedUpload
    ? '[share-self-check] Pre-check passed for selected-zones payload (upload skipped).'
    : '[share-self-check] Dedupe check passed for selected-zones payload.')

  const b = await assertReuse({
    layout: 'labyrinth',
    region: 'warp',
    layers: 'currents,gates',
  })
  console.log(b.skippedUpload
    ? '[share-self-check] Pre-check passed for region-only payload (upload skipped).'
    : '[share-self-check] Dedupe check passed for region-only payload.')

  const c = await assertReuse({
    layout: 'planetary',
    date: '2026-02-24',
    orbits: '0',
  })
  console.log(c.skippedUpload
    ? '[share-self-check] Pre-check passed for no-selection full-view payload (upload skipped).'
    : '[share-self-check] Dedupe check passed for no-selection full-view payload.')

  console.log('[share-self-check] All checks passed.')
}

main().catch(err => {
  console.error('[share-self-check] FAILED')
  console.error(err?.stack || err)
  process.exit(1)
})
