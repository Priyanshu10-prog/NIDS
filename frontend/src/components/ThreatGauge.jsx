import { useEffect, useState } from 'react'

// Draws a circular arc gauge. value = 0-100
export default function ThreatGauge({ value = 0, label = 'THREAT LEVEL', animate = true }) {
  const [displayed, setDisplayed] = useState(0)

  useEffect(() => {
    if (!animate) { setDisplayed(value); return }
    let start = null
    const duration = 1200
    const from = displayed
    const to   = value
    const step = (ts) => {
      if (!start) start = ts
      const progress = Math.min((ts - start) / duration, 1)
      const eased    = 1 - Math.pow(1 - progress, 3)
      setDisplayed(Math.round(from + (to - from) * eased))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [value])

  // Arc geometry
  const cx = 100, cy = 100, r = 72
  const startAngle = -220
  const sweepTotal = 260  // degrees
  const toRad = d => (d * Math.PI) / 180

  const arcPath = (fromDeg, toDeg, radius) => {
    const x1 = cx + radius * Math.cos(toRad(fromDeg))
    const y1 = cy + radius * Math.sin(toRad(fromDeg))
    const x2 = cx + radius * Math.cos(toRad(toDeg))
    const y2 = cy + radius * Math.sin(toRad(toDeg))
    const large = Math.abs(toDeg - fromDeg) > 180 ? 1 : 0
    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${large} 1 ${x2} ${y2}`
  }

  const fillAngle = startAngle + (displayed / 100) * sweepTotal
  const endAngle  = startAngle + sweepTotal

  // Colour interpolation: green → amber → red
  const color = displayed < 40
    ? `hsl(${160 - displayed * 1.5}, 90%, 55%)`
    : displayed < 70
    ? `hsl(${50 - (displayed - 40) * 1.5}, 90%, 55%)`
    : `hsl(${5}, 90%, 60%)`

  // Tick marks
  const ticks = [0, 25, 50, 75, 100].map(pct => {
    const angle = startAngle + (pct / 100) * sweepTotal
    const inner = r - 10
    const outer = r + 2
    return {
      x1: cx + inner * Math.cos(toRad(angle)),
      y1: cy + inner * Math.sin(toRad(angle)),
      x2: cx + outer * Math.cos(toRad(angle)),
      y2: cy + outer * Math.sin(toRad(angle)),
      lx: cx + (r - 22) * Math.cos(toRad(angle)),
      ly: cy + (r - 22) * Math.sin(toRad(angle)),
      label: pct,
    }
  })

  const riskLabel = displayed < 30 ? 'LOW' : displayed < 55 ? 'MODERATE' : displayed < 75 ? 'HIGH' : 'CRITICAL'

  return (
    <div style={{ textAlign: 'center' }}>
      <svg viewBox="0 0 200 170" style={{ width: '100%', maxWidth: 220 }}>
        <defs>
          <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#00ff88" />
            <stop offset="50%"  stopColor="#ffb800" />
            <stop offset="100%" stopColor="#ff3c64" />
          </linearGradient>
          <filter id="gaugeGlow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Track */}
        <path d={arcPath(startAngle, endAngle, r)} fill="none"
          stroke="rgba(255,255,255,0.06)" strokeWidth="10" strokeLinecap="round" />

        {/* Gradient fill track (background decoration) */}
        <path d={arcPath(startAngle, endAngle, r)} fill="none"
          stroke="url(#gaugeGrad)" strokeWidth="10" strokeLinecap="round" opacity="0.12" />

        {/* Active fill arc */}
        {displayed > 0 && (
          <path d={arcPath(startAngle, fillAngle, r)} fill="none"
            stroke={color} strokeWidth="10" strokeLinecap="round"
            filter="url(#gaugeGlow)"
            style={{ transition: 'stroke 0.4s ease' }}
          />
        )}

        {/* Tick marks */}
        {ticks.map(t => (
          <g key={t.label}>
            <line x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
              stroke="rgba(200,220,255,0.2)" strokeWidth="1.5" />
          </g>
        ))}

        {/* Center value */}
        <text x={cx} y={cy - 6} textAnchor="middle"
          fill="#fff" fontSize="32" fontFamily="Rajdhani, sans-serif" fontWeight="700">
          {displayed}
        </text>
        <text x={cx} y={cy + 14} textAnchor="middle"
          fill={color} fontSize="11" fontFamily="Share Tech Mono, monospace" letterSpacing="2">
          {riskLabel}
        </text>
        <text x={cx} y={cy + 30} textAnchor="middle"
          fill="rgba(200,220,255,0.4)" fontSize="8" fontFamily="Share Tech Mono, monospace" letterSpacing="3">
          {label}
        </text>

        {/* Needle dot */}
        {displayed > 0 && (
          <circle
            cx={cx + (r - 1) * Math.cos(toRad(fillAngle))}
            cy={cy + (r - 1) * Math.sin(toRad(fillAngle))}
            r="5" fill={color} filter="url(#gaugeGlow)"
          />
        )}

        {/* Min/Max labels */}
        <text x={cx + r * Math.cos(toRad(startAngle)) - 2} y={cy + r * Math.sin(toRad(startAngle)) + 14}
          textAnchor="middle" fill="rgba(200,220,255,0.3)" fontSize="8" fontFamily="Share Tech Mono, monospace">0</text>
        <text x={cx + r * Math.cos(toRad(endAngle)) + 2} y={cy + r * Math.sin(toRad(endAngle)) + 14}
          textAnchor="middle" fill="rgba(200,220,255,0.3)" fontSize="8" fontFamily="Share Tech Mono, monospace">100</text>
      </svg>
    </div>
  )
}