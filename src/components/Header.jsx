// LESSON 5 — Props
// Props are the inputs to a component, like arguments to a function.
// Here we "destructure" them: { theme, onToggleTheme } pulls the two values
// out of the props object. Header doesn't own any state — it just displays
// what it's given and calls onToggleTheme when the button is clicked.

export default function Header({ theme, onToggleTheme, soundOn, onToggleSound }) {
  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  return (
    <header className="header">
      <div>
        <h1>My To-Dos</h1>
        <p className="date">{today}</p>
      </div>

      <div className="header-buttons">
        <button
          className="icon-btn"
          onClick={onToggleSound}
          aria-label={soundOn ? 'Turn sound off' : 'Turn sound on'}
          title={soundOn ? 'Turn sound off' : 'Turn sound on'}
        >
          {soundOn ? '🔊' : '🔇'}
        </button>

        {/* onClick receives a function. Don't write onClick={onToggleTheme()} —
            the () would call it immediately during render! */}
        <button
          className="icon-btn"
          onClick={onToggleTheme}
          aria-label="Toggle dark mode"
          title="Toggle dark mode"
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
      </div>
    </header>
  )
}
