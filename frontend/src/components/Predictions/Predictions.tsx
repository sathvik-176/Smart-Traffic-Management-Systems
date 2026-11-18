import { useEffect, useState } from 'react'
import { fetchHistory } from '../../api'
import type { Direction, HistoryRun } from '../../api'

type Level = 'Low' | 'Medium' | 'High'
interface Forecast { d: Direction; series: number[]; last: number; forecast: number; level: Level; trend: string }

const DIRECTIONS: Direction[] = ['north', 'south', 'east', 'west']
const LEVEL_ORDER = ['Low', 'Medium', 'High']
const MIN_RUNS = 3
const ALPHA = 0.5
const PILL: Record<Level, { cls: string; label: string }> = {
  Low: { cls: 'normal', label: 'LOW' },
  Medium: { cls: 'moderate', label: 'MEDIUM' },
  High: { cls: 'congested', label: 'HIGH' },
}

const levelOf = (d: number): Level => (d < 0.3 ? 'Low' : d < 0.6 ? 'Medium' : 'High')

function smooth(values: number[]): number {
  let s = values[0]
  for (let i = 1; i < values.length; i++) s = ALPHA * values[i] + (1 - ALPHA) * s
  return s
}

function slope(values: number[]): number {
  const v = values.slice(-6)
  const n = v.length
  const xm = (n - 1) / 2
  const ym = v.reduce((a, b) => a + b, 0) / n
  let num = 0
  let den = 0
  v.forEach((y, i) => { num += (i - xm) * (y - ym); den += (i - xm) ** 2 })
  return den === 0 ? 0 : num / den
}

function Sparkline({ values }: { values: number[] }) {
  const w = 160, h = 44, pad = 4
  const v = values.slice(-10)
  const max = Math.max(1, ...v)
  const pts = v.map((y, i) => {
    const x = pad + (i * (w - 2 * pad)) / Math.max(v.length - 1, 1)
    return `${x},${h - pad - (y / max) * (h - 2 * pad)}`
  })
  return (
    <svg className="spark" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <polyline points={pts.join(' ')} fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}

function worst(r: HistoryRun): Level {
  return DIRECTIONS.reduce<Level>((w, d) => {
    const lv = r.directions[d]?.congestion_level
    return lv && LEVEL_ORDER.indexOf(lv) > LEVEL_ORDER.indexOf(w) ? lv : w
  }, 'Low')
}

function Predictions() {
  const [runs, setRuns] = useState<HistoryRun[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      setRuns(await fetchHistory(50))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { void load() }, [])

  const chrono = [...runs].reverse()
  const forecasts: Forecast[] = []
  DIRECTIONS.forEach((d) => {
    const series = chrono
      .map((r) => r.directions[d]?.density)
      .filter((x): x is number => typeof x === 'number')
    if (series.length < MIN_RUNS) return
    const forecast = Math.max(0, smooth(series))
    const sl = slope(series)
    forecasts.push({
      d, series, last: series[series.length - 1], forecast,
      level: levelOf(forecast),
      trend: sl > 0.03 ? 'Rising' : sl < -0.03 ? 'Easing' : 'Steady',
    })
  })

  return (
    <section className="page-section predictions">
      <h2>Traffic Predictions</h2>
      <p>Baseline congestion forecast calculated from the analyses stored in the database.</p>

      <div className="history-actions">
        <button onClick={load} disabled={loading}>{loading ? 'Loading...' : '↻ Refresh'}</button>
      </div>
      {error && <p className="error-message">⚠️ {error}</p>}

      {!loading && !error && forecasts.length === 0 && (
        <p>At least {MIN_RUNS} stored analyses are needed for a forecast. Run more analyses from the Dashboard.</p>
      )}

      {forecasts.length > 0 && (
        <div className="forecast-grid">
          {forecasts.map((f) => (
            <div className="forecast-card" key={f.d}>
              <div className="forecast-head">
                <h3 style={{ textTransform: 'capitalize' }}>{f.d}</h3>
                <span className={`status ${PILL[f.level].cls}`}>{PILL[f.level].label}</span>
              </div>
              <div className="forecast-value">
                <strong>{f.forecast.toFixed(2)}</strong>
                <span>forecast density, next analysis</span>
              </div>
              <Sparkline values={f.series} />
              <div className="forecast-meta">
                <span>Last: {f.last.toFixed(2)}</span>
                <span>{f.trend === 'Rising' ? '↗' : f.trend === 'Easing' ? '↘' : '→'} {f.trend}</span>
                <span>{f.series.length} analyses</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <h3 className="history-title">Analysis history</h3>
      {runs.length > 0 && (
        <table className="results-table">
          <thead>
            <tr>
              <th>Date and time</th><th>Vehicles</th><th>Congestion</th>
              <th>Emergency</th><th>Green N / S / E / W</th>
            </tr>
          </thead>
          <tbody>
            {runs.map((r) => (
              <tr key={r.upload_id}>
                <td>{new Date(r.created_at).toLocaleString()}</td>
                <td>{r.total_vehicles}</td>
                <td>{worst(r)}</td>
                <td>{r.emergency ? '🚨 Yes' : 'No'}</td>
                <td>{DIRECTIONS.map((d) => r.directions[d]?.green_time_seconds ?? '—').join(' / ')} s</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="future-scope">
        <span className="future-badge">FUTURE SCOPE</span>
        <p>
          This forecast is a statistical baseline (exponential smoothing). With
          more stored data, a deep learning model such as an LSTM can replace it.
        </p>
      </div>
    </section>
  )
}

export default Predictions