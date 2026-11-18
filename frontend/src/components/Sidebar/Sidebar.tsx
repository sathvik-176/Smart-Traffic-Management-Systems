import { NavLink } from 'react-router-dom'

const LINKS = [
  { to: '/dashboard', icon: '📊', label: 'Dashboard' },
  { to: '/junctions', icon: '🚦', label: 'Junctions' },
  { to: '/analytics', icon: '📈', label: 'Analytics' },
  { to: '/monitoring', icon: '🎥', label: 'Monitoring' },
  { to: '/predictions', icon: '🔮', label: 'Predictions' },
]

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-logo">🚦</span>
        <div>
          <h2>Traffic<span className="brand-x">X</span></h2>
          <small>MANAGEMENT SYSTEM</small>
        </div>
      </div>

      <nav className="sidebar-nav">
        {LINKS.map((l) => (
          <NavLink key={l.to} to={l.to}>
            <span className="nav-icon">{l.icon}</span>
            <span>{l.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}

export default Sidebar