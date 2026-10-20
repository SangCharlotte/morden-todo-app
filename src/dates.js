// Small date helpers shared by several components.
// We store days as "YYYY-MM-DD" strings in your LOCAL time zone: they're easy
// to save in localStorage, and they sort and compare like dates with < and ===.

// Date -> "2026-10-20"
export function toDateKey(date) {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

// "2026-10-20" -> Date (midnight, local time)
export function fromDateKey(key) {
  const [year, month, day] = key.split('-').map(Number)
  return new Date(year, month - 1, day)
}

// The date key `days` days before today (0 = today, 1 = yesterday, ...)
export function daysAgoKey(days) {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return toDateKey(d)
}
