// LESSON 13 — Computing values during render
// Stats receives plain numbers and calculates the percentage itself.
// You don't need state for values you can compute from props.
// Inline `style` takes a JavaScript object: style={{ width: '50%' }}

export default function Stats({ total, done, onClearCompleted, onExport }) {
  const percent = total === 0 ? 0 : Math.round((done / total) * 100)
  const left = total - done

  return (
    <footer className="stats">
      <div className="progress" aria-label={`${percent}% complete`}>
        <div className="progress-fill" style={{ width: `${percent}%` }} />
      </div>

      <div className="stats-row">
        <span>
          {left} {left === 1 ? 'task' : 'tasks'} left · {percent}% done
        </span>

        <div className="stats-actions">
          <button
            className="export-btn"
            onClick={onExport}
            disabled={total === 0}
            title="Download all tasks as a spreadsheet"
          >
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="M8 2v8M4.5 6.5 8 10l3.5-3.5M2.5 13.5h11" />
            </svg>
            Export CSV
          </button>
          <button className="link-btn" onClick={onClearCompleted} disabled={done === 0}>
            Clear completed
          </button>
        </div>
      </div>
    </footer>
  )
}
