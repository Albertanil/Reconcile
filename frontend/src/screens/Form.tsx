import { useState, useRef } from 'react'
import PageChrome from '../components/PageChrome'
import type { Navigate } from '../App'
import { GovernmentSeal } from './Landing'

interface InlineWarning {
  text: string
  type: 'warn' | 'ok' | 'info'
}

export default function Form({ navigate }: { navigate: Navigate }) {
  const [what, setWhat] = useState('I forgot to reply to your message')
  const [when, setWhen] = useState('eventually')
  const [understood, setUnderstood] = useState('')
  const [responsible, setResponsible] = useState(50)
  const [responsibleDirty, setResponsibleDirty] = useState(false)
  const [circumstances, setCircumstances] = useState('')
  const [justified, setJustified] = useState('')

  // Inline warnings per field
  const [whenWarn, setWhenWarn] = useState<InlineWarning | null>(null)
  const [sliderWarn, setSliderWarn] = useState<InlineWarning | null>(null)
  const [justWarn, setJustWarn] = useState<InlineWarning | null>(null)

  const startTime = useRef(Date.now())

  function handleWhen(v: string) {
    setWhen(v)
    if (v === 'wrong') {
      setWhenWarn({ text: 'This position is incompatible with the apology process.', type: 'warn' })
    } else if (v === 'eventually') {
      setWhenWarn({ text: 'This answer raises concerns. Please provide a more detailed timeline of your realization.', type: 'warn' })
    } else if (v === 'confronted') {
      setWhenWarn({ text: 'External prompting noted. Self-awareness score reduced.', type: 'info' })
    } else {
      setWhenWarn({ text: 'Response noted. Processing.', type: 'ok' })
    }
  }

  function handleResponsible(v: number) {
    setResponsible(v)
    setResponsibleDirty(true)
    if (v === 82 || (v > 79 && v < 85 && responsibleDirty)) {
      setSliderWarn({ text: `${v}%? Suspiciously precise. Please explain why you are exactly ${v}% sorry.`, type: 'warn' })
    } else if (v < 30) {
      setSliderWarn({ text: 'Insufficient. Minimum responsibility threshold: 30%.', type: 'warn' })
    } else if (v === 100) {
      setSliderWarn({ text: '100% is statistically improbable. Flagged for review.', type: 'info' })
    } else {
      setSliderWarn(null)
    }
  }

  function handleJustified(v: string) {
    setJustified(v)
    if (v === 'partial') {
      setJustWarn({ text: 'POSSIBLE DEFLECTION DETECTED — partial justification flagged.', type: 'warn' })
    } else if (v === 'yes') {
      setJustWarn({ text: 'CONTRADICTION DETECTED — apology eligibility under review.', type: 'warn' })
    } else {
      setJustWarn({ text: 'FIELD ACCEPTED.', type: 'ok' })
    }
  }

  const canProceed = what.length > 5 && when && understood

  return (
    <PageChrome step={3}>
      <div className="flex gap-0" style={{ minHeight: 'calc(100vh - 88px)' }}>
        {/* Paper form */}
        <div
          className="flex-1 overflow-auto"
          style={{ background: '#f0ebe0', padding: '32px 40px' }}
        >
          {/* Form header */}
          <div
            className="flex items-start justify-between pb-5 mb-6"
            style={{ borderBottom: '2px solid #c8c0a8' }}
          >
            <div className="flex items-center gap-4">
              <GovernmentSeal size={52} />
              <div>
                <div
                  className="text-xs tracking-[0.15em] mb-0.5"
                  style={{ fontFamily: 'var(--f-mono)', color: '#7a6840', letterSpacing: '0.18em' }}
                >
                  DEPARTMENT OF INTERPERSONAL AFFAIRS
                </div>
                <div
                  className="text-xl font-bold tracking-wide"
                  style={{ fontFamily: 'var(--f-admin)', color: '#1a1610' }}
                >
                  APOLOGY VERIFICATION APPLICATION
                </div>
              </div>
            </div>
            <div
              className="text-right text-xs"
              style={{ fontFamily: 'var(--f-mono)', color: '#7a6840' }}
            >
              <div className="font-bold text-sm" style={{ color: '#1a1610' }}>FORM 7-B</div>
              <div>(Mandatory fields: 47)</div>
            </div>
          </div>

          {/* Section 1 — Incident Details */}
          <PaperSection num="1." title="INCIDENT DETAILS">
            <PaperFieldLabel label="What did you do?" />
            <input
              type="text"
              className="gov-input-paper"
              value={what}
              onChange={(e) => setWhat(e.target.value)}
              style={{ marginBottom: '20px' }}
            />

            <PaperFieldLabel label="When did you realize you were wrong?" />
            <div className="space-y-2 mb-2">
              {[
                { v: 'immediately', label: 'Immediately' },
                { v: 'eventually', label: 'Eventually' },
                { v: 'confronted', label: 'After being confronted' },
                { v: 'wrong', label: 'I still don\'t think I\'m wrong' },
              ].map((opt) => (
                <label
                  key={opt.v}
                  className="flex items-center gap-2 text-sm cursor-pointer"
                  style={{ fontFamily: 'var(--f-mono)', color: '#2a2010' }}
                >
                  <input
                    type="radio"
                    name="when"
                    value={opt.v}
                    checked={when === opt.v}
                    onChange={() => handleWhen(opt.v)}
                    style={{ accentColor: '#7a5a20', flexShrink: 0 }}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
            {whenWarn && <InlineWarn warn={whenWarn} />}
          </PaperSection>

          {/* Section 2 — Responsibility */}
          <PaperSection num="2." title="RESPONSIBILITY ASSESSMENT">
            <PaperFieldLabel label="Did you understand the impact of your actions?" />
            <div className="flex gap-6 mb-4">
              {['Yes', 'No'].map((v) => (
                <label
                  key={v}
                  className="flex items-center gap-2 text-sm cursor-pointer"
                  style={{ fontFamily: 'var(--f-mono)', color: '#2a2010' }}
                >
                  <input
                    type="radio"
                    name="understood"
                    value={v.toLowerCase()}
                    checked={understood === v.toLowerCase()}
                    onChange={() => setUnderstood(v.toLowerCase())}
                    style={{ accentColor: '#7a5a20' }}
                  />
                  {v}
                </label>
              ))}
            </div>

            <PaperFieldLabel label={`Rate your current remorse (on a scale of 0–100).`} />
            <div className="flex items-center gap-4 mb-2">
              <input
                type="range"
                min={0}
                max={100}
                value={responsible}
                onChange={(e) => handleResponsible(Number(e.target.value))}
                className="gov-slider-paper flex-1"
              />
              <div
                className="border text-center font-bold"
                style={{
                  fontFamily: 'var(--f-mono)',
                  color: '#1a1610',
                  borderColor: '#c0b898',
                  background: '#ede7d4',
                  padding: '4px 12px',
                  minWidth: '50px',
                  fontSize: '15px',
                }}
              >
                {responsible}
              </div>
            </div>
            {sliderWarn && <InlineWarn warn={sliderWarn} />}

            <div className="mt-4">
              <PaperFieldLabel label="Were there external circumstances? (Optional — subject to deflection analysis)" />
              <textarea
                className="gov-textarea-paper"
                rows={2}
                value={circumstances}
                onChange={(e) => setCircumstances(e.target.value)}
                placeholder="Describe any mitigating context..."
              />
            </div>

            <div className="mt-4">
              <PaperFieldLabel label="Do you believe your actions were justified?" />
              <div className="space-y-2 mt-2">
                {[
                  { v: 'no', label: 'No, they were not justified' },
                  { v: 'partial', label: 'Partially justified' },
                  { v: 'yes', label: 'Yes, actually' },
                ].map((opt) => (
                  <label
                    key={opt.v}
                    className="flex items-center gap-2 text-sm cursor-pointer"
                    style={{ fontFamily: 'var(--f-mono)', color: '#2a2010' }}
                  >
                    <input
                      type="radio"
                      name="justified"
                      value={opt.v}
                      checked={justified === opt.v}
                      onChange={() => handleJustified(opt.v)}
                      style={{ accentColor: '#7a5a20' }}
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
              {justWarn && <InlineWarn warn={justWarn} />}
            </div>
          </PaperSection>

          {/* Continue button */}
          <div className="flex items-center justify-end gap-4 mt-6">
            <div
              className="text-xs"
              style={{ fontFamily: 'var(--f-mono)', color: '#9a8060' }}
            >
              Fields 1–9 of 47. Supplemental forms available on request.
            </div>
            <button
              onClick={() => canProceed && navigate('submission')}
              disabled={!canProceed}
              className="px-8 py-3 text-xs tracking-[0.15em] border transition-all"
              style={{
                fontFamily: 'var(--f-mono)',
                background: canProceed ? '#1a1610' : 'transparent',
                color: canProceed ? '#ddd8c4' : '#a09070',
                borderColor: canProceed ? '#1a1610' : '#c0b898',
                cursor: canProceed ? 'pointer' : 'not-allowed',
                letterSpacing: '0.15em',
              }}
            >
              CONTINUE TO STATEMENT →
            </button>
          </div>
        </div>

        {/* Right sidebar — system monitor */}
        <div
          className="flex-shrink-0 border-l flex flex-col"
          style={{
            width: '260px',
            background: 'var(--c-panel)',
            borderColor: 'var(--c-border)',
            padding: '24px 18px',
          }}
        >
          <div
            className="text-xs tracking-[0.2em] pb-4 border-b mb-4"
            style={{ borderColor: 'var(--c-border)', color: 'var(--c-muted)', fontFamily: 'var(--f-mono)' }}
          >
            SYSTEM ANALYSIS
          </div>
          <div
            className="text-xs space-y-3 pb-4 border-b mb-4"
            style={{ fontFamily: 'var(--f-mono)', borderColor: 'var(--c-border)' }}
          >
            <div className="flex justify-between">
              <span style={{ color: 'var(--c-muted)' }}>CASE:</span>
              <span style={{ color: 'var(--c-text)' }}>A-047</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: 'var(--c-muted)' }}>FIELDS DONE:</span>
              <span style={{ color: 'var(--c-text)' }}>
                {[what, when, understood].filter(Boolean).length}/47
              </span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: 'var(--c-muted)' }}>RESPONSIBILITY:</span>
              <span style={{ color: responsible < 30 ? 'var(--c-red2)' : responsible >= 70 ? 'var(--c-green2)' : 'var(--c-amber)' }}>
                {responsible}%
              </span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: 'var(--c-muted)' }}>FLAGS:</span>
              <span style={{ color: [whenWarn, sliderWarn, justWarn].filter(w => w?.type === 'warn').length > 0 ? 'var(--c-red2)' : 'var(--c-muted2)' }}>
                {[whenWarn, sliderWarn, justWarn].filter(w => w?.type === 'warn').length}
              </span>
            </div>
          </div>
          <div
            className="text-xs"
            style={{ fontFamily: 'var(--f-mono)', color: 'var(--c-muted2)', lineHeight: '1.6' }}
          >
            Responses are monitored in real time. Suspicious patterns are automatically flagged
            and forwarded to the Bureau of Contradiction Analysis.
          </div>
        </div>
      </div>
    </PageChrome>
  )
}

