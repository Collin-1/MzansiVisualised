// app/api/og/[slug]/route.tsx
//
// Auto-generates a 1200×630px PNG for every issue — used as the og:image
// for Twitter cards, LinkedIn previews, WhatsApp link unfurling, etc.
//
// HOW IT WORKS:
// Next.js's ImageResponse renders a React component to a PNG at request time.
// It uses a subset of CSS (Flexbox only — no Grid, no absolute positioning).
//
// Flask equivalent:
//   @app.route('/api/og/<slug>')
//   def og_image(slug):
//       img = render_to_png(slug)
//       return Response(img, mimetype='image/png')
//
// Test it locally: http://localhost:3000/api/og/province-house-prices

import { ImageResponse } from 'next/og'
import { getIssueBySlug } from '@/data/issues'

// Edge runtime — runs close to the user for fast image generation
export const runtime = 'edge'

export async function GET(
  _req: Request,
  { params }: { params: { slug: string } }
) {
  const issue = getIssueBySlug(params.slug)

  // Fallback for unknown slugs
  const title  = issue?.title  ?? 'MzansiVisualized'
  const deck   = issue?.deck   ?? 'Data stories about South Africa'
  const number = issue?.number ?? 0

  return new ImageResponse(
    (
      // ImageResponse ONLY supports inline styles + flexbox.
      // No Tailwind classes here — write styles as objects.
      <div
        style={{
          width:      '100%',
          height:     '100%',
          display:    'flex',
          flexDirection: 'column',
          background: '#F9F4ED',
          padding:    '64px',
          fontFamily: 'Georgia, serif',
        }}
      >
        {/* Top bar — gold accent */}
        <div style={{ display:'flex', alignItems:'center', gap:'16px', marginBottom:'auto' }}>
          {/* Brand mark */}
          <div style={{
            width:           '52px',
            height:          '52px',
            borderRadius:    '50%',
            background:      '#C09040',
            display:         'flex',
            alignItems:      'center',
            justifyContent:  'center',
            color:           'white',
            fontSize:        '24px',
            fontWeight:      '700',
          }}>
            M
          </div>
          <span style={{ fontSize:'18px', color:'#C09040', letterSpacing:'0.15em', textTransform:'uppercase' }}>
            MzansiVisualized
          </span>
          {number > 0 && (
            <span style={{ fontSize:'14px', color:'#B0A090', marginLeft:'auto' }}>
              Issue #{String(number).padStart(3, '0')}
            </span>
          )}
        </div>

        {/* Main title */}
        <div style={{ display:'flex', flexDirection:'column', gap:'20px', marginTop:'48px' }}>
          <h1 style={{
            fontSize:   '58px',
            fontWeight: '700',
            lineHeight: '1.05',
            color:      '#1A1209',
            margin:     0,
            maxWidth:   '800px',
          }}>
            {title}
          </h1>

          <p style={{
            fontSize:  '24px',
            color:     '#7A6A58',
            lineHeight:'1.5',
            margin:    0,
            maxWidth:  '720px',
          }}>
            {deck}
          </p>
        </div>

        {/* Bottom — URL */}
        <div style={{
          display:      'flex',
          alignItems:   'center',
          marginTop:    '48px',
          paddingTop:   '28px',
          borderTop:    '1px solid rgba(0,0,0,0.1)',
        }}>
          <span style={{ fontSize:'18px', color:'#B0A090' }}>
            mzansivisualized.co.za
          </span>
          {/* Decorative colour swatches — province colours */}
          <div style={{ display:'flex', gap:'6px', marginLeft:'auto' }}>
            {['#C4562A','#B84020','#CF8B50','#C87040','#D4904A','#D4734A','#D4A86A','#E8C88A','#EAD39C'].map(c => (
              <div key={c} style={{ width:'24px', height:'24px', borderRadius:'50%', background:c }} />
            ))}
          </div>
        </div>
      </div>
    ),
    {
      width:  1200,
      height: 630,
    }
  )
}
