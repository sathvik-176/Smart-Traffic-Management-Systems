import StatCard from '../StatCard/StatCard'
import { useAnalysis } from '../../AnalysisContext'
import type { Direction } from '../../api'

const DIRECTIONS: Direction[] = ['north', 'south', 'east', 'west']
const LEVEL_ORDER = ['Low', 'Medium', 'High']

function VerticalBars({
  title,
  unit,
  variant,
  items,
}: {
  title: string
  unit: string
  variant: 'blue' | 'green'
  items: { label: string; value: number }[]
}) {
  const max = Math.max(...items.map((i) => i.value), 1)
  return (
    <div className="vbar-card">
      <h4>{title}</h4>
      <div className="vbar-chart">
        {items.map((i) => (
          <div className="vbar-col" key={i.label}>
            <span className="vbar-value">
              {i.value}
              {unit}
            </span>
            <div className="vbar-track">
              <div
                className={`vbar-fill ${variant}`}
                style={{ height: `${(i.value / max) * 100}%` }}
              />
            </div>
            <span className="vbar-label">{i.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function Dashboard() {
  const { files, setFile, result, loading, error, analyze } = useAnalysis()
  const ready = DIRECTIONS.every((d) => files[d])

  const dirs = result ? DIRECTIONS.map((d) => result.per_direction[d]) : []
  const totalVehicles = dirs.reduce((sum, r) => sum + r.counts.vehicle, 0)
  const worstLevel = dirs.reduce<string>(
    (w, r) =>
      LEVEL_ORDER.indexOf(r.congestion_level) > LEVEL_ORDER.indexOf(w)
        ? r.congestion_level
        : w,
    'Low'
  )

  return (
    <section className="dashboard">
      <div className="dashboard-heading">
        <h2>Traffic Overview</h2>
        <p>Upload one image per direction to analyze the intersection</p>
      </div>

      <div className="upload-panel">
        {DIRECTIONS.map((d) => (
          <label key={d} className="upload-slot">
            <span className="slot-icon">{files[d] ? '✅' : '📤'}</span>
            <span className="slot-title">{d}</span>
            <input
              type="file"
              accept=".jpg,.jpeg,.png"
              hidden
              onChange={(e) => setFile(d, e.target.files?.[0])}
            />
            <span className="slot-file">
              {files[d] ? files[d]!.name : 'Click to choose an image'}
            </span>
          </label>
        ))}
        <button onClick={analyze} disabled={!ready || loading}>
          {loading ? 'Analyzing...' : 'Analyze Traffic'}
        </button>
      </div>

      {error && <p className="error-message">⚠️ {error}</p>}

      {result?.emergency_priority && (
        <div className="emergency-banner">
          🚨 {result.emergency_priority.reason}
        </div>
      )}

      <div className="stats-grid">
        <StatCard icon="🚗" title="Vehicles Detected" value={result ? String(totalVehicles) : '—'} />
        <StatCard icon="🚦" title="Directions Analyzed" value={result ? '4' : '—'} />
        <StatCard icon="🔴" title="Congestion Level" value={result ? worstLevel : '—'} />
        <StatCard icon="⚠️" title="Emergency Alerts" value={result ? (result.emergency_priority ? '1' : '0') : '—'} />
      </div>

      {result && (
        <div className="results-grid">
          <table className="results-table">
            <thead>
              <tr>
                <th>Direction</th>
                <th>Vehicles</th>
                <th>Congestion</th>
                <th>Emergency</th>
                <th>Green Time</th>
              </tr>
            </thead>
            <tbody>
              {DIRECTIONS.map((d) => {
                const r = result.per_direction[d]
                return (
                  <tr key={d}>
                    <td style={{ textTransform: 'capitalize' }}>{d}</td>
                    <td>{r.counts.vehicle}</td>
                    <td>{r.congestion_level}</td>
                    <td>{r.has_emergency ? '🚨 Yes' : 'No'}</td>
                    <td>{result.recommended_green_time_seconds[d]}s</td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          <div className="charts-side">
            <VerticalBars
              title="Vehicles per direction"
              unit=""
              variant="blue"
              items={DIRECTIONS.map((d) => ({
                label: d,
                value: result.per_direction[d].counts.vehicle,
              }))}
            />
            <VerticalBars
              title="Green time (seconds)"
              unit="s"
              variant="green"
              items={DIRECTIONS.map((d) => ({
                label: d,
                value: result.recommended_green_time_seconds[d],
              }))}
            />
          </div>
        </div>
      )}
    </section>
  )
}

export default Dashboard
