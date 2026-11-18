function Monitoring() {
  return (
    <section className="page-section">
      <h2>Live Traffic Monitoring</h2>
      <p>Monitor traffic conditions in real time.</p>

      <div className="future-scope">
        <span className="future-badge">FUTURE SCOPE</span>
        <p>
          Live monitoring needs continuous video input from junction cameras.
          The current prototype analyzes one still image per direction. Video
          support (frame sampling with object tracking) is planned for the next
          phase.
        </p>
      </div>
    </section>
  )
}

export default Monitoring