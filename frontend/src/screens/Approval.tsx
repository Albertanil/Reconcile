import { useState } from 'react'
import PageChrome from '../components/PageChrome'
import type { Navigate } from '../App'
import { GovernmentSeal } from './Landing'

const DISPATCH_STEPS = [
  'Verification signature applied',
  'Recipient identified',
  'Message prepared for transmission',
  'Encryption protocol applied',
  'Dispatch channel secured',
  'Apology transmitted',
]

export default function Approval({ navigate: _navigate }: { navigate: Navigate }) {
  const [phase, setPhase] = useState<'certificate' | 'dispatching' | 'dispatched'>('certificate')
  const [dispatchIndex, setDispatchIndex] = useState(-1)

  function handleSend() {
    setPhase('dispatching')
    let i = 0
    const next = () => {
      if (i < DISPATCH_STEPS.length) {
        setDispatchIndex(i)
        i++
        setTimeout(next, 480)
      } else {
        setTimeout(() => setPhase('dispatched'), 500)
      }
    }
    setTimeout(next, 300)
  }

  return (
    <PageChrome step={7}>
      <div className="flex" style={{ minHeight: 'calc(100vh - 88px)' }}>
        {/* Main content */}
        <div className="flex-1 overflow-auto" style={{ background: '#f0ebe0', padding: '40px 48px' }}>
          {phase === 'certificate' && <Certificate onSend={handleSend} />}
          {phase === 'dispatching' && <Dispatching steps={dispatchIndex} />}
          {phase === 'dispatched' && <Dispatched />}
        </div>

        {/* Right sidebar */}
        <div
          className="flex-shrink-0 border-l flex flex-col"
          style={{
            width: '220px',
            background: 'var(--c-panel)',
            borderColor: 'var(--c-border)',
            padding: '24px 18px',
          }}
        >
          <div
            className="text-xs tracking-[0.2em] pb-4 border-b mb-4"
            style={{ borderColor: 'var(--c-border)', color: 'var(--c-muted)', fontFamily: 'var(--f-mono)' }}
          >
            AUTHORIZATION
          </div>
          <div className="space-y-4 flex-1 text-xs" style={{ fontFamily: 'var(--f-mono)' }}>
            {[
              { label: 'CASE', value: 'A-047' },
              { label: 'REMORSE', value: '90%', color: 'var(--c-green2)' },
              { label: 'RESPONSIBILITY', value: 'ACCEPTED' },
              { label: 'REGRET', value: 'VERIFIED', color: 'var(--c-green2)' },
              { label: 'DEFLECTION', value: 'MINIMAL', color: 'var(--c-green2)' },
              { label: 'STATUS', value: phase === 'dispatched' ? 'DISPATCHED' : 'APPROVED', color: 'var(--c-green2)' },
            ].map((row) => (
              <div key={row.label}>
                <div style={{ color: 'var(--c-muted)' }}>{row.label}</div>
                <div style={{ color: row.color || 'var(--c-text)' }}>{row.value}</div>
              </div>
            ))}
          </div>
          <div
            className="mt-4 pt-4 border-t text-xs"
            style={{ borderColor: 'var(--c-border)', fontFamily: 'var(--f-mono)', color: 'var(--c-muted2)', lineHeight: '1.6' }}
          >
            Whether they forgive you is outside our jurisdiction.
          </div>
        </div>
      </div>
    </PageChrome>
  )
}

