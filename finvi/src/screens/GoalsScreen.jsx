import { useState } from 'react'
import { useStore } from '../store.jsx'
import { formatBRL, parseBRL } from '../utils.js'

const COLORS = ['#3498DB', '#2ECC71', '#9B59B6', '#E74C3C', '#F39C12', '#1ABC9C']
const EMOJIS = ['🎯', '✈️', '🏠', '🚗', '💻', '📱', '🎓', '👶', '💍', '🌴', '🛡️', '💰']

const blankForm = { name: '', emoji: '🎯', target: '', saved: '', color: '#3498DB' }

export default function GoalsScreen() {
  const { goals, addGoal, deleteGoal } = useStore()
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState(blankForm)

  const handleAdd = () => {
    const target = parseBRL(form.target)
    const saved  = parseBRL(form.saved) || 0
    if (!form.name || !target || target <= 0) return
    addGoal({
      name: form.name.trim(),
      emoji: form.emoji,
      target,
      saved,
      color: form.color,
    })
    setForm(blankForm)
    setShowAdd(false)
  }

  const totalSaved = goals.reduce((s, g) => s + g.saved, 0)

  return (
    <div className="fade-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, color: 'var(--dark)' }}>Minhas Metas</h2>
        <button className="btn-primary" style={{ padding: '10px 18px', fontSize: 13, borderRadius: 100 }} onClick={() => setShowAdd(true)}>
          + Nova meta
        </button>
      </div>

      {/* Total saved */}
      <div className="card" style={{ marginBottom: 14, background: 'linear-gradient(135deg,#1a1410,#3d2d1e)', color: '#f5f3ef' }}>
        <p style={{ fontSize: 11, color: '#8a7a6a', marginBottom: 4, letterSpacing: 1, textTransform: 'uppercase' }}>Total Guardado</p>
        <p style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28 }}>{formatBRL(totalSaved)}</p>
        <p style={{ fontSize: 12, color: '#7a6a5a', marginTop: 4 }}>
          em {goals.length} {goals.length === 1 ? 'meta ativa' : 'metas ativas'}
        </p>
      </div>

      {goals.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: 30 }}>
          <p style={{ fontSize: 40, marginBottom: 8 }}>🎯</p>
          <p style={{ fontSize: 14, color: 'var(--muted)' }}>Nenhuma meta ainda. Crie sua primeira!</p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {goals.map(g => {
          const pct = Math.min((g.saved / g.target) * 100, 100)
          const remaining = Math.max(0, g.target - g.saved)
          return (
            <div key={g.id} className="card">
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 15, background: `${g.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
                    {g.emoji}
                  </div>
                  <div>
                    <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--dark)' }}>{g.name}</p>
                    <p style={{ fontSize: 12, color: 'var(--muted)' }}>
                      {formatBRL(g.saved)} / {formatBRL(g.target)}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 20, color: g.color }}>{pct.toFixed(0)}%</span>
                  <button
                    onClick={() => deleteGoal(g.id)}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 14, opacity: 0.3 }}
                    aria-label="Excluir meta"
                  >✕</button>
                </div>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${pct}%`, background: g.color }} />
              </div>
              {pct < 100
                ? <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8 }}>Faltam {formatBRL(remaining)} para a meta 🎯</p>
                : <p style={{ fontSize: 12, color: '#2ECC71', marginTop: 8 }}>✅ Meta alcançada! Parabéns!</p>
              }
            </div>
          )
        })}
      </div>

      {/* Add modal */}
      {showAdd && (
        <div className="modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--dark)', marginBottom: 20 }}>Nova Meta</h3>

            <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>Escolha um ícone</p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
              {EMOJIS.map(e => (
                <button
                  key={e}
                  onClick={() => setForm(f => ({ ...f, emoji: e }))}
                  style={{
                    width: 40, height: 40, borderRadius: 12,
                    border: `2px solid ${form.emoji === e ? '#1a1410' : '#e8e3dc'}`,
                    background: form.emoji === e ? '#f0ece6' : '#fff',
                    fontSize: 20, cursor: 'pointer',
                  }}
                >{e}</button>
              ))}
            </div>

            <input className="input-base" placeholder="Nome da meta" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={{ marginBottom: 10 }} />
            <input className="input-base" placeholder="Valor total (R$)"  inputMode="decimal" value={form.target} onChange={e => setForm(f => ({ ...f, target: e.target.value }))} style={{ marginBottom: 10 }} />
            <input className="input-base" placeholder="Já guardado (R$)"  inputMode="decimal" value={form.saved}  onChange={e => setForm(f => ({ ...f, saved:  e.target.value }))} style={{ marginBottom: 14 }} />

            <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>Cor</p>
            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
              {COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setForm(f => ({ ...f, color: c }))}
                  style={{
                    width: 32, height: 32, borderRadius: '50%', background: c,
                    border: `3px solid ${form.color === c ? '#1a1410' : 'transparent'}`,
                    cursor: 'pointer',
                  }}
                  aria-label={`Cor ${c}`}
                />
              ))}
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn-ghost"   style={{ flex: 1 }} onClick={() => setShowAdd(false)}>Cancelar</button>
              <button className="btn-primary" style={{ flex: 1 }} onClick={handleAdd}>Criar Meta</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
