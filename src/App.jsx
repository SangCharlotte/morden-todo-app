// LESSON 2 — The App component (the "brain" of the app)
// A component is a JavaScript function that returns JSX (HTML-like syntax).
// App owns the STATE (the data that changes) and passes it DOWN to child
// components through PROPS. Children talk back UP by calling functions
// that App gives them (e.g. onAdd, onToggle). This is called "lifting state up".

import { useState, useMemo } from 'react'
import { useLocalStorage } from './hooks/useLocalStorage'
import Header from './components/Header'
import TodoForm from './components/TodoForm'
import FilterBar from './components/FilterBar'
import TodoList from './components/TodoList'
import Stats from './components/Stats'
import PomodoroTimer from './components/PomodoroTimer'
import Insights from './components/Insights'
import { smallConfetti, bigConfetti, playDing, playFanfare } from './effects'
import { toDateKey } from './dates'
import { downloadTodosCsv } from './csv'

// Some starter data so the app isn't empty the first time you open it.
const STARTER_TODOS = [
  { id: 1, text: 'Read the comments in App.jsx', done: true, priority: 'high' },
  { id: 2, text: 'Add your own to-do above', done: false, priority: 'medium' },
  { id: 3, text: 'Double-click a to-do to edit it', done: false, priority: 'low' },
]

