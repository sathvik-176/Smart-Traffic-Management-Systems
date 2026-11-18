import { Link } from 'react-router-dom'
import { useAnalysis } from '../../AnalysisContext'
import type { Direction } from '../../api'

const DIRECTIONS: Direction[] = ['north', 'south', 'east', 'west']

function Analytics() {
  const { result } = useAnalysis()

  if (!result) {
    return (
      <section className="analytics-page">
        <div className="page-heading">
          <h2>Traffic Analytics</h2>
          <p>Breakdown of the latest intersection analysis</p>
        </div>
        <p>
          No analysis yet. <Link to="/dashboard">Go to the Dashboard</Link> and
          upload one image per direction to see analytics here.
        </p>
      </section>
    )
  }

  const rows = DIRECTIONS.map((d) => ({
    d,
    vehicles: result.per_direction[d].counts.vehicle,
    level: result.per_direction[d].congestion_level,
    green: result.recommended_green_time_seconds[d],
  }))

  const total = rows.reduce((sum, r) => sum + r.vehicles, 0)
  const busiest = rows.reduce((a, b) => (b.vehicles > a.vehicles ? b : a))
  const longestGreen = rows.reduce((a, b) => (b.green > a.green ? b : a))
  const highCount = rows.filter((r) => r.level === 'High').length
  const maxVehicles = Math.max(...rows.map((r) => r.vehicles), 1)
  const maxGreen = Math.max(...rows.map((r) => r.green), 1)

  return (
    <section className="analytics-page">
      <div className="page-heading">
        <h2>Traffic Analytics</h2>
        <p>Breakdown of the latest intersection analysis</p>
      </div>

      <div className="analytics-stats">
        <div className="analytics-card">
          <span>Total Vehicles</span>
          <strong>{total}</strong>
          <small>Across all four approaches</small>
        </div>

        <div className="analytics-card">
          <span>Busiest Approach</span>
          <strong style={{ textTransform: 'capitalize' }}>{busiest.d}</strong>
          <small>{busiest.vehicles} vehicles detected</small>
        </div>

        <div className="analytics-card">
          <span>Longest Green</span>
          <strong style={{ textTransform: 'capitalize' }}>{longestGreen.d}</strong>
          <small>{longestGreen.green}s of the 120s cycle</small>
        </div>

        <div className="analytics-card">
          <span>High-Congestion Approaches</span>
          <strong>{highCount} / 4</strong>
          <small>Rated High by density</small>
        </div>
      </div>

      <div className="chart-section">
        <h3>Traffic Volume</h3>
        <p>Vehicles detected per direction</p>
        <div className="bar-chart">
          {rows.map((r) => (
            <div className="bar-row" key={r.d}>
              <span className="bar-label">{r.d}</span>
              <div className="bar-track">
                <div
                  className="bar-fill"
                  style={{ width: `${(r.vehicles / maxVehicles) * 100}%` }}
                />
              </div>
              <span className="bar-value">{r.vehicles}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="chart-section">
        <h3>Signal Time Allocation</h3>
        <p>Recommended green time per direction (seconds)</p>
        <div className="bar-chart">
          {rows.map((r) => (
            <div className="bar-row" key={r.d}>
              <span className="bar-label">{r.d}</span>
              <div className="bar-track">
                <div
                  className="bar-fill green"
                  style={{ width: `${(r.green / maxGreen) * 100}%` }}
                />
              </div>
              <span className="bar-value">{r.green}s</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Analytics