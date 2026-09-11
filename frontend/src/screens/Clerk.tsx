import { useState, useEffect, useRef } from 'react'
import PageChrome from '../components/PageChrome'
import type { Navigate } from '../App'
import { useApplication } from '@/context/ApplicationContext'

interface Message {
  id: number
  from: 'clerk' | 'applicant'
  text: string
  timestamp: string
}

interface SysWarn {
  id: number
  text: string
}

const QUESTIONS = [
  'State your case number for the record.',
  'You indicated in your application that you regret your actions. Your statement places responsibility on external circumstances. Please explain what part of this was your fault.',
  'The word "just" has been detected in prior responses. Please explain why you waited until now to apologize.',
  'On a scale of personal accountability, state a number between 0 and 100.',
  'Did the affected party communicate the impact of your actions to you prior to this application?',
  'If you could return to the moment of the incident, what would you have done differently?',
  'State for the record whether your remorse is genuine.',
]

const ACK: Record<number, string> = {
  1: 'ACKNOWLEDGED.',
  2: 'LOGGED.',
  3: 'NOTED.',
  4: 'RECORDED.',
  5: 'ACCEPTABLE.',
  6: 'LOGGED.',
}

function nowStr() {
  return new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

function detectFlag(text: string): string | null {
  const lo = text.toLowerCase()
  if (/\bjust\b/.test(lo)) return 'The word "just" has been detected. Your application is flagged for deflection. Try again.'
  if (/\bbut\b/.test(lo)) return 'Phrase "but" detected — possible conditional remorse. Statement forwarded to Dept. of Contradictions.'
  if (/\bthey\b|\bthem\b/.test(lo)) return 'Third-party attribution detected. Deflection score increased.'
  if (/\bsorry\b/.test(lo)) return 'Unauthorized apology detected. Apology not yet cleared for dispatch.'
  if (text.trim().length < 12) return 'Response brevity flagged. Elaboration required. Minimum length not met.'
  return null
}

export default function Clerk({ navigate }: { navigate: Navigate }) {
  const { ticketNumber, triggerEvaluation, loading: contextLoading } = useApplication()
  const [evaluating, setEvaluating] = useState(false)
  const [evalError, setEvalError] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [sysWarns, setSysWarns] = useState<SysWarn[]>([])
  const [input, setInput] = useState('')
  const [qIndex, setQIndex] = useState(0)
  const [typing, setTyping] = useState(false)
  const [done, setDone] = useState(false)
  const [mood, setMood] = useState('NEUTRAL')
  const [load, setLoad] = useState(87)
  const chatRef = useRef<HTMLDivElement>(null)
  const idRef = useRef(1)
  const warnIdRef = useRef(0)

  function getId() { idRef.current += 1; return idRef.current }
  function getWarnId() { warnIdRef.current += 1; return warnIdRef.current }

  function scroll() {
    setTimeout(() => {
      if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight
    }, 60)
  }

  function addClerk(text: string) {
    setMessages(m => [...m, { id: getId(), from: 'clerk', text, timestamp: nowStr() }])
    scroll()
  }

  function addUser(text: string) {
    setMessages(m => [...m, { id: getId(), from: 'applicant', text, timestamp: nowStr() }])
    scroll()
  }

  useEffect(() => {
    setTyping(true)
    idRef.current = 0
    const t = setTimeout(() => {
      setTyping(false)
      setMessages([{ id: 1, from: 'clerk', text: QUESTIONS[0], timestamp: nowStr() }])
    }, 1200)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    setLoad(78 + Math.floor(Math.random() * 18))
  }, [qIndex])

  function handleSubmit() {
    if (!input.trim() || typing) return
    const userText = input.trim()
    setInput('')
    addUser(userText)

    const flag = detectFlag(userText)
    if (flag) {
      const wid = getWarnId()
      setTimeout(() => {
        setSysWarns(ws => [...ws, { id: wid, text: flag }])
        scroll()
        setMood('SUSPICIOUS')
      }, 500)
    }

    const next = qIndex + 1

    if (next < QUESTIONS.length) {
      setTyping(true)
      setTimeout(() => {
        setTyping(false)
        addClerk(ACK[next] || 'NOTED.')
        setTimeout(() => {
          setTyping(true)
          setTimeout(() => {
            setTyping(false)
            addClerk(QUESTIONS[next])
            setQIndex(next)
          }, 1400)
        }, 600)
      }, 900)
    } else {
      setTyping(true)
      setTimeout(() => {
        setTyping(false)
        addClerk('This interview is now complete. Your responses have been logged and transmitted to the Bureau of Remorse Assessment. Do not speak further.')
        setTimeout(() => {
          addClerk(`CASE ${ticketNumber} INTERVIEW: CONCLUDED. Processing remorse indicators...`)
          setDone(true)
          setMood('PROCESSING')
          scroll()
        }, 1200)
      }, 1000)
    }
  }

  return (
    <PageChrome step={5}>
      <div className="flex" style={{ minHeight: 'calc(100vh - 88px)' }}>
        {/* LEFT — Voxel scene panel */}
        <div
          className="flex-shrink-0 relative overflow-hidden"
          style={{ width: '280px', background: '#0a0906' }}
        >
          <ClerkScene mood={mood} qIndex={qIndex} totalQ={QUESTIONS.length} load={load} done={done} ticketNumber={ticketNumber} />
        </div>

        {/* RIGHT — Conversation terminal */}
        <div className="flex-1 flex flex-col" style={{ background: 'var(--c-bg)' }}>
          {/* Chat header */}
          <div
            className="flex items-center justify-between px-6 py-3 border-b flex-shrink-0"
            style={{
              background: 'var(--c-panel)',
              borderColor: 'var(--c-border)',
              fontFamily: 'var(--f-mono)',
              fontSize: '11px',
            }}
          >
            <div style={{ color: 'var(--c-text)', letterSpacing: '0.15em' }}>
              CASE {ticketNumber} — APOLOGY VERIFICATION INTERVIEW
            </div>
            <div style={{ color: 'var(--c-muted)' }}>
              Q {Math.min(qIndex + 1, QUESTIONS.length)} / {QUESTIONS.length}
            </div>
          </div>

          {/* Messages */}
          <div ref={chatRef} className="flex-1 overflow-y-auto p-5 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`slide-in ${msg.from === 'applicant' ? 'flex flex-col items-end' : ''}`}>
                <div
                  className="text-xs mb-1 flex items-baseline gap-2"
                  style={{
                    fontFamily: 'var(--f-mono)',
                    color: msg.from === 'clerk' ? 'var(--c-amber)' : 'var(--c-muted)',
                    fontSize: '10px',
                    justifyContent: msg.from === 'applicant' ? 'flex-end' : 'flex-start',
                  }}
                >
                  <span className="font-bold tracking-widest">
                    {msg.from === 'clerk' ? 'AO-7741' : 'You'}
                  </span>
                  <span style={{ color: 'var(--c-muted2)' }}>{msg.timestamp}</span>
                </div>
                <div
                  className="max-w-xl p-3 border text-sm"
                  style={{
                    fontFamily: 'var(--f-mono)',
                    borderColor: msg.from === 'clerk' ? 'var(--c-border2)' : 'var(--c-border)',
                    background: msg.from === 'clerk' ? 'var(--c-panel)' : 'rgba(220,215,200,0.05)',
                    color: msg.from === 'clerk' ? 'var(--c-text)' : 'var(--c-muted)',
                    lineHeight: '1.6',
                    fontSize: '13px',
                  }}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {/* System warnings appear inline */}
            {sysWarns.map((w) => (
              <div
                key={w.id}
                className="border p-3 text-xs slide-in"
                style={{
                  borderColor: 'var(--c-red2)',
                  background: 'rgba(204,54,54,0.07)',
                  fontFamily: 'var(--f-mono)',
                  color: 'var(--c-red2)',
                  lineHeight: '1.5',
                }}
              >
                AO-7741: {w.text}
              </div>
            ))}

            {/* Typing indicator */}
            {typing && (
              <div className="slide-in">
                <div className="text-xs mb-1 font-bold tracking-widest" style={{ fontFamily: 'var(--f-mono)', color: 'var(--c-amber)', fontSize: '10px' }}>
                  AO-7741
                </div>
                <div className="p-3 border inline-flex items-center gap-1.5" style={{ background: 'var(--c-panel)', borderColor: 'var(--c-border2)' }}>
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t p-4 flex-shrink-0" style={{ background: 'var(--c-panel)', borderColor: 'var(--c-border)' }}>
            {done ? (
              <div className="flex flex-col gap-2 w-full">
                {evalError && (
                  <div className="text-xs p-2 border" style={{ color: 'var(--c-red2)', borderColor: 'var(--c-red2)', fontFamily: 'var(--f-mono)' }}>
                    ⚠ EVALUATION ERROR: {evalError}
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <div className="text-sm" style={{ fontFamily: 'var(--f-mono)', color: 'var(--c-muted)' }}>
                    INTERVIEW CONCLUDED — NO FURTHER RESPONSES ACCEPTED
                  </div>
                  <button
                    onClick={async () => {
                      if (evaluating || contextLoading) return
                      setEvaluating(true)
                      setEvalError(null)
                      try {
                        await triggerEvaluation()
                        navigate('evaluation')
                      } catch (err: any) {
                        setEvaluating(false)
                        setEvalError(err.message || 'Evaluation failed. Please try again.')
                      }
                    }}
                    disabled={evaluating || contextLoading}
                    className="px-8 py-2.5 text-xs tracking-[0.15em] border transition-all flex items-center gap-2"
                    style={{
                      fontFamily: 'var(--f-mono)',
                      borderColor: 'var(--c-green2)',
                      color: 'var(--c-green2)',
                      background: 'rgba(42,122,56,0.08)',
                      cursor: evaluating || contextLoading ? 'wait' : 'pointer',
                      opacity: evaluating || contextLoading ? 0.7 : 1,
                    }}
                  >
                    {evaluating || contextLoading ? 'RUNNING AI EVALUATION...' : 'VIEW EVALUATION →'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-3 items-end">
                <textarea
                  className="gov-textarea flex-1"
                  rows={2}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSubmit()
                    }
                  }}
                  placeholder="Type your response..."
                  style={{ resize: 'none', fontSize: '13px' }}
                />
                <button
                  onClick={handleSubmit}
                  disabled={typing || !input.trim()}
                  className="w-11 h-11 flex items-center justify-center border transition-all flex-shrink-0"
                  style={{
                    borderColor: typing || !input.trim() ? 'var(--c-border)' : 'var(--c-text)',
                    color: typing || !input.trim() ? 'var(--c-muted2)' : 'var(--c-text)',
                    background: 'transparent',
                    cursor: typing || !input.trim() ? 'not-allowed' : 'pointer',
                    fontSize: '20px',
                  }}
                >
                  {'>'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageChrome>
  )
}

function ClerkScene({ mood, qIndex, totalQ, load, done, ticketNumber }: { mood: string; qIndex: number; totalQ: number; load: number; done: boolean; ticketNumber?: string }) {
  return (
    <svg width="280" height="100%" viewBox="0 0 280 580" preserveAspectRatio="xMidYMid meet" style={{ display: 'block', position: 'absolute', inset: 0, height: '100%' }}>
      {/* Room bg */}
      <rect x="0" y="0" width="280" height="580" fill="#0d0c09" />
      {/* Back wall */}
      <rect x="20" y="0" width="240" height="400" fill="#111008" />
      {/* Floor */}
      <rect x="0" y="400" width="280" height="180" fill="#0e0d0a" />
      {/* Floor line */}
      <line x1="0" y1="400" x2="280" y2="400" stroke="#1a1814" strokeWidth="1" />
      {/* Side shadows */}
      <rect x="0" y="0" width="20" height="580" fill="#0a0907" />
      <rect x="260" y="0" width="20" height="580" fill="#0a0907" />

      {/* Wall text — "EXCUSES ARE NOT APOLOGIES." */}
      <text x="140" y="95" textAnchor="middle" style={{ fontFamily: 'var(--f-admin)', fontSize: '22px', fill: '#2e2c26', fontWeight: 800, letterSpacing: '1px' }}>EXCUSES</text>
      <text x="140" y="124" textAnchor="middle" style={{ fontFamily: 'var(--f-admin)', fontSize: '22px', fill: '#2e2c26', fontWeight: 800, letterSpacing: '1px' }}>ARE NOT</text>
      <text x="140" y="153" textAnchor="middle" style={{ fontFamily: 'var(--f-admin)', fontSize: '22px', fill: '#2e2c26', fontWeight: 800, letterSpacing: '1px' }}>APOLOGIES.</text>

      {/* Desk surface */}
      <rect x="20" y="330" width="240" height="18" fill="#181612" stroke="#201e18" strokeWidth="0.5" />
      {/* Desk front */}
      <rect x="20" y="347" width="240" height="55" fill="#131210" />

      {/* Stack of case files on desk */}
      <rect x="30" y="294" width="55" height="38" fill="#ddd8c4" />
      <rect x="32" y="292" width="55" height="38" fill="#d4ceb8" />
      <rect x="34" y="290" width="55" height="38" fill="#ccc6b0" />
      <rect x="36" y="288" width="55" height="38" fill="#c4bea8" />
      <text x="63" y="312" textAnchor="middle" style={{ fontFamily: 'Courier Prime, monospace', fontSize: '6px', fill: '#5a5040' }}>CASE FILES</text>

      {/* Voxel clerk character */}
      <VoxelClerk x={120} y={170} />

      {/* Monitor on desk */}
      <rect x="175" y="278" width="60" height="50" fill="#0c0e0c" stroke="#141814" strokeWidth="1" />
      <rect x="177" y="280" width="56" height="44" fill="#0e140e" />
      <rect x="177" y="280" width="56" height="44" fill="#2e6030" opacity="0.15" />
      <text x="205" y="298" textAnchor="middle" style={{ fontFamily: 'Courier Prime, monospace', fontSize: '6px', fill: '#3a6a3c' }}>CASE {ticketNumber || 'A-001'}</text>
      <text x="205" y="310" textAnchor="middle" style={{ fontFamily: 'Courier Prime, monospace', fontSize: '5px', fill: '#2a5a2c' }}>PROCESSING</text>
      <rect x="198" y="328" width="14" height="4" fill="#0e0e0e" />
      <rect x="186" y="332" width="38" height="4" fill="#141414" />

      {/* Status HUD */}
      <rect x="22" y="415" width="236" height="94" fill="#0c0d0a" stroke="#1a1c16" strokeWidth="1" />
      <rect x="22" y="415" width="236" height="18" fill="#101208" />
      <text x="140" y="427" textAnchor="middle" style={{ fontFamily: 'Courier Prime, monospace', fontSize: '8px', fill: '#2a3a2a', letterSpacing: '2px' }}>CLERK STATUS</text>

      {[
        { label: 'Clerk:', val: 'AO-7741', color: '#dcd7c2' },
        { label: 'Status:', val: done ? 'COMPLETE' : 'ACTIVE', color: done ? '#35a048' : '#35a048' },
        { label: 'Mood:', val: mood, color: mood === 'SUSPICIOUS' ? '#cc3636' : mood === 'PROCESSING' ? '#b8943a' : '#9a9880' },
        { label: 'Cases today:', val: '1,247', color: '#5a5848' },
        { label: 'Load:', val: `${load}%`, color: load > 92 ? '#cc3636' : '#9a9880' },
      ].map(({ label, val, color }, i) => (
        <g key={label}>
          <text x="32" y={447 + i * 14} style={{ fontFamily: 'Courier Prime, monospace', fontSize: '9px', fill: '#4a4840' }}>{label}</text>
          <text x="100" y={447 + i * 14} style={{ fontFamily: 'Courier Prime, monospace', fontSize: '9px', fill: color }}>{val}</text>
        </g>
      ))}

      {/* Interview progress bar */}
      <rect x="22" y="518" width="236" height="40" fill="#0c0d0a" stroke="#1a1c16" strokeWidth="1" />
      <text x="32" y="531" style={{ fontFamily: 'Courier Prime, monospace', fontSize: '8px', fill: '#3a3830', letterSpacing: '1px' }}>INTERVIEW PROGRESS</text>
      <rect x="32" y="536" width="216" height="6" fill="#161614" />
      <rect x="32" y="536" width={Math.round((Math.min(qIndex, totalQ) / totalQ) * 216)} height="6"
        fill={done ? '#35a048' : '#b8943a'} />
      <text x="32" y="552" style={{ fontFamily: 'Courier Prime, monospace', fontSize: '7px', fill: '#3a3830' }}>
        {Math.min(qIndex + (done ? 1 : 0), totalQ)} / {totalQ} QUESTIONS
      </text>
    </svg>
  )
}

/* Low-poly / voxel clerk character built from rect blocks */
function VoxelClerk({ x, y }: { x: number; y: number }) {
  const B = 6 // block size
  const b = (col: number, row: number, color: string, w = 1, h = 1) => (
    <rect key={`${col}${row}`} x={x + col * B} y={y + row * B} width={B * w - 0.5} height={B * h - 0.5} fill={color} />
  )

  return (
    <g>
      {/* Shadow */}
      <ellipse cx={x + 18} cy={y + 130} rx={28} ry={6} fill="#060504" />

      {/* Legs */}
      {b(-2, 17, '#161626', 2, 5)}{b(1, 17, '#181828', 2, 5)}
      {/* Shoes */}
      {b(-3, 21, '#111018', 3, 1)}{b(1, 21, '#111018', 3, 1)}

      {/* Body / suit jacket */}
      {b(-3, 9, '#1a1a2a', 7, 8)}
      {/* Lapels */}
      {b(-2, 9, '#141428', 1, 4)}{b(2, 9, '#141428', 1, 4)}
      {/* Shirt / tie */}
      {b(-1, 9, '#d0ccb8', 1, 2)}{b(0, 9, '#d0ccb8', 1, 2)}
      {b(-1, 11, '#8a1e1e', 1, 3)}{b(0, 11, '#8a1e1e', 1, 3)}
      {/* Arms */}
      {b(-5, 10, '#141424', 2, 7)}{b(4, 10, '#141424', 2, 7)}
      {/* Hands */}
      {b(-5, 17, '#7a6650', 2, 2)}{b(4, 17, '#7a6650', 2, 2)}

      {/* Neck */}
      {b(-1, 7, '#8a7660', 2, 2)}

      {/* Head */}
      {b(-3, 1, '#9a8468', 7, 6)}
      {/* Hair top */}
      {b(-3, 0, '#1e180e', 7, 1)}{b(-3, 1, '#1e180e', 7, 1)}
      {/* Hair sides */}
      {b(-3, 2, '#1e180e', 1, 2)}{b(3, 2, '#1e180e', 1, 2)}
      {/* Eyes */}
      {b(-1, 3, '#1a1612', 1, 1)}{b(1, 3, '#1a1612', 1, 1)}
      {/* Pupils */}
      {b(-1, 3, '#0a0a08', 1, 1)}{b(1, 3, '#0a0a08', 1, 1)}
      {/* Mouth - neutral line */}
      {b(-1, 5, '#78604a', 3, 1)}
      {/* Ear nubs */}
      {b(-4, 3, '#8a7460', 1, 2)}{b(4, 3, '#8a7460', 1, 2)}
    </g>
  )
}
