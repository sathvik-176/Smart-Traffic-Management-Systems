import { Link } from 'react-router-dom'
import { useAnalysis } from '../../AnalysisContext'
import type { Direction } from '../../api'

const DIRECTIONS: Direction[] = ['north', 'south', 'east', 'west']

const ARROWS: Record<Direction, string> = {
  north: '⬆️',
  south: '⬇️',
  east: '➡️',
  west: '⬅️',
}

const STATUS = {
  Low: { pill: 'normal', label: 'NORMAL', tone: 'low' },
  Medium: { pill: 'moderate', label: 'MODERATE', tone: 'medium' },
  High: { pill: 'congested', label: 'CONGESTED', tone: 'high' },
} as const

const CYCLE = 120

function Junctions() {
  const { result } = useAnalysis()

  if (!result) {
    return (
      <section className="junctions">
        <div className="dashboard-heading">
          <h2>Junction Monitoring</h2>
          <p>Status of each approach at the analyzed intersection</p>
        </div>
        <p>
          No analysis yet. <Link to="/dashboard">Go to the Dashboard</Link> and
          upload one image per direction to see results here.
        </p>
      </section>
    )
  }

  const rows = DIRECTIONS.map((d) => ({
    d,
    r: result.per_direction[d],
    green: result.recommended_green_time_seconds[d],
  }))
  const total = rows.reduce((s, x) => s + x.r.counts.vehicle, 0)
  const busiest = rows.reduce((a, b) => (b.r.counts.vehicle > a.r.counts.vehicle ? b : a))

  return (
    <section className="junctions">
      <div className="dashboard-heading">
        <h2>Junction Monitoring</h2>
        <p>Status of each approach at the analyzed intersection</p>
      </div>

      <div className="junction-summary">
        <div className="summary-chip">
          <span>Total vehicles</span>
          <strong>{total}</strong>
        </div>
        <div className="summary-chip">
          <span>Busiest approach</span>
          <strong style={{ textTransform: 'capitalize' }}>{busiest.d}</strong>
        </div>
        <div className="summary-chip">
          <span>Signal cycle</span>
          <strong>{CYCLE}s</strong>
        </div>
        {result.emergency_priority && (
          <div className="summary-chip">
            <span>🚨 Priority</span>
            <strong style={{ textTransform: 'capitalize' }}>{result.emergency_priority.direction}</strong>
          </div>
        )}
      </div>

      <div className="approach-grid">
        {rows.map(({ d, r, green }) => {
          const s = STATUS[r.congestion_level]
          return (
            <div className={`approach-card ${s.tone}`} key={d}>
              <div className="approach-head">
                <div className="approach-title">
                  <div className="dir-badge">{ARROWS[d]}</div>
                  <div>
                    <h3>{d}</h3>
                    <small>Approach</small>
                  </div>
                </div>
                <span className={`status ${s.pill}`}>{s.label}</span>
              </div>

              <div className="approach-count">
                <strong>{r.counts.vehicle}</strong>
                <span>vehicles detected</span>
              </div>

              <div className="meter">
                <div className="meter-label">
                  <span>Density</span>
                  <b>{r.density}</b>
                </div>
                <div className="meter-track">
                  <div
                    className={`meter-fill ${s.tone}`}
                    style={{ width: `${Math.min(r.density, 1) * 100}%` }}
                  />
                </div>
              </div>

              <div className="meter">
                <div className="meter-label">
                  <span>Recommended green time</span>
                  <b>
                    {green}s of {CYCLE}s
                  </b>
                </div>
                <div className="meter-track">
                  <div
                    className="meter-fill timer"
                    style={{ width: `${(green / CYCLE) * 100}%` }}
                  />
                </div>
              </div>

              {r.has_emergency && (
                <div className="emergency-chip">🚨 Emergency vehicle detected</div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}

export default Junctions