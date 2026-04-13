import { useState } from 'react'
import './styles.css'
import { useStore } from './store.jsx'
import HomeScreen         from './screens/HomeScreen.jsx'
import TransactionsScreen from './screens/TransactionsScreen.jsx'
import BudgetsScreen      from './screens/BudgetsScreen.jsx'
import GoalsScreen        from './screens/GoalsScreen.jsx'
import CardsScreen        from './screens/CardsScreen.jsx'
import AddScreen          from './screens/AddScreen.jsx'
import ChatScreen         from './screens/ChatScreen.jsx'

// Mobile bottom nav (5 slots, central "Adicionar")
const BOTTOM_NAV = [
  { id: 'home',         icon: '🏠', label: 'Início' },
  { id: 'transactions', icon: '📋', label: 'Extrato' },
  { id: 'add',          icon: '➕', label: 'Adicionar', center: true },
  { id: 'budgets',      icon: '🎯', label: 'Orçamento' },
  { id: 'chat',         icon: '💬', label: 'Finn IA' },
]

// Desktop sidebar nav (full menu)
const SIDE_NAV = [
  { id: 'home',         icon: '🏠', label: 'Início' },
  { id: 'transactions', icon: '📋', label: 'Extrato' },
  { id: 'add',          icon: '➕', label: 'Adicionar' },
  { id: 'budgets',      icon: '🎯', label: 'Orçamento' },
  { id: 'goals',        icon: '🏆', label: 'Metas' },
  { id: 'cards',        icon: '💳', label: 'Cartões' },
  { id: 'chat',         icon: '💬', label: 'Finn IA' },
]

const greetingFor = (hour) => {
  if (hour < 12) return 'Bom dia'
  if (hour < 18) return 'Boa tarde'
  return 'Boa noite'
}

export default function App() {
  const [tab, setTab] = useState('home')
  const { theme, toggleTheme } = useStore()
  const greeting = greetingFor(new Date().getHours())

  const navigate = (t) => setTab(t)

  const screens = {
    home:         <HomeScreen onNavigate={navigate} />,
    transactions: <TransactionsScreen />,
    budgets:      <BudgetsScreen />,
    goals:        <GoalsScreen />,
    cards:        <CardsScreen />,
    add:          <AddScreen onNavigate={navigate} />,
    chat:         <ChatScreen />,
  }

  return (
    <div className="app-shell">

      {/* ── Sidebar (desktop) ── */}
      <aside className="sidebar-nav">
        <div className="sidebar-nav__brand">
          <div className="brand-logo__icon">🦁</div>
          <span className="brand-logo__name">FinVi</span>
        </div>

        <div className="sidebar-nav__items">
          {SIDE_NAV.map(n => (
            <button
              key={n.id}
              className={`side-btn ${tab === n.id ? 'active' : ''}`}
              onClick={() => navigate(n.id)}
            >
              <span className="side-btn__icon">{n.icon}</span>
              <span className="side-btn__label">{n.label}</span>
            </button>
          ))}
        </div>

        <button
          onClick={toggleTheme}
          className="side-btn side-btn--theme"
          aria-label="Alternar tema"
        >
          <span className="side-btn__icon">{theme === 'dark' ? '☀️' : '🌙'}</span>
          <span className="side-btn__label">{theme === 'dark' ? 'Tema claro' : 'Tema escuro'}</span>
        </button>
      </aside>

      {/* ── Main column ── */}
      <div className="app-main">

        {/* Header */}
        <header className="app-header">
          <div>
            <p className="app-header__greet">{greeting},</p>
            <h1 className="app-header__name">Ana Silva 👋</h1>
          </div>
          <div className="app-header__right">
            <button
              onClick={toggleTheme}
              className="icon-btn app-header__theme-mobile"
              aria-label="Alternar tema"
              title="Alternar tema"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            <div className="brand-logo app-header__brand-mobile">
              <div className="brand-logo__icon">🦁</div>
              <span className="brand-logo__name">FinVi</span>
            </div>
          </div>
        </header>

        {/* Screen content */}
        <div className={`screen-scroll ${tab === 'chat' ? 'screen-scroll--chat' : ''}`}>
          {screens[tab] || screens.home}
        </div>

        {/* Bottom Nav (mobile) */}
        <div className="bottom-nav">
          {BOTTOM_NAV.map(n => n.center
            ? (
              <button key={n.id} className="nav-btn" onClick={() => navigate(n.id)} style={{ padding: 0 }}>
                <div className="nav-btn__center" style={{
                  background: tab === n.id ? '#3d2d1e' : '#1a1410',
                  transform: tab === n.id ? 'scale(1.08)' : 'scale(1)',
                }}>
                  {n.icon}
                </div>
              </button>
            )
            : (
              <button key={n.id} className={`nav-btn ${tab === n.id ? 'active' : ''}`} onClick={() => navigate(n.id)}>
                <span className="nav-icon">{n.icon}</span>
                <span style={{ fontWeight: tab === n.id ? 600 : 400 }}>{n.label}</span>
              </button>
            )
          )}
        </div>
      </div>
    </div>
  )
}
