import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { createRequire } from 'node:module'
import { pathToFileURL } from 'node:url'

const root = process.env.UNOVIS_ROOT ?? process.cwd()
const out = process.env.UNOVIS_EVIDENCE_DIR ?? '/tmp/unovis-treemap-ssr-comparison'
const require = createRequire(`${root}/packages/mcp/package.json`)
const { PNG } = require('pngjs')
const { default: pixelmatch } = await import(pathToFileURL(require.resolve('pixelmatch')).href)
const { z } = await import(pathToFileURL(require.resolve('zod')).href)
const { treemapRecipe } = await import(`${root}/packages/mcp/src/recipes/treemap.ts`)
const { renderChart } = await import(`${root}/packages/mcp/src/render/renderer.ts`)
const { svgToPng } = await import(`${root}/packages/ssr/src/rasterize.ts`)
const { default: fixtures } = await import(`${root}/packages/mcp/test/fixtures/treemap.ts`)
const fixture = fixtures.find(f => f.name === 'two-layer-cloud-costs')
const input = z.object(treemapRecipe.inputShape).parse(fixture.input)
const actual = await renderChart(treemapRecipe.toSpec(input), { idPrefix: 'snap-' })
const baseline = readFileSync(`${root}/packages/mcp/test/__snapshots__/treemap-two-layer-cloud-costs.svg`, 'utf8')
mkdirSync(out, { recursive: true })
writeFileSync(`${out}/baseline.svg`, baseline)
writeFileSync(`${out}/actual.svg`, actual.svg)
const beforeBuffer = await svgToPng(baseline, { scale: 1, background: '#ffffff' })
const afterBuffer = await svgToPng(actual.svg, { scale: 1, background: '#ffffff' })
writeFileSync(`${out}/baseline.png`, beforeBuffer)
writeFileSync(`${out}/actual.png`, afterBuffer)
const before = PNG.sync.read(beforeBuffer)
const after = PNG.sync.read(afterBuffer)
const diff = new PNG({ width: before.width, height: before.height })
const count = pixelmatch(before.data, after.data, diff.data, before.width, before.height, { threshold: 0.1 })
const diffBuffer = PNG.sync.write(diff)
writeFileSync(`${out}/diff.png`, diffBuffer)
const w = before.width
const h = before.height
const composite = `<svg xmlns="http://www.w3.org/2000/svg" width="${w * 2 + 40}" height="${h + 60}"><rect width="100%" height="100%" fill="white"/><g font-family="Inter,Arial" font-size="18" font-weight="600" fill="#222"><text x="10" y="27">Saved baseline</text><text x="${w + 30}" y="27">PR #961 output</text></g><image x="10" y="45" width="${w}" height="${h}" href="data:image/png;base64,${beforeBuffer.toString('base64')}"/><image x="${w + 30}" y="45" width="${w}" height="${h}" href="data:image/png;base64,${afterBuffer.toString('base64')}"/></svg>`
writeFileSync(`${out}/comparison.png`, await svgToPng(composite, { scale: 1, background: '#ffffff' }))
console.log(JSON.stringify({width:w,height:h,differingPixels:count,totalPixels:w*h,percent:100*count/(w*h),warnings:actual.warnings,out}))
