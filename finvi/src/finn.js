// Offline-first "Finn" analyzer. Responds using the user's real data.
// Heuristic keyword matcher — intentionally simple, deterministic, and fast.
// Designed so a real LLM backend can be added later as a fallback.
import { formatBRL, currentMonthName } from './utils.js'

const has = (q, ...words) => words.some(w => q.includes(w))

export function analyzeQuestion(question, store) {
  const q = (question || '').toLowerCase().trim()
  const { txCurrent, expenses, income, balance, budgets, goals, cards } = store

  if (!q) return 'Me pergunta alguma coisa — tipo "quanto gastei esse mês?"'

  // Saudações
  if (has(q, 'oi', 'olá', 'ola', 'bom dia', 'boa tarde', 'boa noite', 'e aí', 'tudo bem')) {
    return `Oi! Tudo certo por aqui. Seu saldo agora é ${formatBRL(balance)}. Quer saber de algo específico?`
  }

  // Total de gastos / despesas
  if (has(q, 'quanto gastei', 'quanto gastou', 'total de gastos', 'total de despesas', 'despesa total', 'meus gastos', 'gastei esse')) {
    const diff = income - expenses
    const tail = diff >= 0
      ? `Ainda sobra ${formatBRL(diff)} da sua renda.`
      : `Tá ${formatBRL(Math.abs(diff))} acima da renda — atenção!`
    return `Em ${currentMonthName()} você gastou ${formatBRL(expenses)}. ${tail}`
  }

  // Receitas
  if (has(q, 'quanto recebi', 'quanto ganhei', 'receita', 'renda', 'entrou')) {
    return `Sua renda em ${currentMonthName()} foi de ${formatBRL(income)}.`
  }

  // Saldo
  if (has(q, 'saldo', 'quanto tenho', 'quanto sobra', 'quanto resta')) {
    return `Seu saldo atual é ${formatBRL(balance)}.`
  }

  // Maior gasto
  if (has(q, 'maior gasto', 'gastei mais', 'onde gastei mais', 'mais caro')) {
    const biggest = [...txCurrent].filter(t => t.amount < 0).sort((a, b) => a.amount - b.amount)[0]
    if (!biggest) return `Ainda não vi gastos em ${currentMonthName()}.`
    return `Seu maior gasto foi "${biggest.desc}" — ${formatBRL(Math.abs(biggest.amount))} em ${biggest.cat}.`
  }

  // Assinaturas
  if (has(q, 'assinatura')) {
    const subs = txCurrent.filter(t => t.cat === 'Assinaturas')
    if (subs.length === 0) return 'Não vi nenhuma assinatura esse mês.'
    const total = subs.reduce((s, t) => s + Math.abs(t.amount), 0)
    const names = subs.map(s => s.desc).join(', ')
    return `Você tem ${subs.length} assinaturas somando ${formatBRL(total)}: ${names}.`
  }

  // Economizar
  if (has(q, 'economizar', 'economia', 'cortar', 'guardar mais', 'apertar')) {
    const hot = budgets
      .filter(b => b.limit > 0 && b.spent / b.limit > 0.6)
      .sort((a, b) => (b.spent / b.limit) - (a.spent / a.limit))[0]
    if (hot) {
      const pct = ((hot.spent / hot.limit) * 100).toFixed(0)
      return `Dá pra economizar em ${hot.cat}: já tá em ${pct}% do limite (${formatBRL(hot.spent)}). Cortar um pouco aí já ajuda bastante.`
    }
    return 'Seus orçamentos estão sob controle. Pra guardar mais, aumenta o aporte nas metas!'
  }

  // Metas
  if (has(q, 'meta', 'objetivo', 'viagem', 'bato', 'sonho', 'guardar')) {
    if (!goals || goals.length === 0) return 'Você ainda não tem metas cadastradas — cria uma na aba Metas!'
    const goal =
      goals.find(g => q.includes(g.name.toLowerCase())) ||
      goals.find(g => g.name.toLowerCase().split(' ').some(w => w.length > 3 && q.includes(w))) ||
      goals[0]
    const falta = Math.max(0, goal.target - goal.saved)
    const pct = ((goal.saved / goal.target) * 100).toFixed(0)
    if (falta === 0) return `Sua meta "${goal.name}" já tá 100% batida! 🎉`
    return `Sua meta "${goal.name}" está em ${pct}%. Faltam ${formatBRL(falta)} pra chegar lá.`
  }

  // Cartões
  if (has(q, 'cartão', 'cartao', 'cartões', 'fatura', 'limite')) {
    if (!cards || cards.length === 0) return 'Você ainda não cadastrou cartões.'
    const totalUsed = cards.reduce((s, c) => s + c.used, 0)
    const totalLimit = cards.reduce((s, c) => s + c.limit, 0)
    const pct = totalLimit ? ((totalUsed / totalLimit) * 100).toFixed(0) : 0
    return `Seus cartões somam ${formatBRL(totalUsed)} em faturas, de ${formatBRL(totalLimit)} disponíveis (${pct}% do limite).`
  }

  // No caminho certo
  if (has(q, 'caminho certo', 'tô bem', 'to bem', 'estou bem', 'tá tudo bem', 'como estou', 'como está')) {
    if (income === 0) return 'Ainda não vi renda esse mês. Assim que entrar algo eu consigo avaliar melhor!'
    if (expenses < income * 0.7) return `Tá indo muito bem! Gastou ${formatBRL(expenses)} de ${formatBRL(income)} — sobra ${formatBRL(income - expenses)} pra guardar.`
    if (expenses < income) return `Tá no limite: ${formatBRL(expenses)} gastos de ${formatBRL(income)} que entraram. Dá pra apertar um pouco.`
    return `Atenção: gastos (${formatBRL(expenses)}) passaram da renda (${formatBRL(income)}). Precisa cortar alguma coisa.`
  }

  // Categoria específica por nome
  const catHit = budgets.find(b => q.includes(b.cat.toLowerCase()))
  if (catHit) {
    const pct = catHit.limit ? ((catHit.spent / catHit.limit) * 100).toFixed(0) : 0
    const restante = Math.max(0, catHit.limit - catHit.spent)
    return `Em ${catHit.cat} você gastou ${formatBRL(catHit.spent)} de ${formatBRL(catHit.limit)} (${pct}%). Ainda tem ${formatBRL(restante)} disponível.`
  }

  // Fallback
  return 'Posso te contar sobre gastos, receitas, saldo, categorias, assinaturas, metas ou cartões. O que você quer saber?'
}
