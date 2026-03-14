# MzansiVisualized

Weekly data visualizations about South Africa.

---

## Mental model — Flask vs Next.js

If you know Flask, you already understand the concepts. The vocabulary just changed.

| Flask | Next.js (App Router) |
|-------|---------------------|
| `app.py` | `app/layout.tsx` |
| `@app.route('/')` | `app/page.tsx` |
| `@app.route('/issues/<slug>')` | `app/issues/[slug]/page.tsx` |
| `render_template('base.html')` | `<SiteHeader />` + `<SiteFooter />` (components) |
| Jinja2 `{% extends %}` | `layout.tsx` wrapping `{children}` |
| `static/style.css` | `app/globals.css` + Tailwind classes |
| `models.py` (SQLAlchemy) | `data/issues.ts` (TypeScript arrays, for now) |
| `jsonify(data)` | `route.tsx` returning `NextResponse.json(data)` |
| `.env` + `python-dotenv` | `.env.local` (built into Next.js) |
| `flask run` | `npm run dev` |
| `gunicorn app:app` on a VPS | `vercel deploy` (serverless, zero config) |
| Frozen-Flask (static export) | `next build` (static + serverless hybrid) |

---

## Project structure explained

```
mzansi-visualized/
│
├── app/                          # Everything under this = a route on the website
│   ├── layout.tsx                # Root HTML shell — wraps EVERY page (= base.html)
│   ├── globals.css               # One global CSS file
│   ├── page.tsx                  # Homepage  →  /
│   ├── not-found.tsx             # 404 page
│   ├── about/
│   │   └── page.tsx              # About page  →  /about
│   ├── issues/
│   │   ├── page.tsx              # Issue list  →  /issues
│   │   └── [slug]/
│   │       └── page.tsx          # Individual issue  →  /issues/province-house-prices
│   └── api/
│       └── og/
│           └── [slug]/
│               └── route.tsx     # OG image API  →  /api/og/province-house-prices
│
├── components/                   # Reusable UI pieces (= Jinja2 macros, but as JS)
│   ├── layout/
│   │   ├── SiteHeader.tsx
│   │   └── SiteFooter.tsx
│   ├── ui/
│   │   └── IssueCard.tsx
│   └── visualizations/
│       ├── index.ts              # Registry: name → component
│       └── ProvinceHousePrices.tsx
│
├── data/                         # Your "database" — plain TypeScript files for now
│   ├── issues.ts                 # All issues + helper query functions
│   └── province-house-prices.ts  # Issue #001 data
│
├── lib/
│   └── utils.ts                  # Shared helpers (formatRand, formatDate, etc.)
│
├── public/                       # Static files served as-is (like Flask's /static)
│   └── data/
│       └── sa-provinces.json     # Province GeoJSON (fetched by setup script)
│
└── scripts/
    ├── fetch-geodata.sh          # Downloads the SA province map data
    └── fetch-geodata.js          # Same, but cross-platform Node.js version
```

---

## Setup — step by step

### 1. Prerequisites

```bash
# Check you have Node.js 18+
node --version   # should print v18.x.x or higher

# If not, install via nvm (recommended):
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
nvm install 20
nvm use 20
```

### 2. Clone and install

```bash
git clone <your-repo-url> mzansi-visualized
cd mzansi-visualized
npm install
```

`npm install` reads `package.json` and downloads all dependencies into `node_modules/`.
This is equivalent to `pip install -r requirements.txt`.

### 3. Download the map data

