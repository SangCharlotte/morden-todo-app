// Tests for the to-do list, written with Vitest + React Testing Library.
// Testing Library encourages finding elements the way a USER would: by their
// label, role or visible text, not by CSS classes or component internals.

import { render, screen, fireEvent, within } from '@testing-library/react'
import App from '../App'
import TodoList from './TodoList'
import * as effects from '../effects'

// Confetti draws on a <canvas> and the sounds use Web Audio — neither exists
// in jsdom. vi.mock swaps the whole module for fake functions we can inspect.
vi.mock('../effects', () => ({
  smallConfetti: vi.fn(),
  bigConfetti: vi.fn(),
  playDing: vi.fn(),
  playFanfare: vi.fn(),
  playChime: vi.fn(),
  unlockAudio: vi.fn(),
}))

// Small helpers so the tests read like the steps a user takes.
function addTask(text) {
  fireEvent.change(screen.getByLabelText('New to-do'), { target: { value: text } })
  fireEvent.click(screen.getByRole('button', { name: 'Add' }))
}

function taskItems() {
  return screen.queryAllByRole('listitem')
}

// The Pomodoro timer also lists every active task (in a <select>), so a task's
// text appears twice on the page. This looks only inside the to-do list.
function inList() {
  return within(screen.getByRole('list'))
}

describe('App: managing to-dos', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    // App shows starter to-dos on a first visit; saving an empty list
    // makes every test start with no tasks at all.
    localStorage.setItem('todos', '[]')

    // New to-dos get `id: Date.now()`. A test can add two in the same
    // millisecond, which would give them the same id, so count up instead.
    let now = 1_000
    vi.spyOn(Date, 'now').mockImplementation(() => now++)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders with an empty task list', () => {
    render(<App />)

    expect(screen.getByText('Nothing here yet. Add your first to-do!')).toBeInTheDocument()
    expect(taskItems()).toHaveLength(0)
    expect(screen.getByLabelText('New to-do')).toHaveValue('')
  })

  it('adds a task the user types', () => {
    render(<App />)

    addTask('Buy milk')

    expect(taskItems()).toHaveLength(1)
    expect(inList().getByText('Buy milk')).toBeInTheDocument()
    expect(screen.queryByText('Nothing here yet. Add your first to-do!')).not.toBeInTheDocument()
    // The form clears itself, ready for the next task.
    expect(screen.getByLabelText('New to-do')).toHaveValue('')
  })

  it('trims whitespace and refuses to add an empty task', () => {
    render(<App />)

    addTask('   ')
    expect(screen.getByText('Please type something first.')).toBeInTheDocument()
    expect(taskItems()).toHaveLength(0)

    addTask('  Walk the dog  ')
    expect(inList().getByText('Walk the dog')).toBeInTheDocument()
    expect(screen.queryByText('Please type something first.')).not.toBeInTheDocument()
  })

  it('shows the newest task first', () => {
    render(<App />)

    addTask('First')
    addTask('Second')

    const [top, bottom] = taskItems()
    expect(top).toHaveTextContent('Second')
    expect(bottom).toHaveTextContent('First')
  })

  it('marks a task as complete, and back again', () => {
    render(<App />)
    addTask('Buy milk')

    const checkbox = screen.getByLabelText('Mark "Buy milk" as done')
    expect(checkbox).not.toBeChecked()

    fireEvent.click(checkbox)

    expect(checkbox).toBeChecked()
    expect(taskItems()[0]).toHaveClass('done')
    // The label flips so screen readers know what clicking will do next.
    expect(checkbox).toHaveAccessibleName('Mark "Buy milk" as not done')
    // It was the only task, so finishing it earns the big celebration.
    expect(effects.bigConfetti).toHaveBeenCalledTimes(1)

    fireEvent.click(checkbox)

    expect(checkbox).not.toBeChecked()
    expect(taskItems()[0]).not.toHaveClass('done')
  })

  it('deletes a task', () => {
    render(<App />)
    addTask('Buy milk')
    addTask('Call mum')

    const milkRow = inList().getByText('Buy milk').closest('li')
    fireEvent.click(within(milkRow).getByRole('button', { name: 'Delete' }))

    expect(screen.queryByText('Buy milk')).not.toBeInTheDocument()
    expect(inList().getByText('Call mum')).toBeInTheDocument()
    expect(taskItems()).toHaveLength(1)
  })

  it('returns to the empty state after deleting the last task', () => {
    render(<App />)
    addTask('Buy milk')

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }))

    expect(taskItems()).toHaveLength(0)
    expect(screen.getByText('Nothing here yet. Add your first to-do!')).toBeInTheDocument()
  })

  it('saves tasks to localStorage', () => {
    render(<App />)
    addTask('Buy milk')

    const saved = JSON.parse(localStorage.getItem('todos'))
    expect(saved).toHaveLength(1)
    expect(saved[0]).toMatchObject({ text: 'Buy milk', done: false, priority: 'medium' })
  })
})

describe('TodoList (on its own)', () => {
  const todos = [
    { id: 1, text: 'Write tests', done: false, priority: 'high' },
    { id: 2, text: 'Run tests', done: true, priority: 'low' },
  ]

  // Fresh fake callbacks for each test, so we can check how they were called.
  function renderList(props = {}) {
    const handlers = {
      onToggle: vi.fn(),
      onEdit: vi.fn(),
      onDelete: vi.fn(),
      onMove: vi.fn(),
    }
    render(<TodoList todos={todos} filter="all" {...handlers} {...props} />)
    return handlers
  }

  it('shows the empty-state message that matches the filter', () => {
    renderList({ todos: [], filter: 'done' })

    expect(screen.getByText('No completed tasks yet. You got this!')).toBeInTheDocument()
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
  })

  it('renders one item per to-do, with its done state', () => {
    renderList()

    expect(taskItems()).toHaveLength(2)
    expect(screen.getByLabelText('Mark "Write tests" as done')).not.toBeChecked()
    expect(screen.getByLabelText('Mark "Run tests" as not done')).toBeChecked()
  })

  it('calls onToggle with the task id when a checkbox is clicked', () => {
    const { onToggle } = renderList()

    fireEvent.click(screen.getByLabelText('Mark "Write tests" as done'))

    expect(onToggle).toHaveBeenCalledTimes(1)
    expect(onToggle).toHaveBeenCalledWith(1, expect.objectContaining({ x: expect.any(Number) }))
  })

  it('calls onDelete with the task id when Delete is clicked', () => {
    const { onDelete } = renderList()

    const row = screen.getByText('Run tests').closest('li')
    fireEvent.click(within(row).getByRole('button', { name: 'Delete' }))

    expect(onDelete).toHaveBeenCalledWith(2)
  })
})
