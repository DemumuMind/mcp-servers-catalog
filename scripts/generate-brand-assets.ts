import fs from 'node:fs'
import sharp from 'sharp'

import {
  brandMarkSvg,
  brandOgSvg,
  maskableBrandMarkSvg,
  screenshotNarrowSvg,
  screenshotWideSvg,
} from '../src/lib/brand-svg'

function icoFromPngs(images: Array<{ width: number; height: number; buffer: Buffer }>) {
  const count = images.length
  const headerSize = 6 + count * 16
  let offset = headerSize
  const header = Buffer.alloc(headerSize)

  header.writeUInt16LE(0, 0)
  header.writeUInt16LE(1, 2)
  header.writeUInt16LE(count, 4)

  images.forEach((image, index) => {
    const entry = 6 + index * 16
    header.writeUInt8(image.width >= 256 ? 0 : image.width, entry)
    header.writeUInt8(image.height >= 256 ? 0 : image.height, entry + 1)
    header.writeUInt8(0, entry + 2)
    header.writeUInt8(0, entry + 3)
    header.writeUInt16LE(1, entry + 4)
    header.writeUInt16LE(32, entry + 6)
    header.writeUInt32LE(image.buffer.length, entry + 8)
    header.writeUInt32LE(offset, entry + 12)
    offset += image.buffer.length
  })

  return Buffer.concat([header, ...images.map((image) => image.buffer)])
}

async function writePngFromSvg(svg: string, path: string, width?: number, height = width) {
  const image = sharp(Buffer.from(svg))
  const pipeline = width ? image.resize(width, height) : image
  await pipeline.png().toFile(path)
}

async function main() {
  const markSvg = brandMarkSvg(512)
  const maskableSvg = maskableBrandMarkSvg(512)
  const ogSvg = brandOgSvg()

  fs.writeFileSync('public/brand-mark.svg', markSvg)
  fs.writeFileSync('public/icon.svg', markSvg)
  fs.writeFileSync('public/maskable-icon.svg', maskableSvg)
  fs.writeFileSync('public/og-brand.svg', ogSvg)

  await writePngFromSvg(markSvg, 'public/icon-192x192.png', 192)
  await writePngFromSvg(markSvg, 'public/icon-512x512.png', 512)
  await writePngFromSvg(markSvg, 'public/apple-touch-icon.png', 180)
  await writePngFromSvg(markSvg, 'src/app/icon.png', 32)
  await writePngFromSvg(markSvg, 'src/app/apple-icon.png', 180)
  await writePngFromSvg(maskableBrandMarkSvg(192), 'public/maskable-icon-192x192.png')
  await writePngFromSvg(maskableSvg, 'public/maskable-icon-512x512.png')
  await writePngFromSvg(ogSvg, 'public/og-brand.png', 1200, 630)
  await writePngFromSvg(screenshotWideSvg(), 'public/screenshot-wide.png')
  await writePngFromSvg(screenshotNarrowSvg(), 'public/screenshot-narrow.png')

  const icoImages: Array<{ width: number; height: number; buffer: Buffer }> = []
  for (const size of [16, 32, 48]) {
    icoImages.push({
      width: size,
      height: size,
      buffer: await sharp(Buffer.from(markSvg)).resize(size, size).png().toBuffer(),
    })
  }
  fs.writeFileSync('src/app/favicon.ico', icoFromPngs(icoImages))

  process.stdout.write('Generated MCP Servers brand assets.\n')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
