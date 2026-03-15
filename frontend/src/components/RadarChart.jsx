import { useMemo } from 'react'

export default function RadarChart({ data = [], title = 'ATTACK RADAR' }) {
  // data = [{ label, value, color }]  value = 0-100
  const N    = data.length
  const cx   = 130, cy = 130, r = 90
  const toRad = d => (d * Math.PI) / 180

  const points = useMemo(() => {
    return data.map((d, i) => {
      const angle = toRad(-90 + (360 / N) * i)
      return {
        ...d,
        angle,
        x:  cx + r * Math.cos(angle),
        y:  cy + r * Math.sin(angle),
        vx: cx + (r * d.value / 100) * Math.cos(angle),
        vy: cy + (r * d.value / 100) * Math.sin(angle),
        lx: cx + (r + 24) * Math.cos(angle),
        ly: cy + (r + 24) * Math.sin(angle),
      }
    })
  }, [data, N])

  if (N === 0) return null

  // Concentric rings
  const rings  = [0.25, 0.5, 0.75, 1]
  const polygon = (scale) =>
    points.map(p => {
      const x = cx + r * scale * Math.cos(p.angle)
      const y = cy + r * scale * Math.sin(p.angle)
      return `${x},${y}`
    }).join(' ')

  // Filled area
  const filledPoly = points.map(p => `${p.vx},${p.vy}`).join(' ')

  return (
    <div>
      <div style={{ color: 'var(--cyan)', fontSize: 11, letterSpacing: 3, marginBottom: 16 }}>{title}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <svg viewBox="0 0 260 260" style={{ width: 220, flexShrink: 0 }}>
          <defs>
            <filter id="radarGlow">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* Concentric rings */}
          {rings.map((s, i) => (
            <polygon key={i} points={polygon(s)}
              fill="none" stroke="rgba(0,245,255,0.08)" strokeWidth="1" />
          ))}

          {/* Spokes */}
          {points.map((p, i) => (
            <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y}
              stroke="rgba(0,245,255,0.07)" strokeWidth="1" />
          ))}

          {/* Filled polygon */}
          <polygon points={filledPoly}
            fill="rgba(255,60,100,0.15)"
            stroke="rgba(255,60,100,0.6)"
            strokeWidth="1.5"
            filter="url(#radarGlow)"
          />

          {/* Vertex dots */}
          {points.map((p, i) => (
            <circle key={i} cx={p.vx} cy={p.vy} r="4"
              fill={p.color || 'var(--red)'} opacity="0.9"
              filter="url(#radarGlow)"
            />
          ))}

          {/* Labels */}
          {points.map((p, i) => {
            const anchor = p.lx < cx - 5 ? 'end' : p.lx > cx + 5 ? 'start' : 'middle'
            return (
              <text key={i} x={p.lx} y={p.ly + 4}
                textAnchor={anchor} fill="rgba(200,220,255,0.6)"
                fontSize="8" fontFamily="Share Tech Mono, monospace">
                {p.label}
              </text>
            )
          })}

          {/* Center dot */}
          <circle cx={cx} cy={cy} r="3" fill="rgba(0,245,255,0.4)" />
        </svg>

        {/* Legend */}
        <div style={{ flex: 1, minWidth: 100 }}>
          {data.map((d, i) => (
            <div key={d.label} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              marginBottom: 8,
              animation: `slideUp 0.3s ease ${i * 50}ms both`,
            }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: d.color || 'var(--red)', flexShrink: 0, boxShadow: `0 0 6px ${d.color}` }} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'rgba(200,220,255,0.7)', fontSize: 10, fontFamily: 'var(--mono)' }}>{d.label}</span>
                  <span style={{ color: '#fff', fontSize: 10, fontFamily: 'var(--mono)' }}>{d.value}%</span>
                </div>
                <div style={{ height: 2, marginTop: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 1, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${d.value}%`, background: d.color || 'var(--red)', opacity: 0.7, borderRadius: 1 }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}