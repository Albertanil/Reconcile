import { useState, useEffect } from 'react'
import PageChrome from '../components/PageChrome'
import type { Navigate } from '../App'

export default function Queue({ navigate }: { navigate: Navigate }) {
  const [serving, setServing] = useState('A-044')
  const [dots, setDots] = useState('')

  useEffect(() => {
    const t1 = setTimeout(() => setServing('A-044'), 4000)
    return () => clearTimeout(t1)
  }, [])

  useEffect(() => {
    const t = setInterval(() => setDots((d) => (d.length >= 3 ? '' : d + '.')), 600)
    return () => clearInterval(t)
  }, [])

  return (
    <PageChrome step={2}>
      <div
        className="flex flex-col"
        style={{ minHeight: 'calc(100vh - 88px)', background: 'var(--c-bg)' }}
      >
        {/* Top strip — small controls */}
        <div
          className="flex items-center justify-between px-6 py-2 border-b flex-shrink-0"
          style={{
            background: 'var(--c-panel)',
            borderColor: 'var(--c-border)',
            fontFamily: 'var(--f-mono)',
            fontSize: '11px',
          }}
        >
          <div className="flex items-center gap-5" style={{ color: 'var(--c-muted)' }}>
            <span>
              YOUR NUMBER: <strong style={{ color: 'var(--c-text)', fontSize: '13px' }}>A-047</strong>
            </span>
            <span style={{ color: 'var(--c-border2)' }}>|</span>
            <span>
              NOW SERVING:{' '}
              <strong style={{ color: 'var(--c-amber)', fontSize: '13px' }}>{serving}</strong>
            </span>
            <span style={{ color: 'var(--c-border2)' }}>|</span>
            <span>ESTIMATED WAIT: <span style={{ color: 'var(--c-amber)' }}>INDETERMINATE</span></span>
          </div>
          <div className="flex items-center gap-5" style={{ color: 'var(--c-muted)' }}>
            <span className="flex items-center gap-1.5" style={{ color: 'var(--c-red2)' }}>
              <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: 'var(--c-red2)' }} />
              LIVE FEED
            </span>
            <span>CAM-02 / WAITING ROOM B</span>
          </div>
        </div>

        {/* Main 3D room — takes most of the space */}
        <div className="flex-1 relative overflow-hidden" style={{ minHeight: '420px' }}>
          <WaitingRoom3D serving={serving} />
          {/* Scanline overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage:
                'repeating-linear-gradient(0deg, rgba(0,0,0,0.06) 0px, rgba(0,0,0,0.06) 1px, transparent 1px, transparent 3px)',
            }}
          />
          {/* Corner crosshairs */}
          {(['tl', 'tr', 'bl', 'br'] as const).map((pos) => (
            <div
              key={pos}
              className="absolute w-5 h-5 pointer-events-none"
              style={{
                top: pos.startsWith('t') ? 10 : 'auto',
                bottom: pos.startsWith('b') ? 10 : 'auto',
                left: pos.endsWith('l') ? 10 : 'auto',
                right: pos.endsWith('r') ? 10 : 'auto',
                borderTop: pos.startsWith('t') ? '1px solid rgba(180,148,58,0.6)' : 'none',
                borderBottom: pos.startsWith('b') ? '1px solid rgba(180,148,58,0.6)' : 'none',
                borderLeft: pos.endsWith('l') ? '1px solid rgba(180,148,58,0.6)' : 'none',
                borderRight: pos.endsWith('r') ? '1px solid rgba(180,148,58,0.6)' : 'none',
              }}
            />
          ))}
        </div>

        {/* Bottom strip */}
        <div
          className="flex-shrink-0 flex items-center justify-between px-6 py-3 border-t"
          style={{
            background: 'var(--c-panel)',
            borderColor: 'var(--c-border)',
            fontFamily: 'var(--f-mono)',
          }}
        >
          <div>
            <div
              className="text-sm tracking-[0.25em]"
              style={{ color: 'var(--c-text)' }}
            >
              PLEASE REMAIN PATIENT{dots}
            </div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--c-muted2)' }}>
              Your patience will not affect processing time.
            </div>
          </div>
          <button
            onClick={() => navigate('form')}
            className="px-8 py-2.5 text-xs tracking-[0.15em] border transition-all"
            style={{
              borderColor: 'var(--c-border2)',
              color: 'var(--c-muted)',
              background: 'transparent',
              cursor: 'pointer',
              letterSpacing: '0.15em',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--c-text)'
              e.currentTarget.style.color = 'var(--c-text)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--c-border2)'
              e.currentTarget.style.color = 'var(--c-muted)'
            }}
          >
            BEGIN APPLICATION →
          </button>
        </div>
      </div>
    </PageChrome>
  )
}

