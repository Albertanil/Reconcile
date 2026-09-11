import { useState } from 'react'
import Landing from './screens/Landing'
import Queue from './screens/Queue'
import Form from './screens/Form'
import Submission from './screens/Submission'
import Clerk from './screens/Clerk'
import Evaluation from './screens/Evaluation'
import Approval from './screens/Approval'

export type Screen = 'landing' | 'queue' | 'form' | 'submission' | 'clerk' | 'evaluation' | 'approval'
export type Navigate = (s: Screen) => void

export default function App() {
  const [screen, setScreen] = useState<Screen>('landing')
  const navigate: Navigate = (s) => setScreen(s)

  return (
    <div
      className="min-h-screen relative overflow-x-hidden crt"
      style={{ background: 'var(--c-bg)', color: 'var(--c-text)', fontFamily: 'var(--f-mono)' }}
    >
      {/* CRT scanlines overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-50"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, rgba(0,0,0,0.03) 0px, rgba(0,0,0,0.03) 1px, transparent 1px, transparent 4px)',
        }}
      />
      {/* Vignette */}
      <div
        className="fixed inset-0 pointer-events-none z-40"
        style={{
          background:
            'radial-gradient(ellipse at 50% 50%, transparent 60%, rgba(0,0,0,0.35) 100%)',
        }}
      />

      {screen === 'landing' && <Landing navigate={navigate} />}
      {screen === 'queue' && <Queue navigate={navigate} />}
      {screen === 'form' && <Form navigate={navigate} />}
      {screen === 'submission' && <Submission navigate={navigate} />}
      {screen === 'clerk' && <Clerk navigate={navigate} />}
      {screen === 'evaluation' && <Evaluation navigate={navigate} />}
      {screen === 'approval' && <Approval navigate={navigate} />}
    </div>
  )
}
