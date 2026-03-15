/**
 * ShapPanel
 * Shows WHY a specific row was classified as ATTACK.
 * Renders a horizontal waterfall chart of SHAP values.
 *
 * Props:
 *   entry  — one item from shap_data[]  { row, probability, true_label, features[] }
 *   onClose — callback to dismiss
 */
export default function ShapPanel({ entry, onClose }) {
  if (!entry) return null

  const maxAbs = Math.max(...entry.features.map(f => Math.abs(f.shap)), 0.001)

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
      zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
      animation: 'fadeIn 0.2s ease',
    }} onClick={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#0b1120', border: '1px solid rgba(0,245,255,0.25)',
          borderRadius: 16, padding: 32, width: 640, maxWidth: '95vw',
          maxHeight: '90vh', overflowY: 'auto',
          boxShadow: '0 0 60px rgba(0,245,255,0.08)',
          animation: 'slideUp 0.3s ease',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <div style={{ color: 'var(--cyan)', fontSize: 11, letterSpacing: 3, marginBottom: 6 }}>
              ◈ SHAP EXPLANATION — ROW #{entry.row}
            </div>
            <div style={{ color: '#fff', fontSize: 18, fontFamily: 'var(--display)', fontWeight: 700 }}>
              Why was this flagged as an attack?
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 18, cursor: 'pointer', lineHeight: 1 }}>✕</button>
        </div>

        {/* Summary row */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
          {[
            { label: 'ROW',         value: `#${entry.row}`,                               color: 'var(--cyan)'   },
            { label: 'CONFIDENCE',  value: `${(entry.probability * 100).toFixed(1)}%`,    color: 'var(--red)'    },
            { label: 'TRUE LABEL',  value: entry.true_label ?? 'Unknown',                 color: 'var(--amber)'  },
            { label: 'VERDICT',     value: 'ATTACK',                                      color: 'var(--red)'    },
          ].map(c => (
            <div key={c.label} style={{ flex: 1, background: 'rgba(0,0,0,0.4)', border: `1px solid ${c.color}18`, borderRadius: 8, padding: '10px 14px' }}>
              <div style={{ color: `${c.color}88`, fontSize: 9, letterSpacing: 2, marginBottom: 4 }}>{c.label}</div>
              <div style={{ color: c.color, fontSize: 13, fontWeight: 700, fontFamily: 'var(--mono)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.value}</div>
            </div>
          ))}
        </div>

        {/* Explainer legend */}
        <div style={{ display: 'flex', gap: 20, marginBottom: 16, padding: '10px 14px', background: 'rgba(0,0,0,0.3)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 14, height: 14, background: 'rgba(255,60,100,0.6)', borderRadius: 2 }} />
            <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>Pushed prediction toward <strong style={{ color: 'var(--red)' }}>ATTACK</strong></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 14, height: 14, background: 'rgba(0,245,255,0.4)', borderRadius: 2 }} />
            <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>Pushed prediction toward <strong style={{ color: 'var(--cyan)' }}>BENIGN</strong></span>
          </div>
        </div>

        {/* Waterfall chart */}
        <div style={{ marginBottom: 8 }}>
          <div style={{ color: 'var(--text-muted)', fontSize: 10, letterSpacing: 2, marginBottom: 12 }}>TOP 10 CONTRIBUTING FEATURES</div>

          {entry.features.map((f, i) => {
            const barPct    = (Math.abs(f.shap) / maxAbs) * 100
            const isAttack  = f.direction === 'attack'
            const barColor  = isAttack ? 'rgba(255,60,100,0.75)' : 'rgba(0,245,255,0.55)'
            const glowColor = isAttack ? 'rgba(255,60,100,0.3)'  : 'rgba(0,245,255,0.2)'

            return (
              <div key={f.feature} style={{ marginBottom: 10, animation: `slideUp 0.3s ease ${i * 40}ms both` }}>
                {/* Feature name + raw value */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: 9, width: 14, textAlign: 'right' }}>{i + 1}</span>
                    <span style={{ color: 'rgba(200,220,255,0.85)', fontSize: 11, fontFamily: 'var(--mono)' }}>
                      {f.feature}
                    </span>
                    <span style={{ color: 'var(--text-muted)', fontSize: 9, fontFamily: 'var(--mono)' }}>
                      = {f.value}
                    </span>
                  </div>
                  <span style={{
                    color: isAttack ? 'var(--red)' : 'var(--cyan)',
                    fontSize: 11, fontWeight: 700, fontFamily: 'var(--mono)',
                    minWidth: 60, textAlign: 'right',
                  }}>
                    {f.shap > 0 ? '+' : ''}{f.shap.toFixed(4)}
                  </span>
                </div>

                {/* Bar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 14, flexShrink: 0 }} />
                  <div style={{ flex: 1, height: 8, background: 'rgba(255,255,255,0.04)', borderRadius: 4, overflow: 'hidden', position: 'relative' }}>
                    {/* All bars start from left — direction shown by colour */}
                    <div style={{
                      position: 'absolute',
                      left: isAttack ? 'auto' : 0,
                      right: isAttack ? 0 : 'auto',
                      top: 0, height: '100%',
                      width: `${barPct}%`,
                      background: barColor,
                      borderRadius: 4,
                      boxShadow: `0 0 8px ${glowColor}`,
                      transition: 'width 0.6s ease',
                    }} />
                  </div>
                  <span style={{
                    color: isAttack ? 'var(--red)' : 'var(--cyan)',
                    fontSize: 9, letterSpacing: 1, width: 48, textAlign: 'right',
                  }}>
                    {isAttack ? '→ ATTACK' : '→ BENIGN'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer interpretation */}
        <div style={{ marginTop: 20, padding: '14px 16px', background: 'rgba(255,60,100,0.04)', border: '1px solid rgba(255,60,100,0.15)', borderRadius: 8 }}>
          <div style={{ color: 'var(--red)', fontSize: 10, letterSpacing: 2, marginBottom: 6 }}>⚠ INTERPRETATION</div>
          <div style={{ color: 'rgba(200,220,255,0.7)', fontSize: 11, lineHeight: 1.7 }}>
            The top contributing feature was <strong style={{ color: '#fff' }}>{entry.features[0]?.feature}</strong> (value: {entry.features[0]?.value}),
            which pushed the prediction strongly toward <strong style={{ color: entry.features[0]?.direction === 'attack' ? 'var(--red)' : 'var(--cyan)' }}>{entry.features[0]?.direction?.toUpperCase()}</strong>.
            Combined, these features produced a final attack probability of <strong style={{ color: 'var(--red)' }}>{(entry.probability * 100).toFixed(1)}%</strong>.
          </div>
        </div>
      </div>
    </div>
  )
}