function WaitingRoom3D({ serving }: { serving: string }) {
  const upNext = ['A-045', 'A-046', 'A-047', 'A-048'].filter((n) => n !== serving)

  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 1000 580"
      preserveAspectRatio="xMidYMid meet"
      style={{ display: 'block', position: 'absolute', inset: 0 }}
    >
      {/* ── ROOM BOX ── */}
      {/* Ceiling */}
      <polygon points="0,0 1000,0 760,130 240,130" fill="#0e0d0a" />
      {/* Left wall */}
      <polygon points="0,0 240,130 240,340 0,580" fill="#131210" />
      {/* Right wall */}
      <polygon points="1000,0 760,130 760,340 1000,580" fill="#0f0e0c" />
      {/* Back wall */}
      <rect x="240" y="130" width="520" height="210" fill="#1a1916" />
      {/* Floor */}
      <polygon points="0,580 1000,580 760,340 240,340" fill="#1e1c18" />
      {/* Floor subtle concrete seams */}
      <line x1="0" y1="460" x2="1000" y2="460" stroke="#1a1814" strokeWidth="1" opacity="0.5" />
      <line x1="0" y1="520" x2="1000" y2="520" stroke="#1a1814" strokeWidth="1" opacity="0.5" />
      <line x1="400" y1="340" x2="300" y2="580" stroke="#1a1814" strokeWidth="1" opacity="0.4" />
      <line x1="600" y1="340" x2="700" y2="580" stroke="#1a1814" strokeWidth="1" opacity="0.4" />

      {/* ── CEILING FIXTURES ── */}
      {/* Fluorescent light 1 — perspective trapezoid */}
      <polygon points="280,0 380,0 352,130 268,130" fill="#ccc8a0" opacity="0.8" />
      <polygon points="620,0 720,0 732,130 648,130" fill="#ccc8a0" opacity="0.8" />
      {/* Light glow on ceiling */}
      <polygon points="250,0 410,0 380,130 240,130" fill="#ccc8a0" opacity="0.06" />
      <polygon points="590,0 750,0 760,130 610,130" fill="#ccc8a0" opacity="0.06" />
      {/* Light glow cast on floor */}
      <polygon points="300,340 420,340 340,500 260,500" fill="#ccc8a0" opacity="0.03" />
      <polygon points="580,340 700,340 740,500 660,500" fill="#ccc8a0" opacity="0.03" />

      {/* ── WALL SIGNAGE (back wall) ── */}
      {/* Left sign */}
      <rect x="255" y="145" width="200" height="120" fill="#161412" stroke="#222018" strokeWidth="1" />
      <text x="355" y="175" textAnchor="middle" style={{ fontFamily: 'var(--f-admin)', fontSize: '15px', fill: '#4a4840', fontWeight: 700, letterSpacing: '1px' }}>YOUR PATIENCE</text>
      <text x="355" y="198" textAnchor="middle" style={{ fontFamily: 'var(--f-admin)', fontSize: '15px', fill: '#4a4840', fontWeight: 700, letterSpacing: '1px' }}>IS APPRECIATED.</text>
      <line x1="270" y1="210" x2="440" y2="210" stroke="#2a2820" strokeWidth="1" />
      <text x="355" y="228" textAnchor="middle" style={{ fontFamily: 'var(--f-mono)', fontSize: '9px', fill: '#343028', letterSpacing: '0.5px' }}>It will not affect</text>
      <text x="355" y="241" textAnchor="middle" style={{ fontFamily: 'var(--f-mono)', fontSize: '9px', fill: '#343028', letterSpacing: '0.5px' }}>processing time.</text>

      {/* Right sign */}
      <rect x="490" y="145" width="230" height="120" fill="#161412" stroke="#222018" strokeWidth="1" />
      <text x="605" y="170" textAnchor="middle" style={{ fontFamily: 'var(--f-admin)', fontSize: '13px', fill: '#4a4840', fontWeight: 700, letterSpacing: '0.5px' }}>APOLOGIES ARE</text>
      <text x="605" y="188" textAnchor="middle" style={{ fontFamily: 'var(--f-admin)', fontSize: '13px', fill: '#4a4840', fontWeight: 700, letterSpacing: '0.5px' }}>PROCESSED IN</text>
      <text x="605" y="206" textAnchor="middle" style={{ fontFamily: 'var(--f-admin)', fontSize: '13px', fill: '#4a4840', fontWeight: 700, letterSpacing: '0.5px' }}>ORDER OF</text>
      <text x="605" y="224" textAnchor="middle" style={{ fontFamily: 'var(--f-admin)', fontSize: '13px', fill: '#4a4840', fontWeight: 700, letterSpacing: '0.5px' }}>EMOTIONAL DAMAGE.</text>

      {/* ── COUNTER / DESK ── */}
      {/* Counter surface */}
      <polygon points="240,340 760,340 720,310 280,310" fill="#1c1a16" />
      {/* Counter front face */}
      <polygon points="240,340 760,340 760,370 240,370" fill="#161410" />
      {/* Counter top edge line */}
      <line x1="240" y1="310" x2="760" y2="310" stroke="#282420" strokeWidth="1" />

      {/* ── CLERK WINDOW ── */}
      {/* Window opening cut in counter area */}
      <rect x="620" y="218" width="130" height="95" fill="#100e0c" stroke="#1e1c18" strokeWidth="1" />
      {/* WINDOW 1 sign */}
      <rect x="625" y="222" width="120" height="18" fill="#141210" />
      <text x="685" y="234" textAnchor="middle" style={{ fontFamily: 'var(--f-mono)', fontSize: '9px', fill: '#3a3830', letterSpacing: '2px' }}>WINDOW 1</text>
      {/* Clerk pixel character in window */}
      <ClerkPixel x={670} y={250} />

      {/* ── LED DISPLAY (right wall) ── */}
      <rect x="775" y="90" width="185" height="145" fill="#090d09" stroke="#0f1a0f" strokeWidth="1.5" rx="2" />
      <rect x="775" y="90" width="185" height="28" fill="#0c140c" />
      <text x="867" y="109" textAnchor="middle" style={{ fontFamily: 'var(--f-mono)', fontSize: '10px', fill: '#2a4a2a', letterSpacing: '2px' }}>NOW SERVING</text>
      <text x="867" y="158" textAnchor="middle" style={{ fontFamily: 'var(--f-mono)', fontSize: '38px', fill: '#dd3333', fontWeight: 700, letterSpacing: '1px' }}>{serving}</text>
      <line x1="785" y1="168" x2="950" y2="168" stroke="#0f1a0f" strokeWidth="1" />
      <text x="867" y="182" textAnchor="middle" style={{ fontFamily: 'var(--f-mono)', fontSize: '9px', fill: '#2a4a2a', letterSpacing: '1px' }}>UP NEXT</text>
      {upNext.slice(0, 4).map((n, i) => (
        <text key={n} x="867" y={197 + i * 13} textAnchor="middle"
          style={{ fontFamily: 'var(--f-mono)', fontSize: '11px', fill: '#3a6a3a', letterSpacing: '1px' }}>
          {n}
        </text>
      ))}

      {/* ── TAKE A NUMBER KIOSK ── */}
      {/* Shadow on floor */}
      <ellipse cx="430" cy="450" rx="65" ry="16" fill="#0a0905" opacity="0.7" />
      {/* Kiosk body — main pillar */}
      <rect x="396" y="180" width="68" height="270" fill="#252320" />
      {/* Kiosk left side shadow */}
      <rect x="394" y="183" width="10" height="266" fill="#1c1b18" />
      {/* Kiosk front face */}
      <rect x="404" y="182" width="60" height="267" fill="#2c2a26" />
      {/* Top cap */}
      <rect x="392" y="177" width="76" height="8" fill="#1e1c18" />
      {/* Sign board on kiosk */}
      <rect x="407" y="190" width="54" height="80" fill="#181614" stroke="#222018" strokeWidth="0.5" />
      <text x="434" y="220" textAnchor="middle" style={{ fontFamily: 'var(--f-admin)', fontSize: '11px', fill: '#5a5648', fontWeight: 700, letterSpacing: '1px' }}>TAKE A</text>
      <text x="434" y="238" textAnchor="middle" style={{ fontFamily: 'var(--f-admin)', fontSize: '11px', fill: '#5a5648', fontWeight: 700, letterSpacing: '1px' }}>NUMBER</text>
      {/* Kiosk middle section */}
      <rect x="407" y="276" width="54" height="50" fill="#201e1c" />
      {/* Ticket slot opening */}
      <rect x="415" y="332" width="38" height="10" rx="2" fill="#111010" stroke="#1a1814" strokeWidth="0.5" />
      {/* Ticket hanging out */}
      <rect x="418" y="341" width="32" height="58" fill="#e8e2cc" rx="1" />
      {/* Ticket top tab */}
      <rect x="422" y="339" width="24" height="4" fill="#ddd7c0" />
      {/* Perforation line on ticket */}
      <line x1="418" y1="353" x2="450" y2="353" stroke="#ccc6b0" strokeWidth="0.5" strokeDasharray="2,2" />
      {/* A-047 on ticket */}
      <text x="434" y="380" textAnchor="middle" style={{ fontFamily: 'Courier Prime, monospace', fontSize: '13px', fill: '#1a1610', fontWeight: 700, letterSpacing: '1px' }}>A-047</text>
      {/* Base of kiosk */}
      <rect x="388" y="446" width="84" height="12" fill="#1e1c18" />
      <rect x="392" y="455" width="76" height="8" fill="#181614" />

      {/* ── WAITING CHAIRS ── */}
      {/* Back row — small, far away */}
      {[260, 313, 366, 419, 472, 525, 578].map((x, i) => (
        <g key={`back-${i}`}>
          <rect x={x} y={316} width={44} height={14} rx="1" fill="#1c1c2a" />
          <rect x={x} y={305} width={44} height={13} rx="1" fill="#181826" />
          <rect x={x + 3} y={328} width={5} height={12} fill="#141420" />
          <rect x={x + 36} y={328} width={5} height={12} fill="#141420" />
        </g>
      ))}

      {/* Middle row */}
      {[55, 120, 185].map((x, i) => (
        <g key={`mid-${i}`}>
          <rect x={x} y={360} width={55} height={18} rx="1" fill="#1c1c2c" />
          <rect x={x} y={345} width={55} height={17} rx="1" fill="#18182a" />
          <rect x={x + 3} y={376} width={6} height={18} fill="#141422" />
          <rect x={x + 46} y={376} width={6} height={18} fill="#141422" />
          {/* Armrests */}
          <rect x={x - 3} y={349} width={8} height={16} rx="1" fill="#16162a" />
          <rect x={x + 50} y={349} width={8} height={16} rx="1" fill="#16162a" />
        </g>
      ))}

      {/* ── PLANTS ── */}
      {/* Right corner plant */}
      <rect x="735" y="388" width="44" height="42" rx="2" fill="#2a1e12" />
      <rect x="730" y="382" width="54" height="8" rx="1" fill="#342616" />
      <rect x="739" y="390" width="44" height="7" fill="#1a1008" />
      {/* Stems */}
      <line x1="757" y1="381" x2="742" y2="330" stroke="#1e2e16" strokeWidth="2.5" />
      <line x1="757" y1="381" x2="772" y2="334" stroke="#1e2e16" strokeWidth="2.5" />
      <line x1="757" y1="381" x2="757" y2="320" stroke="#1e2e16" strokeWidth="2.5" />
      {/* Leaves */}
      <ellipse cx="740" cy="324" rx="20" ry="11" fill="#1e3018" transform="rotate(-25,740,324)" />
      <ellipse cx="773" cy="328" rx="20" ry="11" fill="#1a2c14" transform="rotate(22,773,328)" />
      <ellipse cx="757" cy="312" rx="17" ry="12" fill="#243820" />
      <ellipse cx="726" cy="348" rx="15" ry="8" fill="#1a2c14" transform="rotate(-35,726,348)" />

      {/* Left corner plant (smaller) */}
      <rect x="25" y="400" width="36" height="36" rx="2" fill="#241a0e" />
      <rect x="20" y="395" width="46" height="7" rx="1" fill="#2e2014" />
      <line x1="43" y1="394" x2="35" y2="354" stroke="#1a2812" strokeWidth="2" />
      <line x1="43" y1="394" x2="52" y2="357" stroke="#1a2812" strokeWidth="2" />
      <ellipse cx="34" cy="349" rx="16" ry="9" fill="#1e2e14" transform="rotate(-20,34,349)" />
      <ellipse cx="53" cy="352" rx="16" ry="9" fill="#1a2a12" transform="rotate(20,53,352)" />

      {/* ── FLOOR BASEBOARD at counter ── */}
      <polygon points="240,370 760,370 760,380 240,380" fill="#141210" />

      {/* ── AMBIENT LIGHT POOLS ── */}
      <ellipse cx="330" cy="420" rx="180" ry="40" fill="#ccc8a0" opacity="0.025" />
      <ellipse cx="670" cy="420" rx="180" ry="40" fill="#ccc8a0" opacity="0.025" />
    </svg>
  )
}

