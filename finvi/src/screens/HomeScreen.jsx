import { useState, useMemo } from 'react'
import { useStore } from '../store.jsx'
import { formatBRL, formatBRLCompact, formatTxDate } from '../utils.js'

export default function HomeScreen({ onNavigate }) {
  const { balance, income, expenses, expensesDiff, txCurrent, cards, budgets, goals } = useStore()
  const [balanceVisible, setBalanceVisible] = useState(true)

  const recent = useMemo(
    () => [...txCurrent].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5),
    [txCurrent]
  )

  // Computed insights — based on real data, ranked by relevance.
  const insights = useMemo(() => {
    const list = []

    const hottest = [...budgets]
      .filter(b => b.limit > 0)
      .sort((a, b) => (b.spent / b.limit) - (a.spent / a.limit))[0]
    if (hottest) {
      const pct = Math.round((hottest.spent / hottest.limit) * 100)
      const left = Math.max(0, hottest.limit - hottest.spent)
      if (pct >= 100) {
        list.push({
          icon: '🚨',
          text: `${hottest.cat} ultrapassou o orçamento — você gastou ${formatBRL(hottest.spent)} de ${formatBRL(hottest.limit)}.`,
          bg: '#FEE2E2', border: '#EF4444',
        })
      } else if (pct >= 70) {
        list.push({
          icon: '⚠️',
          text: `Seus gastos com ${hottest.cat.toLowerCase()} estão em ${pct}% do orçamento. Ainda sobram ${formatBRL(left)}.`,
          bg: '#FFF3E0', border: '#FFB74D',
        })
      }
    }

    if (expensesDiff > 0) {
      list.push({
        icon: '✨',
        text: `Você economizou ${formatBRL(expensesDiff)} comparado ao mês anterior. Excelente!`,
        bg: '#E8F5E9', border: '#66BB6A',
      })
    } else if (expensesDiff < 0) {
      list.push({
        icon: '📈',
        text: `Você gastou ${formatBRL(Math.abs(expensesDiff))} a mais que no mês passado.`,
        bg: '#FFF3E0', border: '#FFB74D',
      })
    }

    const subs = txCurrent.filter(t => t.cat === 'Assinaturas')
    if (subs.length > 0) {
      const total = subs.reduce((s, t) => s + Math.abs(t.amount), 0)
      list.push({
        icon: '🔔',
        text: `${subs.length} assinaturas ativas somando ${formatBRL(total)} esse mês.`,
        bg: '#EDE7F6', border: '#9575CD',
      })
    }

    const closeGoal = [...goals]
      .map(g => ({ ...g, pct: g.target ? (g.saved / g.target) : 0 }))
      .filter(g => g.pct >= 0.6 && g.pct < 1)
      .sort((a, b) => b.pct - a.pct)[0]
    if (closeGoal) {
      list.push({
        icon: '🎯',
        text: `Meta "${closeGoal.name}" em ${Math.round(closeGoal.pct * 100)}% — falta ${formatBRL(closeGoal.target - closeGoal.saved)}.`,
        bg: '#E3F2FD', border: '#64B5F6',
      })
    }

    return list.slice(0, 3)
  }, [budgets, expensesDiff, txCurrent, goals])

  const diffLabel = expensesDiff >= 0
    ? `↑ ${formatBRL(expensesDiff)} economizados vs mês passado`
    : `↓ ${formatBRL(Math.abs(expensesDiff))} a mais que mês passado`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* ── Balance Card ── */}
      <div className="card fade-up" style={{
        background: 'linear-gradient(135deg,#1a1410 0%,#3d2d1e 100%)',
        color: '#f5f3ef', padding: 24, position: 'relative', overflow: 'hidden',
        animationDelay: '0s',
      }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} />
        <div style={{ position: 'absolute', bottom: -20, left: 20, width: 90, height: 90, borderRadius: '50%', background: 'rgba(255,255,255,0.025)' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
          <p style={{ fontSize: 11, color: '#8a7a6a', letterSpacing: 1.2, textTransform: 'uppercase', fontWeight: 500 }}>Saldo Total</p>
          <button
            onClick={() => setBalanceVisible(v => !v)}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 15, opacity: 0.5, color: '#fff', padding: 0 }}
            aria-label={balanceVisible ? 'Ocultar saldo' : 'Mostrar saldo'}
          >
            {balanceVisible ? '🙈' : '👁️'}
          </button>
        </div>

        <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 36, letterSpacing: -1, marginBottom: 4 }}>
          {balanceVisible ? formatBRL(balance) : 'R$ ••••••'}
        </h2>
        <p style={{ fontSize: 12, color: expensesDiff >= 0 ? '#5a9a5a' : '#e07070', marginBottom: 20 }}>{diffLabel}</p>

        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ flex: 1, background: 'rgba(255,255,255,0.07)', borderRadius: 14, padding: '12px 14px' }}>
            <p style={{ fontSize: 11, color: '#7a6a5a', marginBottom: 5 }}>Receitas</p>
            <p style={{ fontSize: 15, fontWeight: 600, color: '#7ec87e' }}>+{formatBRL(income)}</p>
          </div>
          <div style={{ flex: 1, background: 'rgba(255,255,255,0.07)', borderRadius: 14, padding: '12px 14px' }}>
            <p style={{ fontSize: 11, color: '#7a6a5a', marginBottom: 5 }}>Despesas</p>
            <p style={{ fontSize: 15, fontWeight: 600, color: '#e07a7a' }}>-{formatBRL(expenses)}</p>
          </div>
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <div className="fade-up" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, animationDelay: '0.05s' }}>
        {[
          { icon: '➕', label: 'Adicionar', tab: 'add' },
          { icon: '📊', label: 'Relatório', tab: 'budgets' },
          { icon: '🎯', label: 'Metas',     tab: 'goals' },
          { icon: '💳', label: 'Cartões',   tab: 'cards' },
        ].map(a => (
          <button
            key={a.label}
            onClick={() => onNavigate(a.tab)}
            className="quick-action"
          >
            <span style={{ fontSize: 24 }}>{a.icon}</span>
            <span style={{ fontSize: 11, color: 'var(--text-soft)', fontWeight: 500 }}>{a.label}</span>
          </button>
        ))}
      </div>

      {/* ── Cards Preview ── */}
      {cards.length > 0 && (
        <div className="fade-up" style={{ animationDelay: '0.08s' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-soft)', letterSpacing: 0.3 }}>CARTÕES</h3>
            <button onClick={() => onNavigate('cards')} style={{ fontSize: 12, color: '#c8a882', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>
              Ver todos
            </button>
          </div>
          <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
            {cards.map(c => (
              <div key={c.id} style={{
                minWidth: 160, background: `linear-gradient(135deg,${c.color},${c.color}99)`,
                borderRadius: 18, padding: 16, color: '#fff', flexShrink: 0,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ fontSize: 20 }}>{c.emoji}</span>
                  <span style={{ fontSize: 11, opacity: 0.7 }}>••{c.last4}</span>
                </div>
                <p style={{ fontSize: 11, opacity: 0.7, marginBottom: 2 }}>{c.bank}</p>
                <p style={{ fontSize: 15, fontWeight: 700 }}>{formatBRL(c.used)}</p>
                <div style={{ marginTop: 8, background: 'rgba(255,255,255,0.2)', borderRadius: 100, height: 4 }}>
                  <div style={{ width: `${(c.used / c.limit) * 100}%`, height: '100%', background: '#fff', borderRadius: 100 }} />
                </div>
                <p style={{ fontSize: 10, opacity: 0.6, marginTop: 4 }}>de {formatBRLCompact(c.limit)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Insights ── */}
      {insights.length > 0 && (
        <div className="fade-up" style={{ animationDelay: '0.1s' }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-soft)', letterSpacing: 0.3, marginBottom: 10 }}>INSIGHTS DO FINN</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {insights.map((ins, i) => (
              <div key={i} style={{ background: ins.bg, border: `1px solid ${ins.border}`, borderRadius: 14, padding: '12px 14px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 18, flexShrink: 0 }}>{ins.icon}</span>
                <p style={{ fontSize: 13, color: '#1a1410', lineHeight: 1.55 }}>{ins.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Recent Transactions ── */}
      <div className="card fade-up" style={{ animationDelay: '0.12s' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--dark)' }}>Transações Recentes</h3>
          <button onClick={() => onNavigate('transactions')} style={{ fontSize: 12, color: '#c8a882', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>
            Ver todas
          </button>
        </div>
        {recent.length === 0
          ? <p style={{ color: 'var(--muted)', textAlign: 'center', padding: '16px 0', fontStyle: 'italic', fontSize: 13 }}>Nenhuma transação esse mês ainda.</p>
          : recent.map(t => (
            <div key={t.id} className="tx-row">
              <div style={{ width: 42, height: 42, borderRadius: 13, background: `${t.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                {t.emoji}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--dark)' }}>{t.desc}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)' }}>{formatTxDate(t.date)}</p>
              </div>
              <p style={{ fontSize: 15, fontWeight: 600, color: t.amount > 0 ? '#2ecc71' : 'var(--dark)', flexShrink: 0 }}>
                {t.amount > 0 ? '+' : '-'}{formatBRL(Math.abs(t.amount))}
              </p>
            </div>
          ))
        }
      </div>
    </div>
  )
}
