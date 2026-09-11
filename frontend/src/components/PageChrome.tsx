import type { ReactNode } from 'react'
import { useApplication } from '@/context/ApplicationContext'

const STEPS = [
  'REGISTRATION',
  'QUEUE',
  'APPLICATION',
  'SUBMISSION',
  'INTERVIEW',
  'EVALUATION',
  'APPROVAL',
]

interface Props {
  step?: number
  children: ReactNode
}

export default function PageChrome({ step = 0, children }: Props) {
  const { ticketNumber } = useApplication()

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top header */}
      <header
        className="flex items-center justify-between px-6 py-2 border-b flex-shrink-0"
        style={{
          background: 'var(--c-panel)',
          borderColor: 'var(--c-border)',
          fontFamily: 'var(--f-mono)',
          fontSize: '11px',
          color: 'var(--c-muted)',
        }}
      >
        <div className="flex items-center gap-5">
          <span
            style={{ color: 'var(--c-text)', fontWeight: 700, letterSpacing: '0.2em', fontSize: '12px' }}
          >
            D.I.A.
          </span>
          <span style={{ color: 'var(--c-border2)' }}>|</span>
          <span style={{ letterSpacing: '0.15em' }}>DEPARTMENT OF INTERPERSONAL AFFAIRS</span>
          <span style={{ color: 'var(--c-border2)' }}>|</span>
          <span>RECONCILE SYS v4.7</span>
        </div>
        <div className="flex items-center gap-5">
          <span>
            CASE:{' '}
            <span style={{ color: 'var(--c-amber)' }}>{ticketNumber}</span>
          </span>
          <span style={{ color: 'var(--c-border2)' }}>|</span>
          <span>FORM 7-B</span>
          <span style={{ color: 'var(--c-border2)' }}>|</span>
          <span className="flex items-center gap-1.5">
            <span
              className="inline-block w-1.5 h-1.5 rounded-full"
              style={{ background: 'var(--c-green2)' }}
            />
            SYS: OPERATIONAL
          </span>
        </div>
      </header>

      {/* Step breadcrumb */}
      {step > 0 && (
        <div
          className="flex items-center gap-0 px-6 py-1.5 border-b flex-shrink-0 overflow-x-auto"
          style={{
            background: 'var(--c-panel)',
            borderColor: 'var(--c-border)',
            fontFamily: 'var(--f-mono)',
            fontSize: '10px',
            color: 'var(--c-muted2)',
          }}
        >
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center">
              <span
                style={{
                  color:
                    i + 1 === step
                      ? 'var(--c-amber)'
                      : i + 1 < step
                        ? 'var(--c-muted)'
                        : 'var(--c-muted2)',
                  fontWeight: i + 1 === step ? 700 : 400,
                  letterSpacing: '0.12em',
                  whiteSpace: 'nowrap',
                }}
              >
                {String(i + 1).padStart(2, '0')} {s}
              </span>
              {i < STEPS.length - 1 && (
                <span className="mx-3" style={{ color: 'var(--c-border2)' }}>
                  ——
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Content */}
      <main className="flex-1 overflow-auto">{children}</main>

      {/* Footer */}
      <footer
        className="flex items-center justify-between px-6 py-1.5 border-t flex-shrink-0"
        style={{
          background: 'var(--c-panel)',
          borderColor: 'var(--c-border)',
          fontFamily: 'var(--f-mono)',
          fontSize: '10px',
          color: 'var(--c-muted2)',
        }}
      >
        <span>JURISDICTION: INTERPERSONAL — D.I.A./RECONCILE/FORM-7B</span>
        <span>SYS VER 4.7.2 — BUILD 20XX-A</span>
        <span>ENCRYPTED CHANNEL — RETAIN FOR YOUR RECORDS</span>
      </footer>
    </div>
  )
}
