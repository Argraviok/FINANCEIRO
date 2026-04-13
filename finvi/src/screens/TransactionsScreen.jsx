import { useState, useMemo } from 'react'
import { useStore } from '../store.jsx'
import { CATEGORIES } from '../data.js'
import { formatBRL, formatTxDate } from '../utils.js'

export default function TransactionsScreen() {
  const { transactions, deleteTransaction } = useStore()
  const [filter, setFilter] = useState('Todas')
  const [search, setSearch] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(null)

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return [...transactions]
      .filter(t => (filter === 'Todas' || t.cat === filter) && t.desc.toLowerCase().includes(q))
      .sort((a, b) => new Date(b.date) - new Date(a.date))
  }, [transactions, filter, search])

  const totalIn  = filtered.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0)
  const totalOut = filtered.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0)

  const handleDelete = (id) => {
    deleteTransaction(id)
    setConfirmDelete(null)
  }

  return (
    <div className="fade-up">
      <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, color: 'var(--dark)', marginBottom: 16 }}>Extrato</h2>

      {/* Summary bar */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
        <div className="card" style={{ flex: 1, padding: 14, textAlign: 'center' }}>
          <p style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 3 }}>Entradas</p>
          <p style={{ fontSize: 15, fontWeight: 700, color: '#2ECC71' }}>+{formatBRL(totalIn)}</p>
        </div>
        <div className="card" style={{ flex: 1, padding: 14, textAlign: 'center' }}>
          <p style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 3 }}>Saídas</p>
          <p style={{ fontSize: 15, fontWeight: 700, color: '#e07070' }}>-{formatBRL(totalOut)}</p>
        </div>
      </div>

      {/* Search */}
      <input
        className="input-base"
        style={{ marginBottom: 12, borderRadius: 100 }}
        placeholder="🔍  Buscar transação..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      {/* Category chips */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 6, marginBottom: 14 }}>
        {CATEGORIES.map(c => (
          <span key={c} className={`chip ${filter === c ? 'active' : ''}`} onClick={() => setFilter(c)}>
            {c}
          </span>
        ))}
      </div>

      {/* List */}
      <div className="card">
        {filtered.length === 0
          ? <p style={{ color: 'var(--muted)', textAlign: 'center', padding: '20px 0', fontStyle: 'italic' }}>Nenhuma transação encontrada</p>
          : filtered.map(t => (
            <div key={t.id} className="tx-row">
              <div style={{ width: 44, height: 44, borderRadius: 14, background: `${t.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                {t.emoji}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--dark)' }}>{t.desc}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)' }}>{t.cat} · {formatTxDate(t.date)}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                <p style={{ fontSize: 15, fontWeight: 600, color: t.amount > 0 ? '#2ecc71' : 'var(--dark)' }}>
                  {t.amount > 0 ? '+' : '-'}{formatBRL(Math.abs(t.amount))}
                </p>
                <button
                  onClick={() => setConfirmDelete(t)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 14, color: 'var(--muted)', padding: 4 }}
                  aria-label="Excluir transação"
                  title="Excluir"
                >✕</button>
              </div>
            </div>
          ))
        }
      </div>

      {/* Confirm delete modal */}
      {confirmDelete && (
        <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--dark)', marginBottom: 6 }}>Excluir transação?</h3>
            <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 20 }}>
              {confirmDelete.desc} — {formatBRL(Math.abs(confirmDelete.amount))}
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn-ghost" style={{ flex: 1 }} onClick={() => setConfirmDelete(null)}>Cancelar</button>
              <button className="btn-primary" style={{ flex: 1, background: '#DC2626' }} onClick={() => handleDelete(confirmDelete.id)}>Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
