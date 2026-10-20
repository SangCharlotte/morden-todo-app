// LESSON 10 — Rendering from data
// Instead of writing three almost-identical buttons by hand, we keep the
// options in an array and use .map() to turn each one into a <button>.

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'done', label: 'Done' },
]

export default function FilterBar({ filter, onFilterChange, search, onSearchChange }) {
  return (
    <div className="filter-bar">
      <div className="filters" role="group" aria-label="Filter to-dos">
        {FILTERS.map(f => (
          <button
            key={f.value}
            // Dynamic className: add "active" only to the selected filter
            className={`chip ${filter === f.value ? 'active' : ''}`}
            onClick={() => onFilterChange(f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <input
        type="search"
        className="search"
        placeholder="Search…"
        value={search}
        onChange={e => onSearchChange(e.target.value)}
        aria-label="Search to-dos"
      />
    </div>
  )
}