/* Pixel-art clerk head/body peeking through window */
function ClerkPixel({ x, y }: { x: number; y: number }) {
  const P = 5 // pixel size
  const grid = (col: number, row: number, color: string, w = 1, h = 1) => (
    <rect
      key={`${col}-${row}`}
      x={x + col * P}
      y={y + row * P}
      width={P * w}
      height={P * h}
      fill={color}
    />
  )

  return (
    <g>
      {/* Head */}
      {[...Array(6)].map((_, c) =>
        [...Array(5)].map((_, r) => grid(c - 3, r - 8, '#8a7560'))
      )}
      {/* Hair top */}
      {[...Array(6)].map((_, c) => grid(c - 3, -9, '#2a2018'))}
      {[...Array(6)].map((_, c) => grid(c - 3, -10, '#2a2018'))}
      {/* Eyes */}
      {grid(-1, -6, '#1a1612')}
      {grid(0, -6, '#1a1612')}
      {/* Suit body */}
      {[...Array(8)].map((_, c) =>
        [...Array(4)].map((_, r) => grid(c - 4, r - 4, '#1c1c28'))
      )}
      {/* Collar / shirt white */}
      {grid(-1, -4, '#d0ccb8')}
      {grid(0, -4, '#d0ccb8')}
      {/* Tie */}
      {grid(-1, -3, '#7a1a1a')}
      {grid(0, -3, '#7a1a1a')}
      {grid(-1, -2, '#7a1a1a')}
      {grid(0, -2, '#7a1a1a')}
    </g>
  )
}
