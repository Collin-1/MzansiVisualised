// scripts/fetch-geodata.js
//
// Cross-platform version of fetch-geodata.sh — works on Windows, Mac, Linux.
// Run with:  node scripts/fetch-geodata.js
//
// Uses only Node.js built-ins (no npm install needed).

const https = require('https')
const fs    = require('fs')
const path  = require('path')

const OUTPUT_DIR  = path.join(__dirname, '..', 'public', 'data')
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'sa-provinces.json')

// This URL points to a reliable GeoJSON of South Africa's 9 provinces
// with accurate StatsSA-aligned boundaries.
const GEOJSON_URL =
  'https://raw.githubusercontent.com/jschibelli/southafrica-provinces/main/south_africa_provinces.geojson'

// Create the output directory if it doesn't exist
fs.mkdirSync(OUTPUT_DIR, { recursive: true })

console.log('🌍 Downloading South Africa province GeoJSON...')
console.log(`   Source: ${GEOJSON_URL}`)
console.log(`   Target: ${OUTPUT_FILE}`)
console.log('')

const file = fs.createWriteStream(OUTPUT_FILE)

https.get(GEOJSON_URL, response => {
  // Handle redirects (GitHub often redirects)
  if (response.statusCode === 301 || response.statusCode === 302) {
    console.log(`   Redirecting to: ${response.headers.location}`)
    https.get(response.headers.location, redirected => {
      redirected.pipe(file)
      file.on('finish', () => {
        file.close()
        console.log('✅ GeoJSON downloaded successfully!')
        console.log('')
        verifyFile()
      })
    })
    return
  }

  if (response.statusCode !== 200) {
    console.error(`❌ HTTP ${response.statusCode} — download failed.`)
    console.error('   Try downloading manually from:')
    console.error(`   ${GEOJSON_URL}`)
    process.exit(1)
  }

  response.pipe(file)
  file.on('finish', () => {
    file.close()
    console.log('✅ GeoJSON downloaded successfully!')
    console.log('')
    verifyFile()
  })
}).on('error', err => {
  fs.unlink(OUTPUT_FILE, () => {})
  console.error('❌ Network error:', err.message)
  console.error('')
  console.error('If you have no internet access, download the file manually:')
  console.error(GEOJSON_URL)
  console.error(`And save it to: ${OUTPUT_FILE}`)
  process.exit(1)
})

function verifyFile() {
  const stats    = fs.statSync(OUTPUT_FILE)
  const sizeKb   = (stats.size / 1024).toFixed(1)
  const content  = fs.readFileSync(OUTPUT_FILE, 'utf8')
  const parsed   = JSON.parse(content)
  const features = parsed.features?.length ?? 0

  console.log(`📊 File size:  ${sizeKb} KB`)
  console.log(`📍 Features:   ${features} province polygons`)
  console.log('')

  if (features < 9) {
    console.warn(`⚠️  Expected 9 provinces but got ${features}.`)
    console.warn('   The map may be incomplete. Check the GeoJSON source.')
  } else {
    console.log('🎉 All 9 provinces found. You\'re ready to go!')
    console.log('')
    console.log('Next step: npm run dev')
  }

  // Print the province names so you can verify the PROVINCE property key
  // used in ProvinceHousePrices.tsx → nameToCode()
  console.log('')
  console.log('Province names in this file (update nameToCode() if different):')
  parsed.features.forEach((f, i) => {
    const props = f.properties
    const name  = props.PROVINCE || props.name || props.NAME || props.province || JSON.stringify(props)
    console.log(`  ${i + 1}. ${name}`)
  })
}
