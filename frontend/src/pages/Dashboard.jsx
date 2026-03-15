import MetricCard from '../components/MetricCard'
import LiveTrafficChart from '../components/LiveTrafficChart'
import ThreatLog from '../components/ThreatLog'
import ModelStats from '../components/ModelStats'
import ConfusionMatrix from '../components/ConfusionMatrix'
import ThreatGauge from '../components/ThreatGauge'
import RadarChart from '../components/RadarChart'

const RADAR_COLORS = ['#ff3c64','#ffb800','#c084fc','#00f5ff','#ff9f43','#fd79a8','#55efc4','#a29bfe']

// What the model can detect — shown in idle state
const CAPABILITIES = [
  { type: 'DDoS / DoS',          desc: 'UDP flood, Slowloris, GoldenEye, Hulk',        color: '#ff3c64', icon: '⚡' },
  { type: 'Port Scan',            desc: 'SYN scan, Xmas, FIN, NULL, ACK',               color: '#ffb800', icon: '🔍' },
  { type: 'Web Attacks',          desc: 'SQL injection, XSS, brute force',              color: '#c084fc', icon: '🌐' },
  { type: 'Brute Force',          desc: 'SSH, FTP credential stuffing',                 color: '#00f5ff', icon: '🔑' },
  { type: 'Infiltration',         desc: 'Lateral movement, internal pivoting',          color: '#ff9f43', icon: '🕵' },
  { type: 'Botnet C2',            desc: 'Command & control beacon detection',           color: '#fd79a8', icon: '🤖' },
  { type: 'Heartbleed',           desc: 'OpenSSL memory leak exploitation',             color: '#55efc4', icon: '💉' },
]

// Shown only in idle (no upload) — real system health cards
const SYSTEM_CARDS = [
  { label: 'MODEL STATUS',    value: 'ONLINE',  sub: 'Voting Ensemble · RF + LR + ET',  accent: '#00ff88', icon: '◉', isText: true },
  { label: 'ACCURACY',        value: '96.85%',  sub: 'CIC-IDS 2017 test set',            accent: '#00f5ff', icon: '◈' },
  { label: 'CLASSES',         value: '15',      sub: 'Attack categories supported',      accent: '#c084fc', icon: '◫' },
  { label: 'THRESHOLD',       value: '0.35',    sub: 'Decision boundary (tunable)',       accent: '#ffb800', icon: '◐' },
]