export default function App() {
  // LESSON 3 — State
  // State is data that, when changed, makes React re-render the screen.
  // useLocalStorage works like useState but also saves to the browser.
  const [todos, setTodos] = useLocalStorage('todos', STARTER_TODOS)
  const [theme, setTheme] = useLocalStorage('theme', 'light')
  const [soundOn, setSoundOn] = useLocalStorage('soundOn', true)
  const [view, setView] = useLocalStorage('view', 'tasks') // 'tasks' | 'insights'

  // A log of every completion: [{ taskId, date: "YYYY-MM-DD" }, ...].
  // It's separate from `todos` so your history survives deleting a task or
  // "Clear completed". The first time the app runs with this feature, tasks
  // that are already done are added with date: null (we don't know when).
  const [completions, setCompletions] = useLocalStorage(
    'completions',
    todos.filter(t => t.done).map(t => ({ taskId: t.id, date: null }))
  )

  // Plain useState for things we don't need to remember after a refresh.
  const [filter, setFilter] = useState('all') // 'all' | 'active' | 'done'
  const [search, setSearch] = useState('')

  // ---------- Event handlers: the only places that change `todos` ----------
  // RULE: never modify state directly (no todos.push!). Always create a NEW
  // array/object and pass it to the setter. That's how React notices changes.

  // dueDate is a string like "2026-10-25", or "" when no date was picked.
  function addTodo(text, priority, dueDate) {
    const newTodo = { id: Date.now(), text, done: false, priority, dueDate }
    setTodos([newTodo, ...todos]) // spread = copy the old items into a new array
  }

  // Record that task `id` was finished today — or forget it, if it gets
  // un-checked again, so ticking a box on and off doesn't inflate the stats.
  function logCompletion(id) {
    setCompletions([...completions, { taskId: id, date: toDateKey(new Date()) }])
  }

  function unlogCompletion(id) {
    setCompletions(completions.filter(c => c.taskId !== id))
  }

  // Confetti + sound for finishing task `id`. `origin` is where to burst
  // the confetti from ({ x, y } from 0 to 1 across the window).
  function celebrate(id, origin) {
    // Was this the last unfinished task? Then throw a bigger party.
    const finishedEverything = todos.every(t => t.id === id || t.done)
    if (finishedEverything) {
      bigConfetti()
      if (soundOn) playFanfare()
    } else {
      smallConfetti(origin.x, origin.y)
      if (soundOn) playDing()
    }
  }

  // Save changes to task `id`, and keep the completion log (for Insights)
  // and the celebration effects in step with its `done` state.
  function updateTodo(id, changes, origin) {
    const todo = todos.find(t => t.id === id)
    setTodos(todos.map(t => (t.id === id ? { ...t, ...changes } : t)))

    // Effects are only for CHECKING a task, not for un-checking it.
    if (changes.done === true && !todo.done) {
      logCompletion(id)
      celebrate(id, origin)
    } else if (changes.done === false && todo.done) {
      unlogCompletion(id)
    }
  }

  function toggleTodo(id, origin) {
    const todo = todos.find(t => t.id === id)
    updateTodo(id, { done: !todo.done }, origin)
  }

  function editTodo(id, newText) {
    setTodos(todos.map(t => (t.id === id ? { ...t, text: newText } : t)))
  }

  function deleteTodo(id) {
    setTodos(todos.filter(t => t.id !== id))
  }

  // Move task `fromId` so it sits just before or after task `toId`.
  // Take it out of a copy of the array, then splice it back in at its new spot.
  function moveTodo(fromId, toId, position) {
    if (fromId === toId) return
    const moving = todos.find(t => t.id === fromId)
    const rest = todos.filter(t => t.id !== fromId)
    const targetIndex = rest.findIndex(t => t.id === toId)
    rest.splice(position === 'before' ? targetIndex : targetIndex + 1, 0, moving)
    setTodos(rest)
  }

  function clearCompleted() {
    setTodos(todos.filter(t => !t.done))
  }

  function toggleTheme() {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  function toggleSound() {
    setSoundOn(!soundOn)
  }

  // LESSON 9 — Derived data & useMemo
  // We DON'T store "visible todos" in state — we calculate it from existing
  // state. useMemo caches the result and only recalculates when the
  // dependencies [todos, filter, search] change.
  const visibleTodos = useMemo(() => {
    return todos
      .filter(t => (filter === 'active' ? !t.done : filter === 'done' ? t.done : true))
      .filter(t => t.text.toLowerCase().includes(search.toLowerCase()))
  }, [todos, filter, search])

  const doneCount = todos.filter(t => t.done).length
  const activeTodos = todos.filter(t => !t.done)

  // LESSON 4 — JSX & composition
  // Below we build the UI out of smaller components, like LEGO bricks.
  // Anything inside { } is JavaScript. `className` is used instead of `class`.
  return (
    <div className="app" data-theme={theme}>
      <PomodoroTimer tasks={activeTodos} soundOn={soundOn} />

      <main className="card">
        <Header
          theme={theme}
          onToggleTheme={toggleTheme}
          soundOn={soundOn}
          onToggleSound={toggleSound}
        />

        <nav className="view-tabs" aria-label="Views">
          <button
            className={view === 'tasks' ? 'active' : ''}
            onClick={() => setView('tasks')}
            aria-pressed={view === 'tasks'}
          >
            Tasks
          </button>
          <button
            className={view === 'insights' ? 'active' : ''}
            onClick={() => setView('insights')}
            aria-pressed={view === 'insights'}
          >
            Insights
          </button>
        </nav>

        {/* && renders the right side only when the left side is true */}
        {view === 'tasks' && (
          <>
            <TodoForm onAdd={addTodo} />

            <FilterBar
              filter={filter}
              onFilterChange={setFilter}
              search={search}
              onSearchChange={setSearch}
            />

            <TodoList
              todos={visibleTodos}
              onToggle={toggleTodo}
              onEdit={editTodo}
              onDelete={deleteTodo}
              onMove={moveTodo}
              filter={filter}
            />

            <Stats
              total={todos.length}
              done={doneCount}
              onClearCompleted={clearCompleted}
              onExport={() => downloadTodosCsv(todos)}
            />
          </>
        )}

        {view === 'insights' && <Insights completions={completions} />}
      </main>

      {view === 'tasks' && (
        <p className="hint">Tip: double-click a task to edit it · press Esc to cancel</p>
      )}
    </div>
  )
}
