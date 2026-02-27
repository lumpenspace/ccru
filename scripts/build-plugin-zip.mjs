#!/usr/bin/env node

/**
 * Compiles the gematria plugin TypeScript and packages the extension
 * into a zip ready for Chrome side-loading.
 */

import { execSync } from 'child_process'
import { mkdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const PLUGIN_DIR = resolve(ROOT, 'gematria/plugin')
const OUT_DIR = resolve(ROOT, 'public/downloads')
const ZIP_NAME = 'ccru-gematria-plugin.zip'

// 1. Compile TypeScript
console.log('[plugin-zip] Compiling TypeScript…')
execSync('npx tsc --project gematria/plugin/tsconfig.json', {
  cwd: ROOT,
  stdio: 'inherit',
})

// 2. Ensure output directory exists
mkdirSync(OUT_DIR, { recursive: true })

// 3. Create zip preserving directory structure — only runtime files
console.log('[plugin-zip] Creating zip…')
const includes = [
  'manifest.json',
  'dist/src/background.js',
  'dist/src/ciphers.js',
  'dist/src/gematria.js',
  'dist/src/cyber-ui.js',
  'dist/src/content.js',
  'dist/popup/popup.js',
  'popup/popup.html',
  'popup/popup.css',
  'src/cyber-ui.css',
]

execSync(
  `zip -r9 "${OUT_DIR}/${ZIP_NAME}" ${includes.map(f => `"${f}"`).join(' ')}`,
  { cwd: PLUGIN_DIR, stdio: 'inherit' },
)

console.log(`[plugin-zip] Done → public/downloads/${ZIP_NAME}`)
