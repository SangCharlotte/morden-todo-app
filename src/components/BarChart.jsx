// LESSON 17 — Drawing a chart with plain HTML + CSS
// You don't always need a chart library. Each bar is a <div> whose height
// is a percentage of the tallest axis value. The axis "ticks" are clean
// whole numbers we calculate from the data.
//
// `data` is an array of { label, value, detail }:
//   label  -> shown under the bar ("Mon")
//   detail -> longer name for the tooltip and table ("Monday, Oct 20")

import { useState } from 'react'

// Pick ~4 whole-number gridlines that fit the data: max 5 -> 0, 2, 4, 6.
function niceTicks(max) {
  const step = Math.max(1, Math.ceil(max / 4))
  const top = Math.max(step, Math.ceil(max / step) * step)
  const ticks = []
  for (let t = 0; t <= top; t += step) ticks.push(t)
  return { ticks, top }
}

function plural(n) {
  return `${n} ${n === 1 ? 'task' : 'tasks'}`
}

export default function BarChart({ title, subtitle, data }) {
  const [activeIndex, setActiveIndex] = useState(null)
  const [showTable, setShowTable] = useState(false)

  const values = data.map(d => d.value)
  const max = Math.max(...values)
  const { ticks, top } = niceTicks(max)
  // Label only the tallest bar; hover (or the table) shows the rest.
  const peakIndex = max > 0 ? values.indexOf(max) : -1

  return (
    <figure className="chart">
      <figcaption className="chart-head">
        <div>
          <h3>{title}</h3>
          {subtitle && <p>{subtitle}</p>}
        </div>
        <button className="link-btn small" onClick={() => setShowTable(!showTable)}>
          {showTable ? 'Show chart' : 'Show table'}
        </button>
      </figcaption>

      {showTable ? (
        <table className="chart-table">
          <tbody>
            {data.map(d => (
              <tr key={d.detail}>
                <th scope="row">{d.detail}</th>
                <td>{plural(d.value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="chart-body">
          <div className="chart-y" aria-hidden="true">
            {ticks.map(t => (
              <span key={t} style={{ bottom: `${(t / top) * 100}%` }}>{t}</span>
            ))}
          </div>

          <div className="chart-plot">
            {ticks.map(t => (
              <div key={t} className="chart-grid" style={{ bottom: `${(t / top) * 100}%` }} />
            ))}

            {data.map((d, i) => {
              const height = `${(d.value / top) * 100}%`
              const isActive = activeIndex === i
              return (
                // The whole column is the hover target, not just the thin bar.
                <div
                  key={d.detail}
                  className={`chart-col ${isActive ? 'active' : ''}`}
                  tabIndex={0}
                  aria-label={`${d.detail}: ${plural(d.value)}`}
                  onMouseEnter={() => setActiveIndex(i)}
                  onMouseLeave={() => setActiveIndex(null)}
                  onFocus={() => setActiveIndex(i)}
                  onBlur={() => setActiveIndex(null)}
                >
                  <div className="chart-bar" style={{ height }} />
                  {i === peakIndex && !isActive && (
                    <span className="chart-cap" style={{ bottom: height }}>{d.value}</span>
                  )}
                  {isActive && (
                    <div
                      className={`chart-tip ${i === 0 ? 'start' : i === data.length - 1 ? 'end' : ''}`}
                      style={{ bottom: height }}
                      role="tooltip"
                    >
                      <span>{d.detail}</span>
                      <strong>{plural(d.value)}</strong>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <div className="chart-x" aria-hidden="true">
            {data.map(d => <span key={d.detail}>{d.label}</span>)}
          </div>
        </div>
      )}
    </figure>
  )
}
