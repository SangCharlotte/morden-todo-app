// LESSON 12 — A component with its own UI state
// Each TodoItem remembers whether IT is being edited. That state belongs
// here because no other component cares about it.
// It also shows keyboard events (Enter / Escape) and the ternary operator
// for choosing between two pieces of JSX.

import { useState, useRef, useEffect } from 'react'
import { toDateKey, fromDateKey } from '../dates'

// Helper functions live OUTSIDE the component: they don't use state or props,
// so there's no need to re-create them on every render.

// "2026-10-25" -> "Oct 25"
function formatDate(dateString) {
  return fromDateKey(dateString).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })
}

// Where an element is on screen, as 0–1 fractions of the window
// (used to aim the confetti).
function screenPosition(element) {
  const rect = element.getBoundingClientRect()
  return {
    x: (rect.left + rect.width / 2) / window.innerWidth,
    y: (rect.top + rect.height / 2) / window.innerHeight,
  }
}

// Six dots: the usual "you can grab this" symbol.
function GripIcon() {
  return (
    <svg viewBox="0 0 10 16" aria-hidden="true">
      {[3, 8, 13].map(y => (
        <g key={y}>
          <circle cx="3" cy={y} r="1.4" />
          <circle cx="7" cy={y} r="1.4" />
        </g>
      ))}
    </svg>
  )
}

export default function TodoItem({
  todo,
  onToggle,
  onEdit,
  onDelete,
  isDragging,
  dropPosition,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  onMoveBy,
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState(todo.text)
  const editRef = useRef(null)
  const itemRef = useRef(null)

  // When we switch into edit mode, focus and select the text automatically.
  useEffect(() => {
    if (isEditing) {
      editRef.current.focus()
      editRef.current.select()
    }
  }, [isEditing])

  function startEditing() {
    setDraft(todo.text)
    setIsEditing(true)
  }

  function save() {
    const trimmed = draft.trim()
    if (trimmed) onEdit(todo.id, trimmed)
    else setDraft(todo.text) // empty? keep the old text
    setIsEditing(false)
  }

  // The event object tells us which element was clicked. We send its
  // position up to App, so the confetti bursts from the checkbox.
  function handleToggle(e) {
    onToggle(todo.id, screenPosition(e.target))
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') save()
    if (e.key === 'Escape') {
      setDraft(todo.text)
      setIsEditing(false)
    }
  }

  // Only the handle is draggable (so selecting text or double-clicking
  // to edit still works), but the browser should show the WHOLE row
  // following the pointer — setDragImage does that.
  function handleDragStart(e) {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', todo.text) // Firefox won't drag without data
    e.dataTransfer.setDragImage(itemRef.current, 20, 20)
    onDragStart()
  }

  function handleHandleKeyDown(e) {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault() // don't scroll the page
      onMoveBy(e.key === 'ArrowUp' ? -1 : 1)
    }
  }

  // Work out the due-date status during render. "YYYY-MM-DD" strings sort
  // like dates, so plain < and === comparisons work. Older to-dos saved
  // before this feature have no dueDate, so we check it exists first.
  // A date input gives us "YYYY-MM-DD" strings, so compare against today's key.
  const today = toDateKey(new Date())
  let dueStatus = ''
  if (todo.dueDate && !todo.done) {
    if (todo.dueDate < today) dueStatus = 'overdue'
    else if (todo.dueDate === today) dueStatus = 'today'
  }

  return (
    <li
      ref={itemRef}
      className={[
        'todo-item',
        todo.done && 'done',
        isDragging && 'dragging',
        dropPosition && `drop-${dropPosition}`,
      ].filter(Boolean).join(' ')}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <div className="todo-row">
        <button
          className="drag-handle"
          draggable={!isEditing}
          onDragStart={handleDragStart}
          onDragEnd={onDragEnd}
          onKeyDown={handleHandleKeyDown}
          aria-label={`Reorder "${todo.text}" (drag, or use the arrow keys)`}
          title="Drag to reorder"
        >
          <GripIcon />
        </button>

        <input
          type="checkbox"
          className="checkbox"
          checked={todo.done}
          onChange={handleToggle}
          aria-label={`Mark "${todo.text}" as ${todo.done ? 'not done' : 'done'}`}
        />

        {/* Ternary: condition ? (show this) : (otherwise show this) */}
        {isEditing ? (
          <input
            ref={editRef}
            className="edit-input"
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={save}
            aria-label="Edit to-do"
          />
        ) : (
          <span className="todo-text" onDoubleClick={startEditing} title="Double-click to edit">
            {todo.text}
          </span>
        )}

        {todo.dueDate && (
          <span className={`due ${dueStatus}`} title={`Due ${todo.dueDate}`}>
            📅 {dueStatus === 'today' ? 'Today' : formatDate(todo.dueDate)}
            {dueStatus === 'overdue' && ' · overdue'}
          </span>
        )}

        <span className={`badge ${todo.priority}`}>{todo.priority}</span>

        <div className="actions">
          {!isEditing && (
            <button className="icon-btn small" onClick={startEditing} aria-label="Edit">
              ✏️
            </button>
          )}
          <button className="icon-btn small" onClick={() => onDelete(todo.id)} aria-label="Delete">
            🗑️
          </button>
        </div>
      </div>
    </li>
  )
}
