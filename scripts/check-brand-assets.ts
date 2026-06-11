import fs from 'node:fs/promises'
import sharp from 'sharp'

type Manifest = {
  icons?: Array<{ src: string; sizes?: string; type?: string; purpose?: string }>
  screenshots?: Array<{ src: string; sizes?: string; type?: string; form_factor?: string }>
}

function publicPath(src: string) {
  return `public/${src.replace(/^\//, '')}`
}

async function assertPngSize(src: string, expected: string) {
  const file = publicPath(src)
  const metadata = await sharp(file).metadata()
  const actual = `${metadata.width}x${metadata.height}`
  if (actual !== expected) {
    throw new Error(`${src} expected ${expected}, got ${actual}`)
  }
}

async function assertExists(src: string) {
  await fs.access(publicPath(src))
}

async function main() {
  const manifest = JSON.parse(await fs.readFile('public/manifest.json', 'utf8')) as Manifest
  const entries = [...(manifest.icons ?? []), ...(manifest.screenshots ?? [])]

  for (const entry of entries) {
    if (!entry.src) throw new Error('manifest asset missing src')
    await assertExists(entry.src)
    if (entry.type === 'image/png' && entry.sizes && !entry.sizes.includes(' ')) {
      await assertPngSize(entry.src, entry.sizes)
    }
  }

  for (const required of [
    '/icon-192x192.png',
    '/icon-512x512.png',
    '/maskable-icon-192x192.png',
    '/maskable-icon-512x512.png',
    '/apple-touch-icon.png',
    '/screenshot-wide.png',
    '/screenshot-narrow.png',
  ]) {
    if (!entries.some((entry) => entry.src === required)) {
      throw new Error(`manifest does not reference ${required}`)
    }
  }

  process.stdout.write('Brand/PWA assets are present and correctly sized.\n')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
