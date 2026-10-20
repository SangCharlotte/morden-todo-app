// LESSON 15 — Timers, refs and cleanup
// setInterval keeps running until you stop it, so the useEffect below
// RETURNS a cleanup function that clears it. React calls that cleanup
// whenever the timer pauses or the component goes away.
//
// We don't just subtract 1 every second: browsers slow down intervals in
// background tabs. Instead we remember WHEN the timer should end (in a ref,
// because changing it shouldn't re-render) and work out the time left from
// the clock on every tick.

import { useState, useRef, useEffect } from 'react'
import { playChime, unlockAudio } from '../effects'

const MODES = {
  focus: { label: 'Focus', minutes: 25 },
  short: { label: 'Short break', minutes: 5 },
  long: { label: 'Long break', minutes: 15 },
}

// The progress ring is an SVG circle; its outline length is the circumference.
const RADIUS = 52
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

// 1500 -> "25:00"
function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = String(totalSeconds % 60).padStart(2, '0')
  return `${minutes}:${seconds}`
}

// `tasks` are the unfinished to-dos the user can link to this session.
export default function PomodoroTimer({ tasks, soundOn }) {
  const [mode, setMode] = useState('focus')
  const [secondsLeft, setSecondsLeft] = useState(MODES.focus.minutes * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [linkedTaskId, setLinkedTaskId] = useState('')
  const endTimeRef = useRef(0)

  const totalSeconds = MODES[mode].minutes * 60
  const isFinished = secondsLeft === 0

  // Derived, not stored: if the linked task gets completed or deleted,
  // it simply disappears from `tasks` and we fall back to "no task".
  const linkedTask = tasks.find(t => String(t.id) === linkedTaskId)

  function secondsUntilEnd() {
    return Math.max(0, Math.ceil((endTimeRef.current - Date.now()) / 1000))
  }

  useEffect(() => {
    if (!isRunning) return

    const intervalId = setInterval(() => {
      const left = secondsUntilEnd()
      setSecondsLeft(left)
      if (left === 0) {
        setIsRunning(false)
        if (soundOn) playChime()
      }
    }, 250) // tick often so the display never lags behind the real clock

    return () => clearInterval(intervalId)
  }, [isRunning, soundOn])

  // Show the countdown in the browser tab, so you can see it from other tabs.
  useEffect(() => {
    const originalTitle = document.title
    if (isRunning) document.title = `${formatTime(secondsLeft)} · ${MODES[mode].label}`
    return () => { document.title = originalTitle }
  }, [isRunning, secondsLeft, mode])

  function start() {
    // Pressing play after the timer finished starts a fresh round.
    const seconds = isFinished ? totalSeconds : secondsLeft
    setSecondsLeft(seconds)
    endTimeRef.current = Date.now() + seconds * 1000
    setIsRunning(true)
    if (soundOn) unlockAudio() // so the chime can play when time runs out
  }

  function pause() {
    setSecondsLeft(secondsUntilEnd())
    setIsRunning(false)
  }

  function reset() {
    setIsRunning(false)
    setSecondsLeft(totalSeconds)
  }

  function switchMode(newMode) {
    setMode(newMode)
    setIsRunning(false)
    setSecondsLeft(MODES[newMode].minutes * 60)
  }

  const progress = secondsLeft / totalSeconds // 1 = full, 0 = empty

  let status = MODES[mode].label
  if (isFinished) status = mode === 'focus' ? 'Time for a break!' : 'Break over!'
  else if (!isRunning && secondsLeft < totalSeconds) status = 'Paused'

  return (
    <section className={`pomodoro ${mode === 'focus' ? 'focus' : 'break'}`} aria-label="Pomodoro timer">
      <div className="pomo-ring" role="timer" aria-label={`${formatTime(secondsLeft)} left`}>
        <svg viewBox="0 0 120 120" aria-hidden="true">
          <circle className="pomo-track" cx="60" cy="60" r={RADIUS} />
          <circle
            className="pomo-progress"
            cx="60"
            cy="60"
            r={RADIUS}
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={CIRCUMFERENCE * (1 - progress)}
          />
        </svg>
        <div className="pomo-readout">
          <span className={`pomo-time ${isFinished ? 'finished' : ''}`}>{formatTime(secondsLeft)}</span>
          <span className="pomo-status" aria-live="polite">{status}</span>
        </div>
      </div>

      <div className="pomo-side">
        <div className="pomo-modes" role="group" aria-label="Timer length">
          {Object.entries(MODES).map(([key, { label, minutes }]) => (
            <button
              key={key}
              className={`pomo-mode ${mode === key ? 'active' : ''}`}
              onClick={() => switchMode(key)}
              aria-pressed={mode === key}
              title={`${minutes} minutes`}
            >
              {label}
            </button>
          ))}
        </div>

        <select
          className="pomo-task"
          value={linkedTask ? linkedTaskId : ''}
          onChange={e => setLinkedTaskId(e.target.value)}
          aria-label="Task to focus on"
        >
          <option value="">No task linked</option>
          {tasks.map(t => (
            <option key={t.id} value={String(t.id)}>{t.text}</option>
          ))}
        </select>

        {linkedTask && (
          <p className="pomo-focus-on">
            Focusing on <strong>{linkedTask.text}</strong>
          </p>
        )}

        <div className="pomo-controls">
          {isRunning ? (
            <button className="primary-btn pomo-play" onClick={pause}>
              <svg viewBox="0 0 16 16" aria-hidden="true"><rect x="3" y="2" width="3.5" height="12" rx="1" /><rect x="9.5" y="2" width="3.5" height="12" rx="1" /></svg>
              Pause
            </button>
          ) : (
            <button className="primary-btn pomo-play" onClick={start}>
              <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 2.5v11a1 1 0 0 0 1.5.86l9-5.5a1 1 0 0 0 0-1.72l-9-5.5A1 1 0 0 0 4 2.5z" /></svg>
              {secondsLeft < totalSeconds && !isFinished ? 'Resume' : 'Start'}
            </button>
          )}
          <button
            className="pomo-reset"
            onClick={reset}
            disabled={!isRunning && secondsLeft === totalSeconds}
          >
            <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 3a5 5 0 1 1-4.9 6h1.6A3.5 3.5 0 1 0 8 4.5V7L4.5 3.75 8 .5V3z" /></svg>
            Reset
          </button>
        </div>
      </div>
    </section>
  )
}
