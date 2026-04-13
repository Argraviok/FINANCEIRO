import { useState } from 'react'
import { useStore } from '../store.jsx'
import { formatBRL, formatBRLCompact, currentMonthName, parseBRL } from '../utils.js'

export default function BudgetsScreen() {
  const { budgets, updateBudgetLimit } = useStore()
  const [editing, setEditing] = useState(null)
  const [newLimit, setNewLimit] = useState('')

  const totalSpent = budgets.reduce((s, b) => s + b.spent, 0)
  const totalLimit = budgets.reduce((s, b) => s + b.limit, 0)
  const totalPct   = totalLimit > 0 ? (totalSpent / totalLimit) * 100 : 0

  const saveEdit = () => {
    const parsed = parseBRL(newLimit)
    if (!parsed || isNaN(parsed) || parsed < 0) return
    updateBudgetLimit(editing, parsed)
    setEditing(null)
    setNewLimit('')
  }

  const monthLabel = currentMonthName().charAt(0).toUpperCase() + currentMonthName().slice(1)

  return (
    <div className="fade-up">
      <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, color: 'var(--dark)', marginBottom: 4 }}>Orçamentos</h2>
      <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 16 }}>{monthLabel} {new Date().getFullYear()}</p>

      {/* Donut summary */}
      <div className="card" style={{ textAlign: 'center', marginBottom: 14, padding: 24 }}>
        <div style={{ position: 'relative', width: 130, height: 130, margin: '0 auto 14px' }}>
          <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
            <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f0ece6" strokeWidth="3.2" />
            <circle cx="18" cy="18" r="15.9" fill="none" stroke="#c8a882" strokeWidth="3.2"
              strokeDasharray={`${Math.min(totalPct, 100)} ${100 - Math.min(totalPct, 100)}`} strokeLinecap="round" />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ fontSize: 11, color: 'var(--muted)' }}>Usado</p>
            <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--dark)' }}>{totalPct.toFixed(0)}%</p>
          </div>
        </div>
        <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--dark)' }}>
          {formatBRL(totalSpent)} <span style={{ color: 'var(--muted)', fontWeight: 400 }}>de {formatBRLCompact(totalLimit)}</span>
        </p>
        <p style={{ fontSize: 12, color: totalPct > 80 ? '#e07070' : '#2ECC71', marginTop: 4 }}>
          {totalPct > 80 ? '⚠️ Atenção: orçamento quase no limite!' : '✅ Orçamento sob controle'}
        </p>
      </div>

      {/* Budget cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {budgets.map(b => {
          const pct  = b.limit > 0 ? (b.spent / b.limit) * 100 : 0
          const over = pct > 100
          const warn = pct > 80 && !over
          return (
            <div key={b.cat} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 14, background: `${b.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
                    {b.emoji}
                  </div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--dark)' }}>{b.cat}</p>
                    <p style={{ fontSize: 12, color: 'var(--muted)' }}>
                      {formatBRL(b.spent)} / {formatBRLCompact(b.limit)}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    background: over ? '#FEE2E2' : warn ? '#FFF3E0' : '#F0FDF4',
                    color:      over ? '#DC2626' : warn ? '#D97706' : '#16A34A',
                    padding: '4px 10px', borderRadius: 100, fontSize: 11, fontWeight: 600,
                  }}>{pct.toFixed(0)}%</span>
                  <button
                    onClick={() => { setEditing(b.cat); setNewLimit(String(b.limit)) }}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 16, opacity: 0.5 }}
                    aria-label="Editar limite"
                  >✏️</button>
                </div>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${Math.min(pct, 100)}%`, background: over ? '#EF4444' : warn ? '#F59E0B' : b.color }} />
              </div>
              {over && <p style={{ fontSize: 11, color: '#DC2626', marginTop: 6 }}>⚠️ Orçamento excedido em {formatBRL(b.spent - b.limit)}!</p>}
            </div>
          )
        })}
      </div>

      {/* Edit modal */}
      {editing && (
        <div className="modal-overlay" onClick={() => setEditing(null)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--dark)', marginBottom: 6 }}>Editar limite</h3>
            <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 20 }}>{editing}</p>
            <input
              className="input-base"
              type="text"
              inputMode="decimal"
              placeholder="Novo limite (R$)"
              value={newLimit}
              onChange={e => setNewLimit(e.target.value)}
              style={{ marginBottom: 14 }}
              autoFocus
            />
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn-ghost" style={{ flex: 1 }} onClick={() => setEditing(null)}>Cancelar</button>
              <button className="btn-primary" style={{ flex: 1 }} onClick={saveEdit}>Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
