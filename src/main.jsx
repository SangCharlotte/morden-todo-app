// LESSON 1 — The entry point
// This is the first JavaScript file that runs. Its only job is to find the
// <div id="root"> in index.html and tell React to render <App /> inside it.

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './App.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  // StrictMode is a development helper: it warns you about common mistakes.
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