function Certificate({ onSend }: { onSend: () => void }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header identifiers */}
      <div className="flex items-center justify-between mb-6 text-xs" style={{ fontFamily: 'var(--f-mono)', color: '#9a8060' }}>
        <div className="flex items-center gap-3">
          <GovernmentSeal size={36} />
          <div>
            <div style={{ letterSpacing: '0.15em' }}>DEPARTMENT OF INTERPERSONAL AFFAIRS</div>
          </div>
        </div>
        <div>CASE #A-047</div>
      </div>

      {/* Main result */}
      <div
        className="border p-10 mb-6 text-center"
        style={{ background: '#fff', borderColor: '#d0c8b0' }}
      >
        {/* Green check circle */}
        <div className="flex justify-center mb-4">
          <div
            className="flex items-center justify-center rounded-full"
            style={{
              width: '64px',
              height: '64px',
              background: 'var(--c-green2)',
              color: '#fff',
              fontSize: '28px',
            }}
          >
            ✓
          </div>
        </div>

        <div
          className="font-black tracking-[0.08em] mb-2"
          style={{ fontFamily: 'var(--f-admin)', fontSize: '36px', color: '#2a7a38' }}
        >
          REMORSE VERIFIED
        </div>

        <div
          className="text-xl font-bold mb-1"
          style={{ fontFamily: 'var(--f-admin)', color: '#1a1610', letterSpacing: '0.05em' }}
        >
          APPLICATION APPROVED
        </div>

        <div
          className="text-sm mb-6"
          style={{ fontFamily: 'var(--f-mono)', color: '#7a6840' }}
        >
          Your apology has been accepted.
        </div>

        {/* Score row */}
        <div
          className="flex justify-center gap-10 border-t border-b py-4 mb-6"
          style={{ borderColor: '#d8d0bc' }}
        >
          {[
            { label: 'AI-ESTIMATED REMORSE', val: '90%', color: '#2a7a38' },
            { label: 'DEFLECTION', val: 'LOW', color: '#2a7a38' },
            { label: 'FORM', val: '7-B', color: '#7a6840' },
          ].map((item) => (
            <div key={item.label} className="text-center">
              <div className="text-xs mb-1" style={{ fontFamily: 'var(--f-mono)', color: '#9a8060', letterSpacing: '0.1em' }}>
                {item.label}
              </div>
              <div className="text-2xl font-bold" style={{ fontFamily: 'var(--f-admin)', color: item.color }}>
                {item.val}
              </div>
            </div>
          ))}
        </div>

        {/* Verified list */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-left mb-4 mx-auto" style={{ maxWidth: '360px' }}>
          {[
            ['Responsibility', 'VERIFIED'],
            ['Impact acknowledgment', 'VERIFIED'],
            ['Regret indicators', 'HIGH'],
            ['Excuses detected', 'MINIMAL'],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between text-xs" style={{ fontFamily: 'var(--f-mono)' }}>
              <span style={{ color: '#7a6840' }}>{k}:</span>
              <span style={{ color: '#2a7a38', fontWeight: 700 }}>{v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Dispatch section */}
      <div className="text-center">
        <div
          className="text-xs mb-3"
          style={{ fontFamily: 'var(--f-mono)', color: '#9a8060', letterSpacing: '0.1em' }}
        >
          Dispatch your apology?
        </div>
        <button
          onClick={onSend}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          className="px-12 py-4 text-sm tracking-[0.2em] border-2 transition-all"
          style={{
            fontFamily: 'var(--f-mono)',
            background: hovered ? 'transparent' : '#1a1610',
            color: hovered ? '#1a1610' : '#ddd8c4',
            borderColor: '#1a1610',
            cursor: 'pointer',
            letterSpacing: '0.2em',
          }}
        >
          SEND SMS
        </button>
        <div
          className="text-xs mt-2"
          style={{ fontFamily: 'var(--f-mono)', color: '#9a8060', fontStyle: 'italic' }}
        >
          A small message for a slightly better tomorrow.
        </div>
      </div>
    </div>
  )
}

function Dispatching({ steps }: { steps: number }) {
  return (
    <div className="flex flex-col items-center justify-center" style={{ minHeight: '60vh' }}>
      <div
        className="text-xs tracking-[0.25em] mb-4"
        style={{ fontFamily: 'var(--f-mono)', color: '#9a8060', letterSpacing: '0.25em' }}
      >
        CASE A-047 — DISPATCH SEQUENCE INITIATED
      </div>
      <div
        className="font-black tracking-[0.08em] mb-10"
        style={{ fontFamily: 'var(--f-admin)', fontSize: '32px', color: '#1a1610' }}
      >
        DISPATCHING<span className="cursor" />
      </div>
      <div
        className="border p-6 w-full max-w-md"
        style={{ background: '#fff', borderColor: '#d0c8b0' }}
      >
        <div className="space-y-3">
          {DISPATCH_STEPS.map((step, i) => (
            <div key={i} className="flex items-center gap-3 text-sm" style={{ fontFamily: 'var(--f-mono)', opacity: i <= steps ? 1 : 0.3 }}>
              <span style={{ color: i <= steps ? '#2a7a38' : '#b0a890', fontWeight: 700, width: '16px', flexShrink: 0 }}>
                {i <= steps ? '✓' : '·'}
              </span>
              <span style={{ color: i <= steps ? '#1a1610' : '#9a8870' }}>{step}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function Dispatched() {
  return (
    <div className="max-w-2xl mx-auto">
      <div
        className="text-xs tracking-widest mb-2"
        style={{ fontFamily: 'var(--f-mono)', color: '#2a7a38', letterSpacing: '0.2em' }}
      >
        DISPATCH COMPLETE — CASE A-047 CLOSED
      </div>
      <div
        className="font-black tracking-[0.08em] mb-6"
        style={{ fontFamily: 'var(--f-admin)', fontSize: '36px', color: '#2a7a38' }}
      >
        APOLOGY DISPATCHED ✓
      </div>

      <div
        className="border p-4 mb-6 text-sm"
        style={{ borderColor: '#2a7a38', background: 'rgba(42,122,56,0.06)', fontFamily: 'var(--f-mono)', color: '#1a1610', lineHeight: '1.6' }}
      >
        The recipient has received your apology. Case A-047 is now closed.
      </div>

      {/* Recipient preview */}
      <div className="text-xs mb-3" style={{ fontFamily: 'var(--f-mono)', color: '#9a8060', letterSpacing: '0.15em' }}>
        RECIPIENT-FACING NOTIFICATION:
      </div>
      <div className="border p-6" style={{ background: '#fff', borderColor: '#d0c8b0' }}>
        <div className="flex items-center justify-between mb-4 pb-4" style={{ borderBottom: '1px solid #d8d0bc' }}>
          <div className="flex items-center gap-2">
            <GovernmentSeal size={36} />
            <div className="text-xs" style={{ fontFamily: 'var(--f-mono)', color: '#7a6840' }}>
              <div style={{ letterSpacing: '0.15em' }}>DEPARTMENT OF INTERPERSONAL AFFAIRS</div>
              <div>APOLOGY VERIFICATION RESULT</div>
            </div>
          </div>
          <div className="text-xs" style={{ fontFamily: 'var(--f-mono)', color: '#9a8060' }}>CASE: A-047</div>
        </div>

        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center justify-center rounded-full flex-shrink-0" style={{ width: '36px', height: '36px', background: '#2a7a38', color: '#fff', fontSize: '16px' }}>✓</div>
          <div>
            <div className="font-black" style={{ fontFamily: 'var(--f-admin)', fontSize: '20px', color: '#2a7a38' }}>REMORSE VERIFIED</div>
            <div className="text-xs" style={{ fontFamily: 'var(--f-mono)', color: '#7a6840' }}>AI-Estimated Remorse: 90% · Deflection: LOW</div>
          </div>
        </div>

        <div className="text-sm border p-3 mb-4" style={{ fontFamily: 'var(--f-mono)', color: '#1a1610', background: '#f5f0e4', borderColor: '#d8d0bc', lineHeight: '1.7', fontStyle: 'italic' }}>
          "I'm sorry. I acknowledge the impact of my actions and accept responsibility for how they affected you. My regret is genuine."
        </div>

        <div className="text-center text-xs italic pt-4" style={{ borderTop: '1px solid #d8d0bc', fontFamily: 'var(--f-mono)', color: '#9a8060' }}>
          Whether you accept this apology is outside our jurisdiction.
        </div>
      </div>

      <div className="mt-4 text-xs" style={{ fontFamily: 'var(--f-mono)', color: '#9a8060' }}>
        CASE A-047 — FORM 7-B — STATUS: CLOSED — To initiate a new apology, obtain a fresh Form 7-B.
      </div>
    </div>
  )
}
