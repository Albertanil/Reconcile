import { useState } from 'react'
import PageChrome from '../components/PageChrome'
import type { Navigate } from '../App'

export default function Landing({ navigate }: { navigate: Navigate }) {
  const [hovered, setHovered] = useState(false)

  return (
    <PageChrome step={0}>
      <div
        className="min-h-full flex flex-col items-center justify-center"
        style={{ padding: '48px 32px 40px' }}
      >
        {/* Top identifier row */}
        <div
          className="flex items-center gap-4 mb-10"
          style={{ fontFamily: 'var(--f-mono)', fontSize: '11px', color: 'var(--c-muted)', letterSpacing: '0.25em' }}
        >
          <GovernmentSeal size={36} />
          <span>D.I.A.</span>
          <span style={{ color: 'var(--c-border2)' }}>—</span>
          <span>DEPARTMENT OF INTERPERSONAL AFFAIRS</span>
        </div>

        {/* Hero title */}
        <div className="text-center mb-3">
          <div
            className="leading-none font-black"
            style={{
              fontFamily: 'var(--f-admin)',
              fontSize: 'clamp(56px, 8vw, 100px)',
              letterSpacing: '0.04em',
            }}
          >
            <span style={{ color: 'var(--c-text)' }}>SORRY,&nbsp;</span>
            <span style={{ color: 'var(--c-red2)' }}>PENDING</span>
          </div>
        </div>

        {/* Subtitle */}
        <div
          className="text-center mb-10"
          style={{
            fontFamily: 'var(--f-admin)',
            fontSize: '18px',
            color: 'var(--c-muted)',
            fontWeight: 300,
            letterSpacing: '0.05em',
          }}
        >
          Your apology is under review.
        </div>

        {/* CTA Button */}
        <button
          onClick={() => navigate('queue')}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          className="px-12 py-4 text-sm tracking-[0.2em] border-2 transition-all duration-150"
          style={{
            fontFamily: 'var(--f-mono)',
            background: hovered ? 'var(--c-text)' : 'transparent',
            color: hovered ? 'var(--c-bg)' : 'var(--c-text)',
            borderColor: 'var(--c-text)',
            cursor: 'pointer',
            letterSpacing: '0.2em',
          }}
        >
          BEGIN APPLICATION →
        </button>

        {/* Spacer */}
        <div style={{ height: '48px' }} />

        {/* Warning card */}
        <div
          className="border flex items-start gap-4 p-5"
          style={{
            background: 'var(--c-panel)',
            borderColor: 'var(--c-red2)',
            maxWidth: '380px',
            width: '100%',
          }}
        >
          {/* Warning icon */}
          <div className="flex-shrink-0 mt-0.5">
            <svg width="20" height="20" viewBox="0 0 20 20">
              <polygon points="10,2 19,18 1,18" fill="none" stroke="var(--c-red2)" strokeWidth="1.5" />
              <text
                x="10"
                y="16"
                textAnchor="middle"
                style={{ fontFamily: 'var(--f-mono)', fontSize: '9px', fill: 'var(--c-red2)', fontWeight: 700 }}
              >
                !
              </text>
            </svg>
          </div>
          <div>
            <div
              className="text-xs font-bold mb-1 tracking-widest"
              style={{ fontFamily: 'var(--f-mono)', color: 'var(--c-red2)' }}
            >
              WARNING
            </div>
            <div
              className="text-xs leading-relaxed"
              style={{ fontFamily: 'var(--f-mono)', color: 'var(--c-muted)', lineHeight: '1.6' }}
            >
              This process may be emotionally exhausting.
              <br />
              Proceed anyway?
            </div>
          </div>
        </div>

        {/* Bottom system info */}
        <div
          className="mt-10 flex items-center gap-5 text-xs"
          style={{ fontFamily: 'var(--f-mono)', color: 'var(--c-muted2)', letterSpacing: '0.1em' }}
        >
          <span>FORM 7-B REV.14</span>
          <span style={{ color: 'var(--c-border2)' }}>|</span>
          <span>CASE A-047</span>
          <span style={{ color: 'var(--c-border2)' }}>|</span>
          <span>SYS VER 4.7</span>
        </div>
      </div>
    </PageChrome>
  )
}

export function GovernmentSeal({ size = 110 }: { size?: number }) {
  const cx = size / 2
  const dotAngles = [0, 40, 80, 120, 160, 200, 240, 280, 320]
  return (
    <svg width={size} height={size} viewBox="0 0 110 110" style={{ flexShrink: 0 }}>
      <circle cx="55" cy="55" r="52" fill="none" stroke="var(--c-border2)" strokeWidth="1" />
      <circle cx="55" cy="55" r="46" fill="none" stroke="var(--c-border2)" strokeWidth="0.5" />
      <circle cx="55" cy="55" r="37" fill="var(--c-panel)" stroke="var(--c-border2)" strokeWidth="1" />
      {dotAngles.map((deg) => {
        const rad = (deg * Math.PI) / 180
        const x = 55 + 49 * Math.sin(rad)
        const y = 55 - 49 * Math.cos(rad)
        return <circle key={deg} cx={x} cy={y} r="1.2" fill="var(--c-muted2)" />
      })}
      <text x="55" y="50" textAnchor="middle" style={{ fontFamily: 'var(--f-admin)', fontSize: '16px', fill: 'var(--c-text)', fontWeight: 800, letterSpacing: '3px' }}>
        D.I.A.
      </text>
      <text x="55" y="64" textAnchor="middle" style={{ fontFamily: 'var(--f-mono)', fontSize: '6px', fill: 'var(--c-muted)', letterSpacing: '2px' }}>
        EST. 19XX
      </text>
      <path id="topArc2" d="M 10 55 A 45 45 0 0 1 100 55" fill="none" />
      <text style={{ fontFamily: 'var(--f-mono)', fontSize: '5.5px', fill: 'var(--c-muted2)', letterSpacing: '1.2px' }}>
        <textPath href="#topArc2" startOffset="5%">DEPARTMENT OF INTERPERSONAL AFFAIRS</textPath>
      </text>
      <path id="botArc2" d="M 11 58 A 44 44 0 0 0 99 58" fill="none" />
      <text style={{ fontFamily: 'var(--f-mono)', fontSize: '5.5px', fill: 'var(--c-muted2)', letterSpacing: '1.2px' }}>
        <textPath href="#botArc2" startOffset="4%">JURISDICTION: INTERPERSONAL ★ ★ ★</textPath>
      </text>
    </svg>
  )
}
