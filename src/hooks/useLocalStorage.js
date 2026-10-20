// LESSON 8 — Custom hooks
// A custom hook is just a function whose name starts with "use" and that
// calls other hooks. It lets you reuse stateful logic between components.
//
// This one works exactly like useState, but it also saves the value in the
// browser's localStorage, so your to-dos survive a page refresh.

import { useState, useEffect } from 'react'

export function useLocalStorage(key, initialValue) {
  // Passing a FUNCTION to useState means it only runs once, on the first render.
  const [value, setValue] = useState(() => {
    try {
      const saved = localStorage.getItem(key)
      return saved !== null ? JSON.parse(saved) : initialValue
    } catch {
      return initialValue
    }
  })

  // LESSON 7 — useEffect
  // useEffect runs code AFTER React renders. The array at the end is the
  // "dependency list": this effect re-runs only when `key` or `value` change.
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Storage can be unavailable (e.g. private mode) — the app still works.
    }
  }, [key, value])

  // Return the same shape as useState: [value, setter]
  return [value, setValue]
}