function PaperSection({ num, title, children }: { num: string; title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <div
        className="text-lg font-bold mb-4"
        style={{ fontFamily: 'var(--f-admin)', color: '#1a1610', letterSpacing: '0.05em' }}
      >
        {num} {title}
      </div>
      {children}
      <div className="mt-6 border-t" style={{ borderColor: '#d0c8b0' }} />
    </div>
  )
}

function PaperFieldLabel({ label }: { label: string }) {
  return (
    <div
      className="text-xs mb-2"
      style={{ fontFamily: 'var(--f-mono)', color: '#5a4a28', letterSpacing: '0.05em' }}
    >
      {label}
    </div>
  )
}

function InlineWarn({ warn }: { warn: { text: string; type: 'warn' | 'ok' | 'info' } }) {
  const colors = {
    warn: { border: '#cc3636', bg: 'rgba(204,54,54,0.06)', text: '#cc3636', icon: '!' },
    ok: { border: '#4a8a50', bg: 'rgba(74,138,80,0.06)', text: '#4a8a50', icon: '✓' },
    info: { border: '#9a7c2e', bg: 'rgba(154,124,46,0.06)', text: '#9a7c2e', icon: '▸' },
  }
  const c = colors[warn.type]
  return (
    <div
      className="flex items-start gap-2 p-3 border mt-2 slide-in text-xs"
      style={{
        borderColor: c.border,
        background: c.bg,
        color: c.text,
        fontFamily: 'var(--f-mono)',
        lineHeight: '1.5',
      }}
    >
      <span className="font-bold flex-shrink-0">{c.icon}</span>
      <span>{warn.text}</span>
    </div>
  )
}
