#!/usr/bin/env bash
# scripts/fetch-geodata.sh
#
# Downloads an accurate South Africa province boundary file and places it
# in public/data/ so the map component can fetch it at runtime.
#
# Run once after cloning the project:
#   chmod +x scripts/fetch-geodata.sh
#   ./scripts/fetch-geodata.sh
#
# Prerequisites: curl (comes with macOS/Linux)
# Optional:      mapshaper (for file size reduction)

set -e  # exit immediately if any command fails

echo "📦 Creating public/data directory..."
mkdir -p public/data

echo "🌍 Downloading South Africa province boundaries..."

# This GeoJSON comes from the South African Local Government Association
# (SALGA) data, re-hosted on GitHub for reliability.
# It contains accurate StatsSA-aligned province polygons.
curl -L \
  "https://raw.githubusercontent.com/jschibelli/southafrica-provinces/main/south_africa_provinces.geojson" \
  -o public/data/sa-provinces.json

echo "✅ GeoJSON saved to public/data/sa-provinces.json"
echo ""

# ── Optional: simplify with mapshaper to reduce file size ────────────────────
# The raw file may be 3-10MB. Simplifying to 15% keeps visual quality
# while reducing to ~150kb — much faster to download.
#
# Install mapshaper first: npm install -g mapshaper
# Then uncomment the block below:

# if command -v mapshaper &> /dev/null; then
#   echo "🗜️  Simplifying with mapshaper..."
#   mapshaper public/data/sa-provinces.json \
#     -simplify 15% keep-shapes \
#     -o format=geojson force public/data/sa-provinces.json
#   echo "✅ Simplified."
# else
#   echo "ℹ️  mapshaper not installed — skipping simplification."
#   echo "   Install with: npm install -g mapshaper"
# fi

echo ""
echo "🎉 Done! You can now run: npm run dev"
