# React To-Do — a learn-by-reading project

## Run it

```bash
npm install     # first time only
npm run dev     # then open the http://localhost:5173 link it prints
```

Save any file and the browser updates instantly.

## How the app is built

```
App  (owns all the state: todos, completions, filter, search, theme)
├── PomodoroTimer – focus/break countdown, optional linked task
├── Header       – title, date, dark-mode button
├── TodoForm     – input + priority + Add button
├── FilterBar    – All / Active / Done chips + search box
├── TodoList     – loops over the todos
│   ├── TodoItem – checkbox, text, edit, delete (one per todo)
│   └── EmptyState – shown when the list is empty
├── Stats        – progress bar, "tasks left", Export CSV, Clear completed
└── Insights     – stat cards + BarChart (shown on the Insights tab)
```

Data flows **down** as props. Changes flow **up** when a child calls a function
it was given (`onAdd`, `onToggle`, `onDelete`…). That's the most important idea
in React.

## Read the files in this order

Each file has `LESSON` comments explaining the concept it shows.

| # | File | What you learn |
|---|------|----------------|
| 1 | `src/main.jsx` | How React starts |
| 2–4 | `src/App.jsx` | Components, state, JSX, lifting state up |
| 5 | `src/components/Header.jsx` | Props, click events |
| 6 | `src/components/TodoForm.jsx` | Forms, controlled inputs, `useRef` |
| 7–8 | `src/hooks/useLocalStorage.js` | `useEffect`, custom hooks |
| 9 | `src/App.jsx` (`visibleTodos`) | Derived data, `useMemo` |
| 10 | `src/components/FilterBar.jsx` | Rendering buttons from an array |
| 11 | `src/components/TodoList.jsx` | Lists and `key` |
| 12 | `src/components/TodoItem.jsx` | Local UI state, keyboard events, ternaries |
| 13 | `src/components/Stats.jsx` | Computed values, inline styles |
| 14 | `src/effects.js` | Using an npm package (confetti), Web Audio sounds |
| 15 | `src/components/PomodoroTimer.jsx` | Timers, `useRef`, effect cleanup |
| 16 | `src/components/Insights.jsx` | Deriving a dashboard from a saved log |
| 17 | `src/components/BarChart.jsx` | Drawing a chart with plain HTML + CSS |
| 18 | `src/components/TodoList.jsx` + `moveTodo` in `App.jsx` | Drag and drop, keyboard alternatives |
| 19 | `src/csv.js` | Building a file in the browser (Blob + download link) |

## Practice ideas (try these yourself)

1. Sort the list so **high priority** (or soonest due) tasks show first.
2. Add a **"Mark all done"** button to `Stats`.
3. Show a count next to each filter chip, e.g. `Active (3)`.
4. Let the user **change the due date** while editing a to-do.
5. Move the todo logic into a custom hook `useTodos()`.
