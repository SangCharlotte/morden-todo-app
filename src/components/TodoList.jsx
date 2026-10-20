// LESSON 11 — Lists & keys
// To render a list, .map() each item to a component. Every item needs a
// unique `key` prop so React can tell items apart when the list changes.
// Use a stable id — not the array index — as the key.
//
// LESSON 18 — Drag and drop
// The browser's built-in Drag and Drop API fires events on the element being
// dragged (dragstart, dragend) and on the elements it passes over (dragover,
// drop). The list remembers WHICH task is being dragged and WHERE it would
// land, so every row can draw itself accordingly. The real reordering happens
// in App (onMove), because App owns the todos.

import { useState } from 'react'
import TodoItem from './TodoItem'
import EmptyState from './EmptyState'

// `...handlers` is "rest" syntax: it collects every other prop (onToggle,
// onEdit, onDelete) into one object, and {...handlers}
// below passes them all on to each TodoItem without listing each one.
export default function TodoList({ todos, filter, onMove, ...handlers }) {
  const [draggingId, setDraggingId] = useState(null)
  // Where the dragged task would be dropped: { id, position: 'before' | 'after' }
  const [dropTarget, setDropTarget] = useState(null)

  // Early return: if there's nothing to show, render something else instead.
  if (todos.length === 0) {
    return <EmptyState filter={filter} />
  }

  function handleDragOver(e, id) {
    if (draggingId === null) return // something else is being dragged (e.g. a file)
    e.preventDefault() // saying "yes, you may drop here"
    if (id === draggingId) return setDropTarget(null)

    // Top half of the row = drop before it, bottom half = drop after it.
    const rect = e.currentTarget.getBoundingClientRect()
    const position = e.clientY < rect.top + rect.height / 2 ? 'before' : 'after'
    if (dropTarget?.id !== id || dropTarget.position !== position) setDropTarget({ id, position })
  }

  function handleDrop(e) {
    e.preventDefault()
    if (dropTarget) onMove(draggingId, dropTarget.id, dropTarget.position)
    endDrag()
  }

  function endDrag() {
    setDraggingId(null)
    setDropTarget(null)
  }

  // Keyboard alternative: ArrowUp/ArrowDown on the drag handle moves the task
  // one place among the VISIBLE tasks (so it works with filters and search too).
  function moveBy(id, step) {
    const index = todos.findIndex(t => t.id === id)
    const neighbor = todos[index + step]
    if (neighbor) onMove(id, neighbor.id, step < 0 ? 'before' : 'after')
  }

  return (
    <ul
      className="todo-list"
      // Leaving the list entirely hides the drop line.
      onDragLeave={e => !e.currentTarget.contains(e.relatedTarget) && setDropTarget(null)}
    >
      {todos.map(todo => (
        <TodoItem
          key={todo.id}
          todo={todo}
          {...handlers}
          isDragging={draggingId === todo.id}
          dropPosition={dropTarget?.id === todo.id ? dropTarget.position : null}
          onDragStart={() => setDraggingId(todo.id)}
          onDragEnd={endDrag}
          onDragOver={e => handleDragOver(e, todo.id)}
          onDrop={handleDrop}
          onMoveBy={step => moveBy(todo.id, step)}
        />
      ))}
    </ul>
  )
}
