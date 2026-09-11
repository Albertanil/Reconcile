import { useState, useEffect } from 'react'
import PageChrome from '../components/PageChrome'
import type { Navigate } from '../App'

const CATEGORIES = [
  { label: 'RESPONSIBILITY', target: 94, color: 'var(--c-green2)' },
  { label: 'IMPACT ACKNOWLEDGMENT', target: 91, color: 'var(--c-green2)' },
  { label: 'REGRET INDICATORS', target: 88, color: 'var(--c-green2)' },
  { label: 'FUTURE PREVENTION', target: 86, color: 'var(--c-green2)' },
  { label: 'DEFLECTION INDEX', target: 4, color: 'var(--c-red2)', invert: true },
]

const TARGET_SCORE = 90
const THRESHOLD = 70

export default function Evaluation({ navigate }: { navigate: Navigate }) {
  const [score, setScore] = useState(0)
  const [bars, setBars] = useState(CATEGORIES.map(() => 0))
  const [stampVisible, setStampVisible] = useState(false)
  const [phase, setPhase] = useState<'counting' | 'bars' | 'stamp' | 'done'>('counting')

  useEffect(() => {
    // Phase 1: count up main score
    let current = 0
    const step = () => {
      current += Math.ceil((TARGET_SCORE - current) * 0.12) || 1
      if (current >= TARGET_SCORE) {
        setScore(TARGET_SCORE)
        setPhase('bars')
      } else {
        setScore(current)
        requestAnimationFrame(step)
      }
    }
    const t = setTimeout(() => requestAnimationFrame(step), 600)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (phase !== 'bars') return
    // Phase 2: animate bars one by one
    let i = 0
    const animateNext = () => {
      if (i >= CATEGORIES.length) {
        setTimeout(() => {
          setStampVisible(true)
          setPhase('stamp')
        }, 400)
        return
      }
      const idx = i
      let val = 0
      const target = CATEGORIES[idx].target
      const step = () => {
        val += Math.ceil((target - val) * 0.15) || 1
        if (val >= target) {
          setBars((b) => {
            const next = [...b]
            next[idx] = target
            return next
          })
          i++
          setTimeout(animateNext, 180)
        } else {
          setBars((b) => {
            const next = [...b]
            next[idx] = val
            return next
          })
          requestAnimationFrame(step)
        }
      }
      requestAnimationFrame(step)
    }
    animateNext()
  }, [phase])

  useEffect(() => {
    if (phase === 'stamp') {
      const t = setTimeout(() => setPhase('done'), 1200)
      return () => clearTimeout(t)
    }
  }, [phase])

  return (
    <PageChrome step={6}>
      <div className="flex" style={{ minHeight: 'calc(100vh - 88px)' }}>
        {/* Main evaluation area */}
        <div className="flex-1 overflow-auto" style={{ padding: '32px 40px' }}>
          {/* Header */}
          <div className="mb-10">
            <div
              className="text-xs tracking-[0.3em] mb-2"
              style={{ fontFamily: 'var(--f-mono)', color: 'var(--c-muted)' }}
            >
              CASE A-047 — BUREAU OF REMORSE ASSESSMENT
            </div>
            <div
              className="text-3xl font-bold tracking-[0.12em]"
              style={{ fontFamily: 'var(--f-admin)', color: 'var(--c-text)' }}
            >
              APOLOGY VERIFICATION COMPLETE
            </div>
          </div>

          {/* Central score + categories */}
          <div className="flex gap-10 items-start mb-10">
            {/* Large score */}
            <div
              className="flex-shrink-0 border flex flex-col items-center justify-center relative"
              style={{
                background: 'var(--c-panel)',
                borderColor: 'var(--c-border)',
                width: '240px',
                height: '240px',
              }}
            >
              {/* Corner marks */}
              {(['tl', 'tr', 'bl', 'br'] as const).map((pos) => (
                <div
                  key={pos}
                  className="absolute w-3 h-3"
                  style={{
                    top: pos.startsWith('t') ? 8 : 'auto',
                    bottom: pos.startsWith('b') ? 8 : 'auto',
                    left: pos.endsWith('l') ? 8 : 'auto',
                    right: pos.endsWith('r') ? 8 : 'auto',
                    borderTop: pos.startsWith('t') ? '1px solid var(--c-border2)' : 'none',
                    borderBottom: pos.startsWith('b') ? '1px solid var(--c-border2)' : 'none',
                    borderLeft: pos.endsWith('l') ? '1px solid var(--c-border2)' : 'none',
                    borderRight: pos.endsWith('r') ? '1px solid var(--c-border2)' : 'none',
                  }}
                />
              ))}
              <div
                className="text-xs tracking-[0.2em] mb-2"
                style={{ fontFamily: 'var(--f-mono)', color: 'var(--c-muted)' }}
              >
                AI-ESTIMATED REMORSE
              </div>
              <div
                className="font-black leading-none"
                style={{
                  fontFamily: 'var(--f-admin)',
                  fontSize: '80px',
                  color: score >= THRESHOLD ? 'var(--c-text)' : 'var(--c-red2)',
                  letterSpacing: '-0.02em',
                }}
              >
                {score}
                <span style={{ fontSize: '40px' }}>%</span>
              </div>
              <div
                className="text-xs mt-2"
                style={{
                  fontFamily: 'var(--f-mono)',
                  color: score >= THRESHOLD ? 'var(--c-green2)' : 'var(--c-red2)',
                  letterSpacing: '0.2em',
                }}
              >
                {score >= THRESHOLD ? 'ABOVE THRESHOLD' : 'BELOW THRESHOLD'}
              </div>
              <div
                className="absolute bottom-3 text-xs"
                style={{ fontFamily: 'var(--f-mono)', color: 'var(--c-muted2)', fontSize: '10px' }}
              >
                THRESHOLD: {THRESHOLD}%
              </div>
            </div>

            {/* Category bars */}
            <div className="flex-1">
              <div
                className="text-xs tracking-[0.2em] mb-4"
                style={{ fontFamily: 'var(--f-mono)', color: 'var(--c-muted)' }}
              >
                REMORSE BREAKDOWN — CATEGORY ANALYSIS
              </div>
              <div className="space-y-4">
                {CATEGORIES.map((cat, i) => (
                  <div key={cat.label}>
                    <div
                      className="flex justify-between items-baseline mb-1.5"
                      style={{ fontFamily: 'var(--f-mono)', fontSize: '11px' }}
                    >
                      <span style={{ color: 'var(--c-muted)', letterSpacing: '0.1em' }}>
                        {cat.label}
                      </span>
                      <span style={{ color: cat.color, fontWeight: 700 }}>
                        {bars[i]}%
                      </span>
                    </div>
                    <div
                      className="h-2 relative"
                      style={{ background: 'var(--c-border)', position: 'relative' }}
                    >
                      <div
                        style={{
                          height: '100%',
                          width: `${bars[i]}%`,
                          background: cat.color,
                          transition: 'none',
                        }}
                      />
                      {/* Threshold line */}
                      {!cat.invert && (
                        <div
                          className="absolute top-0 h-full w-px"
                          style={{ left: `${THRESHOLD}%`, background: 'var(--c-border2)' }}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Methodology note */}
              <div
                className="mt-4 text-xs"
                style={{ fontFamily: 'var(--f-mono)', color: 'var(--c-muted2)', lineHeight: '1.5' }}
              >
                Analysis based on D.I.A. Remorse Assessment Protocol v12.4. Scores represent
                AI-estimated sincerity across 847 linguistic and behavioral indicators. Results
                are final and non-negotiable.
              </div>
            </div>
          </div>

          {/* Approval stamp area */}
          {stampVisible && (
            <div
              className="border p-6 mb-6 flex items-center gap-6 stamp-appear"
              style={{ background: 'var(--c-panel)', borderColor: 'var(--c-border)' }}
            >
              <ApprovalStamp />
              <div>
                <div
                  className="text-xs mb-1"
                  style={{ fontFamily: 'var(--f-mono)', color: 'var(--c-muted)' }}
                >
                  OFFICIAL DETERMINATION
                </div>
                <div
                  className="text-3xl font-black tracking-[0.1em] mb-2"
                  style={{ fontFamily: 'var(--f-admin)', color: 'var(--c-green2)' }}
                >
                  STATUS: APPROVED ✓
                </div>
                <div
                  className="text-xs"
                  style={{ fontFamily: 'var(--f-mono)', color: 'var(--c-muted)', lineHeight: '1.6' }}
                >
                  CASE A-047 remorse score ({TARGET_SCORE}%) meets or exceeds the required threshold
                  ({THRESHOLD}%). This apology is hereby authorized for dispatch. Certificate valid for 30
                  days.
                </div>
              </div>
            </div>
          )}

          {/* Proceed button */}
          {phase === 'done' && (
            <div className="flex justify-between items-center fade-in">
              <div
                className="text-xs"
                style={{ fontFamily: 'var(--f-mono)', color: 'var(--c-muted2)' }}
              >
                CASE A-047 — EVALUATION COMPLETE — REF: DIA/7B/A047/EVL
              </div>
              <button
                onClick={() => navigate('approval')}
                className="px-10 py-3 text-xs tracking-[0.2em] border transition-all"
                style={{
                  fontFamily: 'var(--f-mono)',
                  background: 'var(--c-text)',
                  color: 'var(--c-bg)',
                  borderColor: 'var(--c-text)',
                  cursor: 'pointer',
                  letterSpacing: '0.2em',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = 'var(--c-text)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--c-text)'
                  e.currentTarget.style.color = 'var(--c-bg)'
                }}
              >
                PROCEED TO APPROVAL →
              </button>
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div
          className="flex-shrink-0 border-l flex flex-col"
          style={{
            width: '240px',
            background: 'var(--c-panel)',
            borderColor: 'var(--c-border)',
            padding: '24px 18px',
          }}
        >
          <div
            className="text-xs tracking-[0.2em] pb-4 border-b mb-4"
            style={{ borderColor: 'var(--c-border)', color: 'var(--c-muted)', fontFamily: 'var(--f-mono)' }}
          >
            EVALUATION RECORD
          </div>

          <div className="space-y-4 flex-1 text-xs" style={{ fontFamily: 'var(--f-mono)' }}>
            {[
              { label: 'CASE', value: 'A-047' },
              { label: 'FORM', value: '7-B' },
              { label: 'INTERVIEW', value: 'COMPLETED' },
              { label: 'QUESTIONS', value: '7 / 7' },
              { label: 'SINCERITY FLAGS', value: 'ON FILE' },
              { label: 'PROTOCOL', value: 'RAP v12.4' },
              { label: 'RESULT', value: 'APPROVED', color: 'var(--c-green2)' },
            ].map((row) => (
              <div key={row.label}>
                <div style={{ color: 'var(--c-muted)' }}>{row.label}</div>
                <div style={{ color: row.color || 'var(--c-text)' }}>{row.value}</div>
              </div>
            ))}
          </div>

          <div
            className="mt-4 pt-4 border-t text-xs"
            style={{
              borderColor: 'var(--c-border)',
              fontFamily: 'var(--f-mono)',
              color: 'var(--c-muted2)',
              lineHeight: '1.5',
            }}
          >
            This evaluation does not guarantee the apology will be accepted by the recipient.
            Recipient response is outside our jurisdiction.
          </div>
        </div>
      </div>
    </PageChrome>
  )
}

function ApprovalStamp() {
  return (
    <svg width="90" height="90" viewBox="0 0 90 90" style={{ flexShrink: 0 }}>
      <rect
        x="2"
        y="2"
        width="86"
        height="86"
        fill="none"
        stroke="var(--c-green2)"
        strokeWidth="2"
      />
      <rect
        x="6"
        y="6"
        width="78"
        height="78"
        fill="none"
        stroke="var(--c-green2)"
        strokeWidth="0.5"
        opacity="0.5"
      />
      <text
        x="45"
        y="32"
        textAnchor="middle"
        style={{ fontFamily: 'var(--f-admin)', fontSize: '9px', fill: 'var(--c-green2)', letterSpacing: '2px' }}
      >
        D.I.A.
      </text>
      <text
        x="45"
        y="52"
        textAnchor="middle"
        style={{ fontFamily: 'var(--f-admin)', fontSize: '18px', fill: 'var(--c-green2)', fontWeight: 800, letterSpacing: '1px' }}
      >
        APPROVED
      </text>
      <text
        x="45"
        y="66"
        textAnchor="middle"
        style={{ fontFamily: 'var(--f-mono)', fontSize: '7px', fill: 'var(--c-green2)', letterSpacing: '1px' }}
      >
        CASE A-047
      </text>
      <text
        x="45"
        y="77"
        textAnchor="middle"
        style={{ fontFamily: 'var(--f-mono)', fontSize: '6px', fill: 'var(--c-green2)', opacity: 0.7, letterSpacing: '0.5px' }}
      >
        FORM 7-B REV.14
      </text>
    </svg>
  )
}
