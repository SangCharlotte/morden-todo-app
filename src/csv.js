// LESSON 19 — Making a file in the browser
// No server needed: we build the file's text ourselves, wrap it in a Blob
// (a chunk of data with a type), give it a temporary URL, and "click" an
// invisible download link pointing at that URL.

import { toDateKey } from './dates'

// One spreadsheet cell. Cells containing commas, quotes or line breaks must
// be wrapped in quotes, and quotes inside are doubled: He said "hi" -> "He said ""hi""".
// Spreadsheets treat text starting with = + - @ as a FORMULA, so we put a '
// in front — otherwise a task named "=HYPERLINK(...)" could run when opened.
function csvCell(value) {
  let text = String(value ?? '')
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

export function todosToCsv(todos) {
  const header = ['Task', 'Status', 'Priority', 'Due date']
  const rows = todos.map(t => [t.text, t.done ? 'Done' : 'To do', t.priority, t.dueDate || ''])
  // Spreadsheet apps expect Windows-style line endings (\r\n).
  return [header, ...rows].map(row => row.map(csvCell).join(',')).join('\r\n')
}

export function downloadTodosCsv(todos) {
  // The "﻿" at the start (a "byte order mark") tells Excel the file is
  // UTF-8, so emoji and accented letters show up correctly.
  const blob = new Blob(['﻿' + todosToCsv(todos)], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = `todos-${toDateKey(new Date())}.csv`
  link.click()

  // Free the memory once the browser has had a moment to start the download.
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
