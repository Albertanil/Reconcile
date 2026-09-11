import { useState, useRef, useCallback, useEffect } from 'react'
import PageChrome from '../components/PageChrome'
import type { Navigate } from '../App'
import { useApplication } from '@/context/ApplicationContext'

const MIN_WORDS = 500

function countWords(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length
}

function getWordWarn(wc: number): { text: string; type: 'warn' | 'ok' | 'info' } | null {
  if (wc === 0) return null
  if (wc < 10) return { text: 'PATHETIC. Additional remorse required.', type: 'warn' }
  if (wc < 50) return { text: 'Insufficient. Minimum required length: 500 words.', type: 'warn' }
  if (wc < 150) return { text: 'Effort noted. Elaboration strongly recommended.', type: 'info' }
  if (wc >= MIN_WORDS) return { text: 'Minimum word count met. Proceeding.', type: 'ok' }
  return null
}

export default function Submission({ navigate }: { navigate: Navigate }) {
  const { draftApology, submitApology, loading, error } = useApplication()

  const [apology, setApology] = useState(draftApology.statement || '')
  const [submitted, setSubmitted] = useState(false)
  const [btnPos, setBtnPos] = useState({ x: 0, y: 0 })
  const [avoidCount, setAvoidCount] = useState(0)
  const [avoidMsg, setAvoidMsg] = useState('')
  const btnRef = useRef<HTMLButtonElement>(null)
  const lastMouse = useRef({ x: 0, y: 0, time: Date.now() })
  const avoidRef = useRef(0)
  const [btnWarning, setBtnWarning] = useState('')

  const wordCount = countWords(apology)
  const wordWarn = getWordWarn(wordCount)

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (avoidRef.current >= 3 || !btnRef.current) return
    const rect = btnRef.current.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const dx = e.clientX - cx
    const dy = e.clientY - cy
    const dist = Math.sqrt(dx * dx + dy * dy)
    const now = Date.now()
    const dt = Math.max(now - lastMouse.current.time, 1)
    const vx = (e.clientX - lastMouse.current.x) / dt
    const vy = (e.clientY - lastMouse.current.y) / dt
    const speed = Math.sqrt(vx * vx + vy * vy)
    lastMouse.current = { x: e.clientX, y: e.clientY, time: now }

    if (dist < 120 && speed > 0.22 && avoidRef.current < 3) {
      const angle = Math.atan2(dy, dx)
      setBtnPos({ x: -Math.cos(angle) * 60, y: -Math.sin(angle) * 60 })
      avoidRef.current += 1
      setAvoidCount(avoidRef.current)
      if (avoidRef.current === 1) {
        setBtnWarning('Please approach the button calmly.')
        setAvoidMsg('PLEASE DO NOT RUSH THE ADMINISTRATIVE PROCESS.')
      }
      if (avoidRef.current === 2) {
        setBtnWarning('Please approach the button calmly.')
        setAvoidMsg('APPLICANT HAS DEMONSTRATED IMPATIENCE. CASE NOTE ADDED.')
      }
      if (avoidRef.current >= 3) {
        setBtnWarning('The button has been stabilised. Proceed carefully.')
        setAvoidMsg('IMPATIENCE INDICATOR: HIGH — FORWARDED TO OVERSIGHT BUREAU.')
      }
      setTimeout(() => setBtnPos({ x: 0, y: 0 }), 700)
    }
  }, [])

  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (submitted || loading) return
    setSubmitted(true)
    setSubmitError(null)
    try {
      await submitApology(apology)
      navigate('clerk')
    } catch (err: any) {
      setSubmitted(false)
      setSubmitError(err.message || 'Submission failed. Please try again.')
    }
  }

  return (
    <PageChrome step={4}>
      <div
        className="flex gap-0"
        style={{ minHeight: 'calc(100vh - 88px)' }}
        onMouseMove={handleMouseMove}
      >
        {/* Paper area */}
        <div
          className="flex-1 overflow-auto"
          style={{ background: '#f0ebe0', padding: '40px 48px' }}
        >
          {/* Field heading */}
          <div className="flex items-baseline justify-between mb-4">
            <div
              className="text-xl font-bold"
              style={{ fontFamily: 'var(--f-admin)', color: '#1a1610', letterSpacing: '0.05em' }}
            >
              12. STATEMENT OF GENUINE REMORSE
            </div>
            <div
              className="text-xs"
              style={{ fontFamily: 'var(--f-mono)', color: '#9a8060' }}
            >
              Minimum required length: {MIN_WORDS} words
            </div>
          </div>

          {/* Textarea */}
          <textarea
            className="gov-textarea-paper"
            rows={10}
            value={apology}
            onChange={(e) => setApology(e.target.value)}
            placeholder="Write your statement of genuine remorse. Templates are detected and penalised. The word 'sorry' alone does not constitute a compliant apology."
            style={{ width: '100%', marginBottom: '8px', fontSize: '13px' }}
          />

          {/* Word count */}
          <div
            className="flex items-center justify-between mb-4 text-xs"
            style={{ fontFamily: 'var(--f-mono)', color: '#7a6840' }}
          >
            <span>
              Word count:{' '}
              <strong style={{ color: wordCount >= MIN_WORDS ? '#2a7a38' : wordCount < 50 ? '#cc3636' : '#1a1610' }}>
                {wordCount}
              </strong>
              {wordCount < MIN_WORDS && (
                <span style={{ color: '#9a8060' }}> / {MIN_WORDS} required</span>
              )}
            </span>
            {apology.toLowerCase().includes('but') && (
              <span style={{ color: '#cc3636' }}>⚠ "BUT" DETECTED — CONDITIONAL REMORSE FLAGGED</span>
            )}
          </div>

          {/* Word warning */}
          {wordWarn && (
            <div
              className="flex items-start gap-3 p-3 border mb-6 slide-in"
              style={{
                borderColor: wordWarn.type === 'warn' ? '#cc3636' : wordWarn.type === 'ok' ? '#35a048' : '#9a7c2e',
                background: wordWarn.type === 'warn' ? 'rgba(204,54,54,0.06)' : wordWarn.type === 'ok' ? 'rgba(53,160,72,0.06)' : 'rgba(154,124,46,0.06)',
                fontFamily: 'var(--f-mono)',
                fontSize: '12px',
              }}
            >
              <span
                className="font-bold flex-shrink-0"
                style={{ color: wordWarn.type === 'warn' ? '#cc3636' : wordWarn.type === 'ok' ? '#35a048' : '#9a7c2e' }}
              >
                {wordWarn.type === 'warn' ? '!' : wordWarn.type === 'ok' ? '✓' : '▸'}
              </span>
              <span
                style={{ color: wordWarn.type === 'warn' ? '#cc3636' : wordWarn.type === 'ok' ? '#35a048' : '#7a6030' }}
              >
                {wordWarn.text}
              </span>
            </div>
          )}

          {/* Avoidance system message */}
          {avoidMsg && (
            <div
              className="p-3 border mb-4 text-xs slide-in"
              style={{
                borderColor: 'var(--c-red2)',
                background: 'rgba(204,54,54,0.05)',
                fontFamily: 'var(--f-mono)',
                color: '#cc3636',
              }}
            >
              ⚠ {avoidMsg}
            </div>
          )}

          {/* Submission error message */}
          {(submitError || error) && (
            <div
              className="p-3 border mb-4 text-xs slide-in"
              style={{
                borderColor: 'var(--c-red2)',
                background: 'rgba(204,54,54,0.08)',
                fontFamily: 'var(--f-mono)',
                color: '#cc3636',
              }}
            >
              ⚠ SUBMISSION ERROR: {submitError || error}
            </div>
          )}

          {/* Submit button area */}
          <div className="flex flex-col items-start mt-6">
            {/* Dashed approach indicator */}
            <div
              className="relative"
              style={{
                padding: '12px',
                border: avoidCount > 0 ? '2px dashed rgba(204,54,54,0.35)' : '2px dashed transparent',
                borderRadius: '2px',
                transition: 'border-color 0.3s',
              }}
            >
              <button
                ref={btnRef}
                onClick={handleSubmit}
                disabled={submitted || loading}
                className="px-10 py-3 text-sm tracking-[0.2em] border transition-all"
                style={{
                  fontFamily: 'var(--f-mono)',
                  background: (submitted || loading) ? '#3a3830' : '#1a1610',
                  color: (submitted || loading) ? '#7a7060' : '#ddd8c4',
                  borderColor: '#1a1610',
                  cursor: (submitted || loading) ? 'wait' : 'pointer',
                  letterSpacing: '0.2em',
                  transform: `translate(${btnPos.x}px, ${btnPos.y}px)`,
                  transition: 'transform 0.3s ease',
                  opacity: (submitted || loading) ? 0.7 : 1,
                }}
              >
                {submitted || loading ? 'SUBMITTING...' : 'SUBMIT APPLICATION'}
              </button>
            </div>
            <div
              className="text-xs mt-2 ml-3"
              style={{ fontFamily: 'var(--f-mono)', color: '#9a8060' }}
            >
              {btnWarning || 'Please approach the button calmly.'}
            </div>
          </div>
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
            SUBMISSION STATUS
          </div>
          <div className="space-y-3 text-xs flex-1" style={{ fontFamily: 'var(--f-mono)' }}>
            {[
              { label: 'FORM 7-B', val: 'FILED', ok: true },
              { label: 'INCIDENT DESCRIBED', val: 'YES', ok: true },
              { label: 'REMORSE DECLARED', val: 'YES', ok: true },
              { label: 'WORD COUNT', val: `${wordCount}`, ok: wordCount >= MIN_WORDS },
              { label: 'IMPATIENCE FLAGS', val: avoidCount > 0 ? `${avoidCount}` : '0', ok: avoidCount === 0 },
              { label: 'AI INTERVIEW', val: 'PENDING', ok: false },
            ].map((row) => (
              <div key={row.label} className="flex justify-between">
                <span style={{ color: 'var(--c-muted)' }}>{row.label}:</span>
                <span style={{ color: row.ok ? 'var(--c-green2)' : 'var(--c-amber)' }}>{row.val}</span>
              </div>
            ))}
          </div>
          <div
            className="mt-4 pt-4 border-t text-xs"
            style={{ borderColor: 'var(--c-border)', fontFamily: 'var(--f-mono)', color: 'var(--c-muted2)', lineHeight: '1.6' }}
          >
            Submission is non-reversible. Ensure accuracy. The Department is not liable for
            emotionally inaccurate apologies that pass verification.
          </div>
        </div>
      </div>
    </PageChrome>
  )
}
