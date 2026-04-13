import { useState, useRef, useEffect } from 'react'
import { useStore } from '../store.jsx'
import { analyzeQuestion } from '../finn.js'

const SUGGESTIONS = [
  'Quanto gastei esse mês?',
  'Onde posso economizar?',
  'Como estão minhas assinaturas?',
  'Qual é meu maior gasto?',
  'Estou no caminho certo?',
  'Quanto falta pra minha meta?',
]

export default function ChatScreen() {
  const store = useStore()
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Oi! Sou o Finn, seu assistente financeiro do FinVi 👋\n\nPode me perguntar sobre seus gastos, receitas, metas ou cartões — respondo com os seus dados reais.' },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const chatEndRef = useRef(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const send = (text) => {
    const msg = (text || input).trim()
    if (!msg || loading) return
    setInput('')
    setMessages(prev => [...prev, { role: 'user', text: msg }])
    setLoading(true)

    // Small delay so the typing indicator feels natural.
    setTimeout(() => {
      const reply = analyzeQuestion(msg, store)
      setMessages(prev => [...prev, { role: 'assistant', text: reply }])
      setLoading(false)
    }, 420)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* Header */}
      <div style={{ marginBottom: 12, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,#c8a882,#8a6a4a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
            🦁
          </div>
          <div>
            <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, color: 'var(--dark)', lineHeight: 1 }}>Finn</h2>
            <p style={{ fontSize: 12, color: '#2ECC71', fontWeight: 500 }}>● Online</p>
          </div>
        </div>
        <p style={{ fontSize: 12, color: 'var(--muted)' }}>Assistente do FinVi — pergunte sobre suas finanças</p>
      </div>

      {/* Suggestions */}
      {messages.length === 1 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14, flexShrink: 0 }}>
          {SUGGESTIONS.map(s => (
            <button
              key={s}
              onClick={() => send(s)}
              style={{
                background: '#fff', border: '1px solid #e8e3dc', borderRadius: 100,
                padding: '8px 14px', fontSize: 12, color: 'var(--text-soft)', cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif", transition: 'border-color 0.2s',
              }}
            >{s}</button>
          ))}
        </div>
      )}

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14, paddingBottom: 8 }}>
        {messages.map((m, i) => (
          <div key={i} className="fade-up" style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', gap: 8, animationDelay: `${i * 0.03}s` }}>
            {m.role === 'assistant' && (
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#c8a882,#8a6a4a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0, alignSelf: 'flex-end' }}>
                🦁
              </div>
            )}
            <div style={{
              maxWidth: '78%',
              padding: '12px 16px',
              borderRadius: m.role === 'user' ? '18px 18px 4px 18px' : '4px 18px 18px 18px',
              background:   m.role === 'user' ? '#1a1410' : '#fff',
              color:        m.role === 'user' ? '#f5f3ef' : 'var(--dark)',
              fontSize: 14, lineHeight: 1.6,
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
              whiteSpace: 'pre-line',
            }}>
              {m.text}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#c8a882,#8a6a4a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🦁</div>
            <div style={{ background: '#fff', borderRadius: '4px 18px 18px 18px', padding: '14px 18px', display: 'flex', gap: 5, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <div className="dot" style={{ width: 7, height: 7, borderRadius: '50%', background: '#c8a882' }} />
              <div className="dot" style={{ width: 7, height: 7, borderRadius: '50%', background: '#c8a882' }} />
              <div className="dot" style={{ width: 7, height: 7, borderRadius: '50%', background: '#c8a882' }} />
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div style={{ display: 'flex', gap: 10, flexShrink: 0, paddingTop: 8, background: 'var(--bg)' }}>
        <input
          style={{
            flex: 1, border: '1.5px solid #e8e3dc', borderRadius: 100, padding: '13px 18px',
            fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: 'var(--dark)',
            background: '#fff', outline: 'none', transition: 'border-color 0.2s',
          }}
          onFocus={e => e.target.style.borderColor = '#c8b89a'}
          onBlur={e => e.target.style.borderColor = '#e8e3dc'}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="Pergunte ao Finn..."
        />
        <button
          onClick={() => send()}
          disabled={!input.trim() || loading}
          style={{
            width: 46, height: 46, borderRadius: '50%', border: 'none', cursor: 'pointer', flexShrink: 0,
            background: input.trim() && !loading ? '#1a1410' : '#e8e3dc',
            color:      input.trim() && !loading ? '#fff'    : 'var(--muted)',
            fontSize: 20, transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          aria-label="Enviar"
        >↑</button>
      </div>
    </div>
  )
}
