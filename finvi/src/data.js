// Blank initial state — user preenche tudo na mão.
// Mantemos as categorias de orçamento zeradas (limite 0) como ponto de partida:
// o usuário só precisa editar o limite de cada uma via botão ✏️.

export const CATEGORIES = ['Todas', 'Receita', 'Alimentação', 'Transporte', 'Assinaturas', 'Saúde', 'Contas', 'Lazer']

const emptyBudgets = [
  { cat: 'Alimentação', emoji: '🍔', limit: 0, color: '#FF6B35' },
  { cat: 'Transporte',  emoji: '🚗', limit: 0, color: '#3498DB' },
  { cat: 'Assinaturas', emoji: '📱', limit: 0, color: '#9B59B6' },
  { cat: 'Saúde',       emoji: '💊', limit: 0, color: '#2ECC71' },
  { cat: 'Contas',      emoji: '🏠', limit: 0, color: '#F39C12' },
  { cat: 'Lazer',       emoji: '🎉', limit: 0, color: '#3498DB' },
]

export const SEED = {
  transactions: [],
  budgets: emptyBudgets,
  goals: [],
  cards: [],
  theme: 'light',
}
