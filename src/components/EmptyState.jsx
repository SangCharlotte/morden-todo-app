// A tiny "presentational" component: no state, no logic — just shows a
// message based on the prop it receives. Small components like this keep
// the bigger ones easy to read.

const MESSAGES = {
  all: { emoji: '📝', text: 'Nothing here yet. Add your first to-do!' },
  active: { emoji: '🎉', text: 'All caught up — no active tasks.' },
  done: { emoji: '⏳', text: 'No completed tasks yet. You got this!' },
}

export default function EmptyState({ filter }) {
  const { emoji, text } = MESSAGES[filter]

  return (
    <div className="empty">
      <span className="empty-emoji">{emoji}</span>
      <p>{text}</p>
    </div>
  )
}
