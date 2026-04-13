import { useState } from 'react'
import { useStore } from '../store.jsx'
import { parseBRL, getCatMeta } from '../utils.js'

const EXPENSE_CATS = [
  { name: 'Alimentação', emoji: '🍔' },
  { name: 'Transporte',  emoji: '🚗' },
  { name: 'Saúde',       emoji: '💊' },
  { name: 'Assinaturas', emoji: '📱' },
  { name: 'Contas',      emoji: '🏠' },
  { name: 'Lazer',       emoji: '🎉' },
  { name: 'Outro',       emoji: '📦' },
]

const INCOME_CATS = [
  { name: 'Receita', emoji: '💼' },
  { name: 'Outro',   emoji: '📦' },
]

export default function AddScreen({ onNavigate }) {
  const { addTransaction } = useStore()
  const [type, setType] = useState('expense')
  const [amount, setAmount] = useState('')
  const [desc, setDesc] = useState('')
  const [cat, setCat] = useState('')
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const cats = type === 'income' ? INCOME_CATS : EXPENSE_CATS

  const handleSave = () => {
    const parsed = parseBRL(amount)
    if (!parsed || isNaN(parsed) || parsed <= 0) {
      setError('Valor inválido')
      return
    }
    if (!desc.trim() || !cat) {
      setError('Preencha descrição e categoria')
      return
    }
    setError('')

    const meta = getCatMeta(cat)
    addTransaction({
      desc: desc.trim(),
      cat,
      emoji: meta.emoji,
      color: meta.color,
      amount: type === 'income' ? parsed : -parsed,
      date: new Date().toISOString(),
    })

    setDone(true)
    setTimeout(() => {
      setDone(false)
      setAmount('')
      setDesc('')
      setCat('')
      onNavigate('home')
    }, 1200)
  }

  if (done) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 16 }}>
      <div style={{ fontSize: 64 }}>✅</div>
      <p style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, color: 'var(--dark)' }}>Transação salva!</p>
      <p style={{ fontSize: 14, color: 'var(--muted)' }}>Redirecionando...</p>
    </div>
  )

  const canSave = amount && desc && cat

  return (
    <div className="fade-up">
      <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, color: 'var(--dark)', marginBottom: 20 }}>Nova Transação</h2>

      {/* Type toggle */}
      <div style={{ display: 'flex', background: '#f0ece6', borderRadius: 16, padding: 4, marginBottom: 24 }}>
        {[
          { id: 'expense', label: '💸 Despesa' },
          { id: 'income',  label: '💰 Receita' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => { setType(t.id); setCat('') }}
            style={{
              flex: 1, padding: '11px 0', border: 'none', borderRadius: 13, cursor: 'pointer',
              background: type === t.id ? '#1a1410' : 'transparent',
              color:      type === t.id ? '#fff'    : 'var(--muted)',
              fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600,
              transition: 'all 0.2s',
            }}
          >{t.label}</button>
        ))}
      </div>

      {/* Amount */}
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 8 }}>Valor</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, color: 'var(--muted)' }}>R$</span>
          <input
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={e => { setAmount(e.target.value); setError('') }}
            placeholder="0,00"
            style={{
              border: 'none', background: 'transparent', outline: 'none',
              fontFamily: "'DM Serif Display', serif", fontSize: 42, color: 'var(--dark)',
              width: 180, textAlign: 'center',
            }}
          />
        </div>
        <div style={{ height: 2, background: type === 'income' ? '#2ECC71' : '#e07070', width: 80, margin: '0 auto', borderRadius: 2 }} />
      </div>

      {/* Description */}
      <input
        className="input-base"
        placeholder="Descrição (ex: iFood, Salário...)"
        value={desc}
        onChange={e => { setDesc(e.target.value); setError('') }}
        style={{ marginBottom: 14 }}
      />

      {/* Category */}
      <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 10 }}>Categoria</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 20 }}>
        {cats.map(c => (
          <button
            key={c.name}
            onClick={() => { setCat(c.name); setError('') }}
            style={{
              padding: '12px 8px',
              border: `2px solid ${cat === c.name ? '#1a1410' : '#e8e3dc'}`,
              borderRadius: 14,
              background: cat === c.name ? '#f0ece6' : '#fff',
              cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              transition: 'all 0.15s',
            }}
          >
            <span style={{ fontSize: 22 }}>{c.emoji}</span>
            <span style={{ fontSize: 10, color: cat === c.name ? '#1a1410' : 'var(--muted)', fontWeight: 500 }}>{c.name}</span>
          </button>
        ))}
      </div>

      {error && <p style={{ fontSize: 12, color: '#DC2626', marginBottom: 12, textAlign: 'center' }}>{error}</p>}

      <button
        className="btn-primary"
        style={{ width: '100%', opacity: canSave ? 1 : 0.4 }}
        onClick={handleSave}
        disabled={!canSave}
      >
        Salvar transação
      </button>
    </div>
  )
}
