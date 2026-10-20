// LESSON 6 — Forms & controlled inputs
// A "controlled input" is an <input> whose value comes from React state.
// Every keystroke calls onChange -> we update state -> React re-renders the
// input with the new value. React is always the single source of truth.
//
// This component also shows LOCAL state: the text being typed only matters
// to the form, so it lives here, not in App.

import { useState, useRef } from 'react'

export default function TodoForm({ onAdd }) {
  const [text, setText] = useState('')
  const [priority, setPriority] = useState('medium')
  const [dueDate, setDueDate] = useState('') // '' means "no due date"
  const [error, setError] = useState('')

  // useRef gives us direct access to a DOM element (here: to re-focus the input).
  const inputRef = useRef(null)

  function handleSubmit(event) {
    event.preventDefault() // stop the browser from reloading the page

    const trimmed = text.trim()
    if (!trimmed) {
      setError('Please type something first.')
      return
    }

    onAdd(trimmed, priority, dueDate) // tell the parent (App) about the new to-do
    setText('')                       // clear the inputs
    setDueDate('')
    setError('')
    inputRef.current.focus() // put the cursor back for the next task
  }

  return (
    <form className="todo-form" onSubmit={handleSubmit}>
      <div className="form-row">
        <input
          ref={inputRef}
          type="text"
          placeholder="What needs to be done?"
          value={text}
          onChange={e => {
            setText(e.target.value)
            if (error) setError('')
          }}
          aria-label="New to-do"
        />

        <select
          value={priority}
          onChange={e => setPriority(e.target.value)}
          aria-label="Priority"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

        {/* A date input is controlled the same way as a text input.
            Its value is always a "YYYY-MM-DD" string (or "" if empty). */}
        <input
          type="date"
          className="date-input"
          value={dueDate}
          onChange={e => setDueDate(e.target.value)}
          aria-label="Due date"
        />

        <button type="submit" className="primary-btn">Add</button>
      </div>

      {/* Conditional rendering: `condition && <JSX>` shows the JSX only if true */}
      {error && <p className="error">{error}</p>}
    </form>
  )
}
