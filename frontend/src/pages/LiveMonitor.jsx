import LiveTrafficChart from '../components/LiveTrafficChart'
import ThreatLog from '../components/ThreatLog'

const DemoBanner = ({ onGoUpload }) => (
  <div style={{
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    background: 'rgba(255,184,0,0.06)', border: '1px solid rgba(255,184,0,0.35)',
    borderRadius: 8, padding: '10px 18px', marginBottom: 16,
    animation: 'slideUp 0.3s ease',
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ background: 'rgba(255,184,0,0.15)', border: '1px solid rgba(255,184,0,0.4)', borderRadius: 5, padding: '2px 10px', color: '#ffb800', fontSize: 10, fontWeight: 700, letterSpacing: 3 }}>
        DEMO MODE
      </div>
      <span style={{ color: 'rgba(255,184,0,0.75)', fontSize: 11, letterSpacing: 1 }}>
        Traffic flow and counters are simulated. Upload a capture file for real analysis.
      </span>
    </div>
    <span onClick={onGoUpload} style={{ color: 'var(--cyan)', fontSize: 10, letterSpacing: 2, cursor: 'pointer', border: '1px solid rgba(0,245,255,0.3)', borderRadius: 5, padding: '3px 12px' }}>
      ↑ UPLOAD FILE
    </span>
  </div>
)

export default function LiveMonitor({ events, liveStats, uploadResult, onGoUpload }) {
  const boxes = uploadResult ? [
    { label: 'TOTAL FLOWS',    value: uploadResult.total.toLocaleString(),                  color: 'var(--cyan)'  },
    { label: 'ATTACKS FOUND',  value: uploadResult.attacks.toLocaleString(),                 color: 'var(--red)'   },
    { label: 'BENIGN TRAFFIC', value: `${uploadResult.benign_pct}%`,                         color: 'var(--green)' },
    { label: 'AVG CONFIDENCE', value: `${(uploadResult.avg_confidence*100).toFixed(1)}%`,   color: 'var(--amber)' },
  ] : [
    { label: 'PACKETS / SEC',   value: liveStats?.packets_per_sec  ?? '—', color: 'var(--cyan)'  },
    { label: 'ATTACKS / MIN',   value: liveStats?.attacks_last_min ?? '—', color: 'var(--red)'   },
    { label: 'BENIGN TRAFFIC',  value: liveStats ? `${liveStats.benign_pct}%` : '—',        color: 'var(--green)' },
    { label: 'EVENTS CAPTURED', value: events.length,                                        color: 'var(--amber)' },
  ]

  return (
    <>
      {!uploadResult && <DemoBanner onGoUpload={onGoUpload} />}

      {/* Counter boxes */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 20 }}>
        {boxes.map(b => (
          <div key={b.label} style={{ background: 'var(--card)', border: `1px solid ${b.color}22`, borderRadius: 12, padding: '18px 22px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,transparent,${b.color},transparent)` }} />
            <div style={{ color: `${b.color}88`, fontSize: 9, letterSpacing: 3, marginBottom: 8 }}>{b.label}</div>
            <div style={{ color: '#fff', fontSize: 28, fontFamily: 'var(--display)', fontWeight: 700 }}>{b.value}</div>
          </div>
        ))}
      </div>

      {/* Two traffic charts — seeded from real timeline when upload active */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        <LiveTrafficChart title="INBOUND TRAFFIC"  uploadResult={uploadResult} slice="inbound"  />
        <LiveTrafficChart title="OUTBOUND TRAFFIC" uploadResult={uploadResult} slice="outbound" />
      </div>

      {/* Threat log */}
      <ThreatLog events={events} uploadResult={uploadResult} />
    </>
  )
}