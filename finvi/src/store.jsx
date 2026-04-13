import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import { SEED } from './data.js'
import { currentMonthKey, monthKey } from './utils.js'

const STORAGE_KEY = 'finvi-state-v2'
const StoreContext = createContext(null)

const loadInitial = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      // Merge with SEED for forward-compat (new fields)
      return {
        transactions: parsed.transactions ?? SEED.transactions,
        budgets:      parsed.budgets      ?? SEED.budgets,
        goals:        parsed.goals        ?? SEED.goals,
        cards:        parsed.cards        ?? SEED.cards,
        theme:        parsed.theme        ?? SEED.theme,
      }
    }
  } catch {}
  return SEED
}

export function StoreProvider({ children }) {
  const [state, setState] = useState(loadInitial)

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)) } catch {}
  }, [state])

  // Apply theme to <html data-theme> so CSS can react to it.
  useEffect(() => {
    document.documentElement.dataset.theme = state.theme || 'light'
  }, [state.theme])

  // ── Mutations ──────────────────────────────────────────────────────────────
  const addTransaction = useCallback((tx) => {
    setState(s => ({ ...s, transactions: [{ ...tx, id: Date.now() }, ...s.transactions] }))
  }, [])

  const deleteTransaction = useCallback((id) => {
    setState(s => ({ ...s, transactions: s.transactions.filter(t => t.id !== id) }))
  }, [])

  const updateBudgetLimit = useCallback((cat, limit) => {
    setState(s => ({ ...s, budgets: s.budgets.map(b => b.cat === cat ? { ...b, limit } : b) }))
  }, [])

  const addGoal = useCallback((goal) => {
    setState(s => ({ ...s, goals: [...s.goals, { ...goal, id: Date.now() }] }))
  }, [])

  const deleteGoal = useCallback((id) => {
    setState(s => ({ ...s, goals: s.goals.filter(g => g.id !== id) }))
  }, [])

  const setTheme = useCallback((theme) => {
    setState(s => ({ ...s, theme }))
  }, [])

  const toggleTheme = useCallback(() => {
    setState(s => ({ ...s, theme: s.theme === 'dark' ? 'light' : 'dark' }))
  }, [])

  const resetAll = useCallback(() => {
    try { localStorage.removeItem(STORAGE_KEY) } catch {}
    setState(SEED)
  }, [])

  // ── Derived state ──────────────────────────────────────────────────────────
  const derived = useMemo(() => {
    const curKey = currentMonthKey()

    // Previous month key
    const d = new Date()
    const prev = new Date(d.getFullYear(), d.getMonth() - 1, 1)
    const prevKey = `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, '0')}`

    const txCurrent = state.transactions.filter(t => monthKey(t.date) === curKey)
    const txPrev    = state.transactions.filter(t => monthKey(t.date) === prevKey)

    const income   = txCurrent.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0)
    const expenses = txCurrent.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0)
    const balance  = state.transactions.reduce((s, t) => s + t.amount, 0)

    const lastMonthExpenses = txPrev.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0)
    const expensesDiff = lastMonthExpenses - expenses // positive = saved vs last month

    // Budgets with `spent` computed from current-month transactions
    const budgets = state.budgets.map(b => ({
      ...b,
      spent: txCurrent
        .filter(t => t.cat === b.cat && t.amount < 0)
        .reduce((s, t) => s + Math.abs(t.amount), 0),
    }))

    return { txCurrent, income, expenses, balance, lastMonthExpenses, expensesDiff, budgets }
  }, [state])

  const value = {
    // raw
    transactions: state.transactions,
    goals:        state.goals,
    cards:        state.cards,
    theme:        state.theme,
    // derived (overrides stored budgets with enriched version)
    ...derived,
    // actions
    addTransaction,
    deleteTransaction,
    updateBudgetLimit,
    addGoal,
    deleteGoal,
    setTheme,
    toggleTheme,
    resetAll,
  }

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export const useStore = () => {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}