The SA province GeoJSON is not committed to git (it's large). Run once:

```bash
# Mac/Linux:
chmod +x scripts/fetch-geodata.sh
./scripts/fetch-geodata.sh

# Windows (or if the above fails):
node scripts/fetch-geodata.js
```

This downloads `public/data/sa-provinces.json` — the real province boundaries
from StatsSA-aligned data. The script also prints the province name format used
in the file so you can verify `nameToCode()` in the map component.

### 4. Environment variables

```bash
cp .env.local.example .env.local
# Edit .env.local with your values (site URL, analytics key, etc.)
```

### 5. Start the development server

```bash
npm run dev
```

Open http://localhost:3000

Hot reload works exactly like Flask's `debug=True` — save a file, the browser updates.

---

## Adding a new issue (your weekly workflow)

Every week you do these 4 steps:

### Step 1 — Add the data

Create `data/your-topic.ts`:

```typescript
// data/gdp-by-province.ts
export const GDP_DATA = {
  GP:  { name: 'Gauteng',      gdpBn: 1_400, share: 34.2 },
  WC:  { name: 'Western Cape', gdpBn:  620,  share: 15.1 },
  // ...
}
```

### Step 2 — Build the visualization component

Create `components/visualizations/GdpByProvince.tsx`:

```tsx
'use client'
import { GDP_DATA } from '@/data/gdp-by-province'

export default function GdpByProvince() {
  return (
    <div>
      {/* Your chart/map/visualization */}
    </div>
  )
}
```

### Step 3 — Register the component

In `components/visualizations/index.ts`, add one line:

```typescript
GdpByProvince: dynamic(() => import('./GdpByProvince'), { ssr: false }),
```

### Step 4 — Add the issue to the registry

In `data/issues.ts`, add to the `issues` array:

```typescript
{
  slug:        'gdp-by-province',
  number:      2,
  title:       'Who is carrying the economy?',
  deck:        'Gauteng alone generates 34% of SA\'s GDP. Here\'s the full picture.',
  publishedAt: '2026-03-20',
  tags:        ['economy', 'map'],
  component:   'GdpByProvince',  // must match the key in index.ts
  featured:    false,
},
```

That's it. Run `npm run dev` and visit `/issues/gdp-by-province`.

---

## Key Next.js concepts you'll encounter

### Server vs Client components

Next.js has two "worlds":

**Server components** (default — no `'use client'` at top):
- Rendered on the server, like a Flask route
- Can read files, fetch from databases, run any Node.js code
- The HTML is sent to the browser — great for SEO
- Cannot use `useState`, `useEffect`, or any browser APIs

**Client components** (`'use client'` at top of file):
- Run in the browser, like React has always worked
- Can use `useState`, `useEffect`, event handlers, D3, window, etc.
- Hydrated (activated) after the initial HTML loads

**Rule of thumb**: Start with server components. Add `'use client'` only when you need interactivity. Your visualization components will almost always be `'use client'`.

### The `@/` import alias

`@/` maps to the root of your project. So:

```typescript
import { fmtDate } from '@/lib/utils'
// is the same as:
import { fmtDate } from '../../lib/utils'
```

Much cleaner — defined in `tsconfig.json`.

### `Link` vs `<a>`

Always use Next.js `Link` for internal navigation:

```tsx
import Link from 'next/link'

// ✅ Client-side navigation — fast, no full page reload
<Link href="/issues/province-house-prices">Read more</Link>

// ✅ External links — use regular <a> with target="_blank"
<a href="https://statssa.gov.za" target="_blank" rel="noopener noreferrer">StatsSA</a>
```

### `Image` vs `<img>`

For images, use Next.js `Image` — it auto-optimizes, resizes, and lazy-loads:

```tsx
import Image from 'next/image'
<Image src="/logo.png" alt="Logo" width={200} height={100} />
```

---

## Deploying to Vercel

Vercel is built by the same team as Next.js — zero configuration needed.

### First deploy

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy (follow the prompts — takes ~2 minutes)
vercel

# Production deploy
vercel --prod
```

### Connecting your domain

1. Buy `mzansivisualized.co.za` from [Domains.co.za](https://domains.co.za) (~R150/yr) or [Afrihost](https://afrihost.com)
2. In Vercel dashboard → your project → Settings → Domains → Add domain
3. Vercel gives you DNS records — copy them to your registrar's DNS settings
4. SSL/HTTPS is automatic and free

### Auto-deploy on git push

Connect your GitHub repo to Vercel:
1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import from GitHub
3. Every `git push` to `main` automatically deploys

```bash
# Your weekly workflow after this setup:
git add .
git commit -m "Add Issue #002: GDP by province"
git push
# → Vercel deploys automatically in ~30 seconds
```

### Environment variables in production

In Vercel dashboard → your project → Settings → Environment Variables.
Add the same keys from your `.env.local` file.

---

## Generating social share images

The OG image endpoint is live at:
```
https://mzansivisualized.co.za/api/og/province-house-prices
```

Test locally at:
```
http://localhost:3000/api/og/province-house-prices
```

When someone shares your issue link on WhatsApp, LinkedIn, or Twitter, their platform fetches this URL and uses it as the preview thumbnail. It's automatically sized at 1200×630px.

---

## Useful commands

```bash
npm run dev        # Start dev server on http://localhost:3000
npm run build      # Build for production (catches TypeScript errors)
npm run start      # Run the production build locally
npm run lint       # Check for code problems

node scripts/fetch-geodata.js   # Re-download province GeoJSON
```

---

## Recommended tools

| Tool | Purpose | Why |
|------|---------|-----|
| [VS Code](https://code.visualstudio.com) | Editor | Best TypeScript support |
| [Vercel](https://vercel.com) | Hosting | Zero-config Next.js deploys |
| [Plausible](https://plausible.io) | Analytics | Privacy-first, POPIA-friendly |
| [Buttondown](https://buttondown.com) | Newsletter | Free up to 1000 subscribers |
| [Domains.co.za](https://domains.co.za) | Domain | Local `.co.za` registrar |
| [Afrihost](https://afrihost.com) | Domain alt | Reliable SA registrar |

---

## Sources for future data

| Dataset | Source | URL |
|---------|--------|-----|
| Census 2022 | StatsSA | statssa.gov.za |
| Property prices | Lightstone | lightstone.co.za |
| GDP by province | StatsSA | statssa.gov.za |
| Crime stats | SAPS | saps.gov.za |
| Load-shedding history | Eskom / EskomSePush | eskomsepush.app |
| School performance | DBE | education.gov.za |
| Reserve Bank data | SARB | resbank.co.za |
| Municipal finances | National Treasury | treasury.gov.za |
