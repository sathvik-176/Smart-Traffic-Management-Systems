type StatCardProps = {
  icon: string
  title: string
  value: string
}

function StatCard({ icon, title, value }: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>
      <h3>{title}</h3>
      <strong>{value}</strong>
    </div>
  )
}

export default StatCard
