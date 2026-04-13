// ── Formatting ────────────────────────────────────────────────────────────────
export const formatBRL = (n) =>
  `R$ ${(Number(n) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export const formatBRLCompact = (n) =>
  `R$ ${(Number(n) || 0).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`

// Accepts "1.234,56", "1234.56", "1234,56", numbers, etc.
export const parseBRL = (v) => {
  if (typeof v === 'number') return v
  if (v == null) return NaN
  const s = String(v).trim().replace(/[^\d,.-]/g, '')
  if (!s) return NaN
  // If both separators present, assume "." is thousands and "," is decimal (pt-BR)
  const hasComma = s.includes(',')
  const hasDot = s.includes('.')
  let normalized = s
  if (hasComma && hasDot) normalized = s.replace(/\./g, '').replace(',', '.')
  else if (hasComma) normalized = s.replace(',', '.')
  return parseFloat(normalized)
}

// ── Dates ─────────────────────────────────────────────────────────────────────
export const monthKey = (iso) => {
  const d = new Date(iso)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export const currentMonthKey = () => monthKey(new Date().toISOString())

const MONTH_NAMES_LONG = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro']
const MONTH_NAMES_SHORT = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez']
const WEEKDAYS = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']

export const currentMonthName = () => MONTH_NAMES_LONG[new Date().getMonth()]

export const formatTxDate = (iso) => {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const txDay = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const diffDays = Math.round((today - txDay) / 86400000)
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  const hhmm = `${hh}:${mm}`
  if (diffDays === 0) return `Hoje, ${hhmm}`
  if (diffDays === 1) return `Ontem, ${hhmm}`
  if (diffDays > 1 && diffDays < 7) return `${WEEKDAYS[d.getDay()]}, ${hhmm}`
  const dd = String(d.getDate()).padStart(2, '0')
  return `${dd}/${MONTH_NAMES_SHORT[d.getMonth()]}, ${hhmm}`
}

// Relative-days helper for seed building
export const daysAgoISO = (days, hour = 12, minute = 0) => {
  const d = new Date()
  d.setDate(d.getDate() - days)
  d.setHours(hour, minute, 0, 0)
  return d.toISOString()
}

// ── Category meta ─────────────────────────────────────────────────────────────
export const CATEGORY_META = {
  'Alimentação': { emoji: '🍔', color: '#FF6B35' },
  'Transporte':  { emoji: '🚗', color: '#3498DB' },
  'Assinaturas': { emoji: '📱', color: '#9B59B6' },
  'Saúde':       { emoji: '💊', color: '#2ECC71' },
  'Contas':      { emoji: '🏠', color: '#F39C12' },
  'Lazer':       { emoji: '🎉', color: '#3498DB' },
  'Receita':     { emoji: '💼', color: '#2ECC71' },
  'Outro':       { emoji: '📦', color: '#8a6a4a' },
}

export const getCatMeta = (cat) => CATEGORY_META[cat] || CATEGORY_META.Outro
