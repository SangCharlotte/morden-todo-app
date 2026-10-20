// LESSON 16 — Deriving a dashboard from a log
// App keeps a `completions` log in localStorage: one { taskId, date } entry
// per finished task. Everything on this screen — totals, streak, charts — is
// CALCULATED from that log during render. Nothing here is stored twice, so
// the numbers can never get out of sync with each other.

import BarChart from './BarChart'
import { fromDateKey, daysAgoKey } from '../dates'

// Monday-first. JavaScript's getDay() is Sunday-first (0 = Sunday), so
// (getDay() + 6) % 7 converts it: Monday -> 0 ... Sunday -> 6.
const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

function weekdayIndex(date) {
  return (date.getDay() + 6) % 7
}

// How many days in a row (ending today) had at least one completion?
// If nothing is done YET today, the streak is still alive from yesterday.
function currentStreak(countsByDay) {
  let daysAgo = countsByDay[daysAgoKey(0)] ? 0 : 1
  let streak = 0
  while (countsByDay[daysAgoKey(daysAgo)]) {
    streak++
    daysAgo++
  }
  return streak
}

export default function Insights({ completions }) {
  // Tally completions per day: { "2026-10-20": 3, ... }.
  // Tasks finished before tracking existed have date: null — they count
  // toward the total, but we don't know which day they belong to.
  const countsByDay = {}
  for (const c of completions) {
    if (c.date) countsByDay[c.date] = (countsByDay[c.date] || 0) + 1
  }

  // Chart 1: the last 7 days, oldest first, ending with today.
  const lastWeek = [6, 5, 4, 3, 2, 1, 0].map(daysAgo => {
    const key = daysAgoKey(daysAgo)
    const date = fromDateKey(key)
    return {
      label: daysAgo === 0 ? 'Today' : WEEKDAYS[weekdayIndex(date)].slice(0, 3),
      detail: date.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' }),
      value: countsByDay[key] || 0,
    }
  })

  // Chart 2: all-time totals for each day of the week.
  const weekdayTotals = [0, 0, 0, 0, 0, 0, 0]
  for (const [key, count] of Object.entries(countsByDay)) {
    weekdayTotals[weekdayIndex(fromDateKey(key))] += count
  }
  const byWeekday = WEEKDAYS.map((name, i) => ({
    label: name.slice(0, 3),
    detail: name,
    value: weekdayTotals[i],
  }))

  // ---------- Summary numbers ----------
  const total = completions.length
  const thisWeek = lastWeek.reduce((sum, d) => sum + d.value, 0)
  const streak = currentStreak(countsByDay)
  const doneToday = (countsByDay[daysAgoKey(0)] || 0) > 0

  const bestCount = Math.max(...weekdayTotals)
  const bestDay = bestCount > 0 ? WEEKDAYS[weekdayTotals.indexOf(bestCount)] : '—'

  return (
    <section className="insights" aria-label="Insights and analytics">
      <div className="stat-tiles">
        <div className="stat-tile">
          <span className="stat-label">Total completed</span>
          <span className="stat-value">{total.toLocaleString()}</span>
          <span className="stat-note">{thisWeek} in the last 7 days</span>
        </div>

        <div className="stat-tile">
          <span className="stat-label">Daily streak</span>
          <span className="stat-value">
            {streak} {streak === 1 ? 'day' : 'days'} {streak >= 3 && '🔥'}
          </span>
          <span className="stat-note">
            {streak === 0
              ? 'Finish a task to start one'
              : doneToday ? 'Today is counted' : 'Finish a task today to keep it'}
          </span>
        </div>

        <div className="stat-tile">
          <span className="stat-label">Most productive day</span>
          <span className="stat-value">{bestDay}</span>
          <span className="stat-note">
            {bestCount > 0 ? `${bestCount} ${bestCount === 1 ? 'task' : 'tasks'} all time` : 'Not enough data yet'}
          </span>
        </div>
      </div>

      {total === 0 && (
        <p className="insights-empty">Complete a task and your trends will start showing up here.</p>
      )}

      <BarChart
        title="Last 7 days"
        subtitle="Tasks completed each day"
        data={lastWeek}
      />

      <BarChart
        title="By day of the week"
        subtitle="All-time tasks completed on each weekday"
        data={byWeekday}
      />
    </section>
  )
}
