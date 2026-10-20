// LESSON 14 — Using an npm package + plain browser APIs
// Not everything has to be a React component. This file is ordinary
// JavaScript: React components import these functions and call them from
// event handlers.
//
// - Confetti comes from the "canvas-confetti" npm package
//   (installed with: npm install canvas-confetti).
// - Sounds are generated with the browser's built-in Web Audio API,
//   so there are no audio files to download.

import confetti from 'canvas-confetti'

// ---------- Confetti ----------

// Bright party colors (canvas-confetti takes any hex colors you like).
const COLORS = ['#ff4d6d', '#ffb703', '#06d6a0', '#4cc9f0', '#7b61ff', '#f72585']

// A burst from a point on the screen. x and y go from 0 to 1
// (0,0 = top-left corner, 1,1 = bottom-right corner).
export function smallConfetti(x, y) {
  confetti({
    particleCount: 90,
    spread: 80,
    startVelocity: 32,
    scalar: 0.9,
    colors: COLORS,
    origin: { x, y },
    disableForReducedMotion: true, // respects the "reduce motion" OS setting
  })
}

// A big celebration from both sides of the screen — used when every task is done.
export function bigConfetti() {
  const options = { particleCount: 140, spread: 80, startVelocity: 55, colors: COLORS, disableForReducedMotion: true }
  confetti({ ...options, angle: 60, origin: { x: 0, y: 0.8 } })
  confetti({ ...options, angle: 120, origin: { x: 1, y: 0.8 } })
}

// ---------- Sound ----------

// One shared AudioContext, created the first time we need it.
// (Browsers only allow audio after the user has clicked something.)
let audioContext = null

// Create (or wake up) the AudioContext. Call this from a click handler for
// sounds that play LATER, like the Pomodoro chime — a context first made
// outside a click can start "suspended" and stay silent.
export function unlockAudio() {
  if (!audioContext) audioContext = new AudioContext()
  if (audioContext.state === 'suspended') audioContext.resume()
}

function playNote(frequency, startDelay, duration, volume = 0.2) {
  unlockAudio()
  const start = audioContext.currentTime + startDelay

  // An oscillator makes the tone; a gain node controls its volume.
  const oscillator = audioContext.createOscillator()
  const gain = audioContext.createGain()
  oscillator.type = 'sine'
  oscillator.frequency.value = frequency

  // Quick fade in, then fade out — this avoids clicking noises.
  gain.gain.setValueAtTime(0, start)
  gain.gain.linearRampToValueAtTime(volume, start + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.001, start + duration)

  oscillator.connect(gain)
  gain.connect(audioContext.destination)
  oscillator.start(start)
  oscillator.stop(start + duration)
}

// A short two-note "ding" for completing one task.
export function playDing() {
  playNote(880, 0, 0.25)    // A5
  playNote(1320, 0.08, 0.35) // E6
}

// A rising four-note fanfare for completing ALL tasks.
export function playFanfare() {
  ;[523, 659, 784, 1047].forEach((freq, i) => playNote(freq, i * 0.12, 0.4)) // C E G C
}

// A soft, slow three-note chime for when the Pomodoro timer reaches 0:00.
// Quieter and longer than the ding, so it's noticeable without being jarring.
export function playChime() {
  ;[784, 988, 1175].forEach((freq, i) => playNote(freq, i * 0.28, 1.2, 0.12)) // G B D
}
