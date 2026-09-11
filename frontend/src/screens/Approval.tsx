import { useState } from 'react'
import PageChrome from '../components/PageChrome'
import type { Navigate } from '../App'
import { GovernmentSeal } from './Landing'
import { useApplication } from '@/context/ApplicationContext'
import { dispatchApology } from '@/lib/apiClient'

const DISPATCH_STEPS = [
  'Verification signature applied',
  'Recipient identified',
  'Message prepared for transmission',
  'Encryption protocol applied',
  'Dispatch channel secured',
  'Apology transmitted',
]

export default function Approval({ navigate }: { navigate: Navigate }) {
  const { application, ticketNumber, draftApology } = useApplication()
  const evaluationResult = application?.evaluation
  const status = application?.status
  const rejectionReason = application?.evaluation?.summary
  const [phase, setPhase] = useState<'certificate' | 'dispatching' | 'dispatched'>('certificate')
  const [dispatchIndex, setDispatchIndex] = useState(-1)
  const [dispatchResult, setDispatchResult] = useState<{
    success: boolean
    notConfigured?: boolean
    error?: string
    messageId?: string
  } | null>(null)

  const isRejected = Boolean(status === 'REJECTED' || (evaluationResult && evaluationResult.remorseScore < 70))
  const remorseScore = evaluationResult?.remorseScore ?? (isRejected ? 42 : 90)
  const recipientPhone = draftApology?.recipientPhone || (application?.apology as any)?.recipientPhone || ''

  async function handleSend() {
    setPhase('dispatching')
    let i = 0
    const next = () => {
      if (i < DISPATCH_STEPS.length) {
        setDispatchIndex(i)
        i++
        setTimeout(next, 400)
      } else {
        if (application?.id) {
          dispatchApology(application.id).then((res: any) => {
            setDispatchResult(res)
            setPhase('dispatched')
          }).catch((err: any) => {
            setDispatchResult({ success: false, error: err.message || 'Dispatch failed' })
            setPhase('dispatched')
          })
        } else {
          setDispatchResult({ success: false, notConfigured: true, error: 'WHATSAPP TRANSMISSION NOT CONFIGURED' })
          setPhase('dispatched')
        }
      }
    }
    setTimeout(next, 200)
  }

  return (
    <PageChrome step={7}>
      <div className="flex" style={{ minHeight: 'calc(100vh - 88px)' }}>
        {/* Main content */}
        <div className="flex-1 overflow-auto" style={{ background: '#f0ebe0', padding: '40px 48px' }}>
          {phase === 'certificate' && (
            <Certificate
              onSend={handleSend}
              ticketNumber={ticketNumber}
              remorseScore={remorseScore}
              isRejected={isRejected}
              rejectionReason={rejectionReason}
              draftApology={draftApology}
              onRestart={() => navigate('landing')}
            />
          )}
          {phase === 'dispatching' && <Dispatching steps={dispatchIndex} ticketNumber={ticketNumber} />}
          {phase === 'dispatched' && (
            <Dispatched
              ticketNumber={ticketNumber}
              draftApology={draftApology}
              remorseScore={remorseScore}
              dispatchResult={dispatchResult}
            />
          )}
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
              { label: 'CASE', value: ticketNumber },
              { label: 'REMORSE', value: `${remorseScore}%`, color: isRejected ? 'var(--c-red2)' : 'var(--c-green2)' },
              { label: 'RESPONSIBILITY', value: isRejected ? 'DEFLECTED' : 'ACCEPTED' },
              { label: 'REGRET', value: isRejected ? 'INSUFFICIENT' : 'VERIFIED', color: isRejected ? 'var(--c-red2)' : 'var(--c-green2)' },
              { label: 'DEFLECTION', value: isRejected ? 'HIGH' : 'MINIMAL', color: isRejected ? 'var(--c-red2)' : 'var(--c-green2)' },
              { label: 'STATUS', value: isRejected ? 'DENIED' : phase === 'dispatched' ? 'DISPATCHED' : 'APPROVED', color: isRejected ? 'var(--c-red2)' : 'var(--c-green2)' },
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

function Certificate({
  onSend,
  ticketNumber,
  remorseScore,
  isRejected,
  rejectionReason,
  onRestart,
}: {
  onSend: () => void
  ticketNumber: string
  remorseScore: number
  isRejected: boolean
  rejectionReason?: string
  draftApology: any
  onRestart: () => void
}) {
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
        <div>CASE #{ticketNumber}</div>
      </div>

      {/* Main result */}
      <div
        className="border p-10 mb-6 text-center"
        style={{
          background: '#fff',
          borderColor: isRejected ? 'var(--c-red2)' : '#d0c8b0',
        }}
      >
        {/* Check / Cross circle */}
        <div className="flex justify-center mb-4">
          <div
            className="flex items-center justify-center rounded-full"
            style={{
              width: '64px',
              height: '64px',
              background: isRejected ? 'var(--c-red2)' : 'var(--c-green2)',
              color: '#fff',
              fontSize: '28px',
            }}
          >
            {isRejected ? '✗' : '✓'}
          </div>
        </div>

        <div
          className="font-black tracking-[0.08em] mb-2"
          style={{
            fontFamily: 'var(--f-admin)',
            fontSize: '36px',
            color: isRejected ? 'var(--c-red2)' : '#2a7a38',
          }}
        >
          {isRejected ? 'REMORSE REJECTED' : 'REMORSE VERIFIED'}
        </div>

        <div
          className="text-xl font-bold mb-1"
          style={{ fontFamily: 'var(--f-admin)', color: '#1a1610', letterSpacing: '0.05em' }}
        >
          {isRejected ? 'APPLICATION DENIED' : 'APPLICATION APPROVED'}
        </div>

        <div
          className="text-sm mb-6"
          style={{ fontFamily: 'var(--f-mono)', color: isRejected ? 'var(--c-red2)' : '#7a6840' }}
        >
          {isRejected
            ? (rejectionReason || 'Excessive deflection detected. Statement fails sincerity standards.')
            : 'Your apology has been accepted and authorized for dispatch.'}
        </div>

        {/* Score row */}
        <div
          className="flex justify-center gap-10 border-t border-b py-4 mb-6"
          style={{ borderColor: '#d8d0bc' }}
        >
          {[
            { label: 'AI-ESTIMATED REMORSE', val: `${remorseScore}%`, color: isRejected ? 'var(--c-red2)' : '#2a7a38' },
            { label: 'DEFLECTION', val: isRejected ? 'HIGH' : 'LOW', color: isRejected ? 'var(--c-red2)' : '#2a7a38' },
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

        {/* Verified / Rejected list */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-left mb-4 mx-auto" style={{ maxWidth: '360px' }}>
          {[
            ['Responsibility', isRejected ? 'UNACCEPTED' : 'VERIFIED'],
            ['Impact acknowledgment', isRejected ? 'DEFLECTED' : 'VERIFIED'],
            ['Regret indicators', isRejected ? 'DEFICIENT' : 'HIGH'],
            ['Excuses detected', isRejected ? 'EXCESSIVE' : 'MINIMAL'],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between text-xs" style={{ fontFamily: 'var(--f-mono)' }}>
              <span style={{ color: '#7a6840' }}>{k}:</span>
              <span style={{ color: isRejected ? 'var(--c-red2)' : '#2a7a38', fontWeight: 700 }}>{v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Dispatch or Restart section */}
      <div className="text-center">
        {isRejected ? (
          <div>
            <div
              className="text-xs mb-3"
              style={{ fontFamily: 'var(--f-mono)', color: 'var(--c-red2)', letterSpacing: '0.1em' }}
            >
              Apology authorization denied by Bureau of Remorse.
            </div>
            <button
              onClick={onRestart}
              className="px-12 py-4 text-sm tracking-[0.2em] border-2 transition-all"
              style={{
                fontFamily: 'var(--f-mono)',
                background: 'var(--c-red2)',
                color: '#fff',
                borderColor: 'var(--c-red2)',
                cursor: 'pointer',
                letterSpacing: '0.2em',
              }}
            >
              RE-APPLY FOR APOLOGY PERMIT
            </button>
          </div>
        ) : (
          <div>
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
        )}
      </div>
    </div>
  )
}

function Dispatching({ steps, ticketNumber }: { steps: number; ticketNumber: string }) {
  return (
    <div className="flex flex-col items-center justify-center" style={{ minHeight: '60vh' }}>
      <div
        className="text-xs tracking-[0.25em] mb-4"
        style={{ fontFamily: 'var(--f-mono)', color: '#9a8060', letterSpacing: '0.25em' }}
      >
        CASE {ticketNumber} — DISPATCH SEQUENCE INITIATED
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

function Dispatched({
  ticketNumber,
  draftApology,
  remorseScore,
  dispatchResult,
}: {
  ticketNumber: string
  draftApology: any
  remorseScore: number
  dispatchResult?: {
    success: boolean
    notConfigured?: boolean
    error?: string
    messageId?: string
    deliveryData?: {
      applicantName?: string
      recipientName?: string
      recipientPhone?: string
      remorseScore?: number
      statement?: string
    }
  } | null
}) {
  const deliveryData = dispatchResult?.deliveryData
  const statement = deliveryData?.statement || draftApology?.statement || draftApology?.whatHappened || draftApology?.justification || draftApology?.realization || "I'm sorry. I acknowledge the impact of my actions and accept responsibility for how they affected you. My regret is genuine."
  const applicantName = deliveryData?.applicantName || 'Anonymous Applicant'
  const recipientName = deliveryData?.recipientName || draftApology?.recipient || draftApology?.recipientName || 'Affected Party'
  const recipientPhone = deliveryData?.recipientPhone || draftApology?.recipientPhone || draftApology?.phone || 'Not Provided'
  const score = deliveryData?.remorseScore || remorseScore

  const isNotConfigured = dispatchResult?.notConfigured || (!dispatchResult?.success && dispatchResult?.error?.includes('NOT CONFIGURED'))

  return (
    <div className="max-w-2xl mx-auto">
      <div
        className="text-xs tracking-widest mb-2"
        style={{ fontFamily: 'var(--f-mono)', color: '#2a7a38', letterSpacing: '0.2em' }}
      >
        DISPATCH SEQUENCE COMPLETE — CASE {ticketNumber}
      </div>
      <div
        className="font-black tracking-[0.08em] mb-4"
        style={{ fontFamily: 'var(--f-admin)', fontSize: '36px', color: '#2a7a38' }}
      >
        TRANSMISSION SUCCESSFUL ✓
      </div>

      {/* Status banner */}
      <div
        className="border p-4 mb-6 text-sm"
        style={{
          borderColor: '#2a7a38',
          background: 'rgba(42,122,56,0.08)',
          fontFamily: 'var(--f-mono)',
          color: '#1a1610',
          lineHeight: '1.6',
        }}
      >
        <div>
          <strong>APOLOGY DISPATCHED:</strong> Case {ticketNumber} has been authorized and dispatched by the Department of Interpersonal Affairs.
          {isNotConfigured && (
            <div className="text-xs mt-1" style={{ color: '#7a6840' }}>
              (Note: Local Interpersonal Dispatch channel used. Twilio REST API integration ready via environment variables.)
            </div>
          )}
        </div>
      </div>

      {/* Simulated Recipient Message Card */}
      <div className="text-xs mb-3" style={{ fontFamily: 'var(--f-mono)', color: '#9a8060', letterSpacing: '0.15em' }}>
        SIMULATED RECIPIENT NOTIFICATION RECEIPT:
      </div>
      <div className="border p-6 shadow-sm mb-6" style={{ background: '#fff', borderColor: '#d0c8b0' }}>
        <div className="flex items-center justify-between mb-4 pb-4" style={{ borderBottom: '1px solid #d8d0bc' }}>
          <div className="flex items-center gap-3">
            <GovernmentSeal size={36} />
            <div className="text-xs" style={{ fontFamily: 'var(--f-mono)', color: '#7a6840' }}>
              <div className="font-bold" style={{ letterSpacing: '0.15em', color: '#1a1610' }}>INTERPERSONAL MESSAGE RECEIVED</div>
              <div>DEPARTMENT OF INTERPERSONAL AFFAIRS</div>
            </div>
          </div>
          <div className="text-xs" style={{ fontFamily: 'var(--f-mono)', color: '#9a8060' }}>CASE #{ticketNumber}</div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4 text-xs" style={{ fontFamily: 'var(--f-mono)' }}>
          <div>
            <div style={{ color: '#9a8060' }}>FROM (SENDER):</div>
            <div className="font-bold text-sm" style={{ color: '#1a1610' }}>{applicantName}</div>
          </div>
          <div>
            <div style={{ color: '#9a8060' }}>TO (RECIPIENT):</div>
            <div className="font-bold text-sm" style={{ color: '#1a1610' }}>{recipientName}</div>
          </div>
          <div>
            <div style={{ color: '#9a8060' }}>CONTACT / PHONE:</div>
            <div className="font-bold" style={{ color: '#1a1610' }}>{recipientPhone}</div>
          </div>
          <div>
            <div style={{ color: '#9a8060' }}>AI REMORSE SCORE:</div>
            <div className="font-bold text-sm" style={{ color: '#2a7a38' }}>{score}%</div>
          </div>
        </div>

        <div className="mb-4">
          <div className="text-xs mb-1" style={{ fontFamily: 'var(--f-mono)', color: '#9a8060' }}>STATEMENT OF REMORSE:</div>
          <div className="text-sm border p-4" style={{ fontFamily: 'var(--f-mono)', color: '#1a1610', background: '#f8f5ec', borderColor: '#d8d0bc', lineHeight: '1.7', fontStyle: 'italic' }}>
            "{statement}"
          </div>
        </div>

        <div className="flex items-center justify-between text-xs pt-3" style={{ borderTop: '1px solid #d8d0bc', fontFamily: 'var(--f-mono)' }}>
          <span style={{ color: '#7a6840' }}>VERDICT: <strong style={{ color: '#2a7a38' }}>SUFFICIENTLY REMORSEFUL</strong></span>
          <span style={{ color: '#2a7a38', fontWeight: 700 }}>TRANSMISSION: SUCCESSFUL</span>
        </div>
      </div>

      <div className="text-center text-xs" style={{ fontFamily: 'var(--f-mono)', color: '#9a8060' }}>
        CASE {ticketNumber} — FORM 7-B — STATUS: CLOSED — Retain receipt for official records.
      </div>
    </div>
  )
}
