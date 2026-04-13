import { useStore } from '../store.jsx'
import { formatBRL, formatBRLCompact, formatTxDate } from '../utils.js'

export default function CardsScreen() {
  const { cards, txCurrent } = useStore()

  return (
    <div className="fade-up">
      <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, color: 'var(--dark)', marginBottom: 16 }}>Meus Cartões</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {cards.map(c => {
          const pct = c.limit > 0 ? (c.used / c.limit) * 100 : 0
          // Most recent expenses of the current month as proxy for "lançamentos"
          const cardTx = [...txCurrent]
            .filter(t => t.amount < 0)
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 3)

          return (
            <div key={c.id}>
              {/* Card visual */}
              <div style={{
                background: `linear-gradient(135deg,${c.color} 0%,${c.color}bb 100%)`,
                borderRadius: 22, padding: 24, color: '#fff', marginBottom: 12,
                boxShadow: `0 8px 32px ${c.color}44`,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                  <span style={{ fontSize: 28 }}>{c.emoji}</span>
                  <span style={{ fontSize: 14, opacity: 0.8, fontWeight: 500 }}>{c.bank}</span>
                </div>
                <p style={{ fontSize: 13, opacity: 0.65, marginBottom: 2, letterSpacing: 2 }}>•••• •••• •••• {c.last4}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 16 }}>
                  <div>
                    <p style={{ fontSize: 11, opacity: 0.6, marginBottom: 2 }}>Fatura atual</p>
                    <p style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24 }}>{formatBRL(c.used)}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: 11, opacity: 0.6, marginBottom: 2 }}>Limite</p>
                    <p style={{ fontSize: 14, fontWeight: 600 }}>{formatBRLCompact(c.limit)}</p>
                  </div>
                </div>
                <div style={{ marginTop: 14, background: 'rgba(255,255,255,0.25)', borderRadius: 100, height: 5 }}>
                  <div style={{ width: `${Math.min(pct, 100)}%`, height: '100%', background: '#fff', borderRadius: 100 }} />
                </div>
                <p style={{ fontSize: 11, opacity: 0.6, marginTop: 6 }}>{pct.toFixed(0)}% do limite utilizado</p>
              </div>

              {/* Recent charges */}
              {cardTx.length > 0 && (
                <div className="card" style={{ padding: 16 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-soft)', marginBottom: 10 }}>LANÇAMENTOS RECENTES</p>
                  {cardTx.map(t => (
                    <div key={t.id} className="tx-row">
                      <span style={{ fontSize: 20 }}>{t.emoji}</span>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 13, fontWeight: 500 }}>{t.desc}</p>
                        <p style={{ fontSize: 11, color: 'var(--muted)' }}>{formatTxDate(t.date)}</p>
                      </div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--dark)' }}>-{formatBRL(Math.abs(t.amount))}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