export default function Dashboard({ events, stats, uploadResult, onClear, wsStatus, onGoUpload }) {
  const cm      = stats?.metrics?.confusion_matrix
  const metrics = stats?.metrics
  const keyPfx  = uploadResult ? uploadResult.filename : 'system'

  // ── Cards change based on mode ───────────────────────────────────────────
  const uploadCards = uploadResult ? [
    { label: 'TOTAL FLOWS',      value: uploadResult.total,                                    sub: `From ${uploadResult.filename}`,          accent: '#00f5ff', icon: '◈', delay: 0   },
    { label: 'ATTACKS DETECTED', value: uploadResult.attacks,                                  sub: `${uploadResult.attack_pct}% of traffic`, accent: '#ff3c64', icon: '⚠', delay: 100 },
    { label: 'BENIGN FLOWS',     value: uploadResult.benign,                                   sub: `${uploadResult.benign_pct}% of traffic`, accent: '#00ff88', icon: '◉', delay: 200 },
    { label: 'AVG ATTACK CONF.', value: `${(uploadResult.avg_confidence*100).toFixed(1)}%`,   sub: 'Mean attack probability',                accent: '#c084fc', icon: '◫', delay: 300 },
  ] : null

  const threatScore = uploadResult
    ? Math.min(100, Math.round(uploadResult.attack_pct * 0.6 + uploadResult.avg_confidence * 100 * 0.4))
    : Math.min(100, Math.round((events.length / 2) + 12))

  const radarData = uploadResult?.attack_type_dist
    ? Object.entries(uploadResult.attack_type_dist).map(([label, count], i) => ({
        label, value: Math.round((count / uploadResult.attacks) * 100), color: RADAR_COLORS[i % RADAR_COLORS.length],
      }))
    : [
        { label:'DDoS',         value: 42, color:'#ff3c64' },
        { label:'PortScan',     value: 28, color:'#ffb800' },
        { label:'Web Attack',   value: 18, color:'#c084fc' },
        { label:'Brute Force',  value: 14, color:'#00f5ff' },
        { label:'DoS',          value: 22, color:'#ff9f43' },
        { label:'Botnet C2',    value: 9,  color:'#fd79a8' },
        { label:'Infiltration', value: 5,  color:'#55efc4' },
        { label:'Heartbleed',   value: 2,  color:'#a29bfe' },
      ]

  return (
    <>
      {/* ── Demo mode banner — shown when no file is loaded ─────────────── */}
      {!uploadResult && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'rgba(255,184,0,0.06)', border: '1px solid rgba(255,184,0,0.35)',
          borderRadius: 8, padding: '10px 18px', marginBottom: 16,
          animation: 'slideUp 0.3s ease',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              background: 'rgba(255,184,0,0.15)', border: '1px solid rgba(255,184,0,0.4)',
              borderRadius: 5, padding: '2px 10px',
              color: '#ffb800', fontSize: 10, fontWeight: 700, letterSpacing: 3,
            }}>
              DEMO MODE
            </div>
            <span style={{ color: 'rgba(255,184,0,0.75)', fontSize: 11, letterSpacing: 1 }}>
              Showing simulated live traffic and static training metrics. Upload a network capture to analyse real data.
            </span>
          </div>
          <a
            onClick={() => onGoUpload && onGoUpload()}
            style={{ color: 'var(--cyan)', fontSize: 10, letterSpacing: 2, cursor: 'pointer', textDecoration: 'none', border: '1px solid rgba(0,245,255,0.3)', borderRadius: 5, padding: '3px 12px', whiteSpace: 'nowrap' }}
          >
            ↑ UPLOAD FILE
          </a>
        </div>
      )}

      {/* ── Upload active strip ──────────────────────────────────────────── */}
      {uploadResult && (
        <div style={{
          display:'flex', alignItems:'center', justifyContent:'space-between',
          background:'rgba(0,255,136,0.04)', border:'1px solid rgba(0,255,136,0.15)',
          borderRadius:8, padding:'6px 16px', marginBottom:16,
          animation:'slideUp 0.3s ease',
        }}>
          <span style={{ color:'rgba(0,255,136,0.7)', fontSize:10, letterSpacing:2 }}>
            ✓ ANALYSIS ACTIVE — {uploadResult.filename} · {uploadResult.total.toLocaleString()} flows · {uploadResult.attacks.toLocaleString()} attacks detected
          </span>
          <button onClick={onClear} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', fontSize:10, fontFamily:'var(--mono)' }}>
            ✕ clear
          </button>
        </div>
      )}

      {/* ── Metric cards ─────────────────────────────────────────────────── */}
      {uploadResult ? (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:20 }}>
          {uploadCards.map(m => <MetricCard key={`${keyPfx}-${m.label}`} {...m} />)}
        </div>
      ) : (
        // Idle state: show system health cards
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:20 }}>
          {SYSTEM_CARDS.map((c, i) => (
            <div key={c.label} style={{
              background:'var(--card)', border:`1px solid ${c.accent}22`,
              borderRadius:12, padding:'20px 24px', position:'relative', overflow:'hidden',
              backdropFilter:'blur(10px)', animation:`slideUp 0.5s ease ${i*80}ms both`,
            }}>
              <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,transparent,${c.accent},transparent)` }} />
              <div style={{ color:`${c.accent}99`, fontSize:10, letterSpacing:3, marginBottom:10 }}>{c.icon} {c.label}</div>
              <div style={{ color: c.isText ? c.accent : '#fff', fontSize: c.isText ? 18 : 30, fontFamily:'var(--display)', fontWeight:700, lineHeight:1 }}>
                {c.value}
              </div>
              <div style={{ color:'var(--text-muted)', fontSize:11, marginTop:8 }}>{c.sub}</div>
              {c.isText && (
                <div style={{ position:'absolute', top:16, right:16, width:8, height:8, borderRadius:'50%', background:c.accent, boxShadow:`0 0 8px ${c.accent}`, animation:'pulse 1.5s infinite' }} />
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Gauge + Radar ────────────────────────────────────────────────── */}
      <div style={{ display:'grid', gridTemplateColumns:'260px 1fr', gap:16, marginBottom:20 }}>
        <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:12, padding:'24px 16px', display:'flex', flexDirection:'column', alignItems:'center', animation:'slideUp 0.5s ease' }}>
          <div style={{ color:'var(--cyan)', fontSize:11, letterSpacing:3, marginBottom:12, alignSelf:'flex-start' }}>◈ THREAT LEVEL</div>
          <ThreatGauge value={threatScore} label={uploadResult ? 'UPLOAD RISK' : 'LIVE RISK'} />
          <div style={{ marginTop:12, width:'100%' }}>
            {[['0–30','LOW','#00ff88'],['30–55','MODERATE','#ffb800'],['55–75','HIGH','#ff8c00'],['75–100','CRITICAL','#ff3c64']].map(([r,l,c]) => (
              <div key={l} style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                <span style={{ color:'var(--text-muted)', fontSize:9, fontFamily:'var(--mono)' }}>{r}</span>
                <span style={{ color:c, fontSize:9, fontFamily:'var(--mono)', letterSpacing:1 }}>{l}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:12, padding:24, animation:'slideUp 0.5s ease 100ms both' }}>
          <RadarChart data={radarData} title={
            uploadResult?.has_real_labels
              ? '◈ ATTACK TYPE RADAR — REAL LABELS FROM CSV'
              : uploadResult
                ? '◈ ATTACK TYPE RADAR — ESTIMATED FROM CONFIDENCE'
                : '◈ ATTACK TYPE RADAR — LIVE STREAM'
          } />
        </div>
      </div>

      {/* ── Idle: model capability panel ─────────────────────────────────── */}
      {!uploadResult && (
        <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:12, padding:24, marginBottom:20, animation:'slideUp 0.5s ease' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
            <div style={{ color:'var(--cyan)', fontSize:11, letterSpacing:3 }}>◈ DETECTION CAPABILITIES — LIVE MONITORING ACTIVE</div>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <div style={{ width:6, height:6, borderRadius:'50%', background:'var(--green)', animation:'pulse 1.5s infinite' }} />
              <span style={{ color:'var(--green)', fontSize:10, letterSpacing:2 }}>SENSOR ONLINE</span>
            </div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
            {CAPABILITIES.map((cap, i) => (
              <div key={cap.type} style={{
                background:'rgba(0,0,0,0.3)', border:`1px solid ${cap.color}22`,
                borderRadius:8, padding:'12px 14px',
                animation:`slideUp 0.4s ease ${i*60}ms both`,
              }}>
                <div style={{ fontSize:18, marginBottom:8 }}>{cap.icon}</div>
                <div style={{ color:cap.color, fontSize:11, fontWeight:700, marginBottom:4, fontFamily:'var(--mono)' }}>{cap.type}</div>
                <div style={{ color:'var(--text-muted)', fontSize:10, lineHeight:1.5 }}>{cap.desc}</div>
              </div>
            ))}
            {/* CTA tile */}
            <div style={{
              background:`rgba(0,245,255,0.03)`, border:`1px dashed rgba(0,245,255,0.2)`,
              borderRadius:8, padding:'12px 14px', display:'flex', flexDirection:'column',
              justifyContent:'center', alignItems:'center', textAlign:'center', cursor:'pointer',
              animation:`slideUp 0.4s ease ${CAPABILITIES.length*60}ms both`,
            }}>
              <div style={{ fontSize:22, marginBottom:8 }}>📂</div>
              <div style={{ color:'rgba(0,245,255,0.7)', fontSize:11, fontFamily:'var(--mono)' }}>Upload logs to analyse a capture</div>
            </div>
          </div>
        </div>
      )}

      {/* ── Traffic + Threat log ─────────────────────────────────────────── */}
      <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:16, marginBottom:20 }}>
        <LiveTrafficChart uploadResult={uploadResult} />
        <ThreatLog events={events} uploadResult={uploadResult} />
      </div>

      {/* ── Model stats + Confusion matrix ───────────────────────────────── */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
        <ModelStats metrics={metrics} uploadResult={uploadResult} />
        <ConfusionMatrix cm={cm} />
      </div>
    </>
  )
}