/**
 * THREAT FEED
 *
 * No upload:   shows live WebSocket events (simulated)
 * After upload: shows events derived from top_attacks — real row numbers,
 *               real confidence values, attack types weighted by attack_type_dist
 */

const SEV_COLOR = {
  LOW:      'var(--cyan)',
  MEDIUM:   '#ffb800',
  HIGH:     '#ff8c00',
  CRITICAL: '#ff3c64',
}

export default function ThreatLog({ events = [], uploadResult }) {
  // Badge — tells user whether feed is real or simulated
  const isReal = uploadResult != null

  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: 24, height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <span style={{ color: 'var(--cyan)', fontSize: 11, letterSpacing: 3 }}>⚠ THREAT FEED</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ color: 'var(--text-muted)', fontSize: 10 }}>{events.length} events</span>
          <div style={{
            padding: '2px 9px', borderRadius: 4, fontSize: 9, fontWeight: 700, letterSpacing: 2,
            background: isReal ? 'rgba(0,255,136,0.08)'  : 'rgba(255,184,0,0.08)',
            border:     isReal ? '1px solid rgba(0,255,136,0.3)' : '1px solid rgba(255,184,0,0.3)',
            color:      isReal ? 'var(--green)' : '#ffb800',
          }}>
            {isReal ? '✓ FROM UPLOAD' : 'SIMULATED'}
          </div>
        </div>
      </div>

      {/* Header */}
      <div style={{
        display: 'grid', gridTemplateColumns: '58px 110px 1fr 70px 68px',
        gap: 8, paddingBottom: 8, borderBottom: '1px solid rgba(0,245,255,0.1)', marginBottom: 4,
      }}>
        {['TIME', 'SRC IP', 'TYPE', 'CONF', 'SEV'].map(h => (
          <span key={h} style={{ color: 'var(--text-muted)', fontSize: 9, letterSpacing: 2 }}>{h}</span>
        ))}
      </div>

      <div style={{ overflowY: 'auto', maxHeight: 280 }}>
        {events.length === 0 && (
          <div style={{ color: 'var(--text-muted)', fontSize: 11, padding: '20px 0', textAlign: 'center' }}>
            Waiting for events...
          </div>
        )}
        {events.map((e, i) => (
          <div key={e.id || i} style={{
            display: 'grid', gridTemplateColumns: '58px 110px 1fr 70px 68px',
            gap: 8, padding: '7px 0', borderBottom: '1px solid rgba(0,245,255,0.05)',
            animation: i === 0 ? 'slideUp 0.3s ease' : 'none', alignItems: 'center',
          }}>
            <span style={{ color: 'var(--text-muted)', fontSize: 10 }}>
              {new Date(e.timestamp).toISOString().slice(11, 19)}
            </span>
            <span style={{ color: 'rgba(200,220,255,0.5)', fontSize: 10, fontVariantNumeric: 'tabular-nums', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {e.src_ip}
            </span>
            <span style={{ color: 'var(--red)', fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {e.attack_type}
            </span>
            <span style={{ color: 'var(--text-muted)', fontSize: 10 }}>
              {(e.confidence * 100).toFixed(1)}%
            </span>
            <span style={{
              color: SEV_COLOR[e.severity] ?? 'var(--cyan)',
              fontSize: 9, letterSpacing: 1,
              border: `1px solid ${(SEV_COLOR[e.severity] ?? 'var(--cyan)')}44`,
              borderRadius: 4, padding: '2px 5px', textAlign: 'center',
            }}>
              {e.severity}
            </span>
          </div>
        ))}
      </div>

      {/* Footer note */}
      {isReal && (
        <div style={{ marginTop: 12, padding: '7px 12px', background: 'rgba(0,255,136,0.04)', border: '1px solid rgba(0,255,136,0.12)', borderRadius: 6 }}>
          <span style={{ color: 'rgba(0,255,136,0.6)', fontSize: 9, letterSpacing: 1 }}>
            ✓ Confidence values are real model outputs from {uploadResult.filename}
          </span>
        </div>
      )}
    </div>
  )
}