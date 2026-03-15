import { useState, useEffect, useRef } from 'react'

/**
 * When no upload:   pure Math.random() animation (demo mode)
 * When upload:      seeds the chart from the real timeline data,
 *                   then continues animating but weighted by actual attack_pct
 *
 * The `slice` prop lets Dashboard use the first half and LiveMonitor use
 * 'inbound' (first 20 segments) or 'outbound' (last 20 segments).
 */
export default function LiveTrafficChart({
  title      = 'LIVE TRAFFIC FLOW',
  uploadResult,
  slice      = 'full',   // 'full' | 'inbound' | 'outbound'
}) {
  // Build the initial 50-point series from timeline when upload is present
  const buildFromTimeline = (tl, sliceType) => {
    if (!tl?.length) return null
    const seg = sliceType === 'inbound'
      ? tl.slice(0, Math.ceil(tl.length / 2))
      : sliceType === 'outbound'
        ? tl.slice(Math.floor(tl.length / 2))
        : tl

    // Interpolate timeline attack % into 50 traffic points (20–85 range)
    return Array.from({ length: 50 }, (_, i) => {
      const tIdx    = Math.floor((i / 50) * seg.length)
      const density = seg[tIdx]?.attack_pct ?? 0
      // Higher attack density → spikier, lower values (more chaotic traffic)
      const base    = 45 - density * 0.3
      const noise   = (Math.random() - 0.5) * 30
      return Math.max(10, Math.min(90, base + noise + density * 0.4))
    })
  }

  const buildAttacksFromTimeline = (tl, sliceType, n = 50) => {
    if (!tl?.length) return Array(n).fill(0)
    const seg = sliceType === 'inbound'
      ? tl.slice(0, Math.ceil(tl.length / 2))
      : sliceType === 'outbound'
        ? tl.slice(Math.floor(tl.length / 2))
        : tl

    return Array.from({ length: n }, (_, i) => {
      const tIdx    = Math.floor((i / n) * seg.length)
      const density = (seg[tIdx]?.attack_pct ?? 0) / 100
      // Place a dot if that segment had attacks above a threshold
      return Math.random() < density ? Math.random() * 35 + 10 : 0
    })
  }

  const seeded = uploadResult?.timeline
    ? buildFromTimeline(uploadResult.timeline, slice)
    : null

  const [traffic, setTraffic] = useState(
    () => seeded ?? Array.from({ length: 50 }, () => Math.random() * 65 + 20)
  )
  const [attacks, setAttacks] = useState(
    () => uploadResult?.timeline
      ? buildAttacksFromTimeline(uploadResult.timeline, slice)
      : Array.from({ length: 50 }, () => Math.random() > 0.87 ? Math.random() * 35 + 10 : 0)
  )

  // Re-seed whenever a new file is uploaded
  const prevFile = useRef(null)
  useEffect(() => {
    const fname = uploadResult?.filename ?? null
    if (fname !== prevFile.current) {
      prevFile.current = fname
      if (uploadResult?.timeline) {
        setTraffic(buildFromTimeline(uploadResult.timeline, slice) ?? traffic)
        setAttacks(buildAttacksFromTimeline(uploadResult.timeline, slice))
      }
    }
  }, [uploadResult?.filename])

  // Ongoing animation — attack rate comes from real data when available
  const attackRate = uploadResult
    ? uploadResult.attack_pct / 100
    : 0.13

  useEffect(() => {
    const iv = setInterval(() => {
      setTraffic(d => [...d.slice(1), Math.random() * 65 + 20])
      setAttacks(a => [...a.slice(1), Math.random() < attackRate ? Math.random() * 35 + 10 : 0])
    }, 900)
    return () => clearInterval(iv)
  }, [attackRate])

  const W = 580, H = 130
  const toY      = v => H - (v / 100) * H
  const polyline = traffic.map((v, i) => `${(i / (traffic.length - 1)) * W},${toY(v)}`).join(' ')

  // Unique gradient ID per chart instance (avoids SVG id clash)
  const gradId = `tGrad-${title.replace(/\s/g, '')}`

  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14, alignItems: 'center' }}>
        <div>
          <span style={{ color: 'var(--cyan)', fontSize: 11, letterSpacing: 3 }}>{title}</span>
          {uploadResult && (
            <span style={{ color: 'var(--amber)', fontSize: 9, letterSpacing: 1, marginLeft: 12 }}>
              seeded from {uploadResult.filename} · {uploadResult.attack_pct}% attack rate
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          {[['var(--cyan)', 'NORMAL'], ['var(--red)', 'ATTACK']].map(([c, l]) => (
            <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 20, height: 2, background: c }} />
              <span style={{ color: 'var(--text-muted)', fontSize: 10, letterSpacing: 2 }}>{l}</span>
            </div>
          ))}
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 130, display: 'block' }}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#00f5ff" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#00f5ff" stopOpacity="0"    />
          </linearGradient>
        </defs>
        <polygon points={`0,${H} ${polyline} ${W},${H}`} fill={`url(#${gradId})`} />
        <polyline points={polyline} fill="none" stroke="#00f5ff" strokeWidth="2" />
        {attacks.map((v, i) => v > 0 && (
          <g key={i}>
            <circle cx={(i / (attacks.length - 1)) * W} cy={toY(v)} r="5" fill="var(--red)" opacity="0.85">
              <animate attributeName="r"       values="5;10;5"       dur="1s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.85;0.2;0.85" dur="1s" repeatCount="indefinite" />
            </circle>
          </g>
        ))}
        {[25, 50, 75].map(y => (
          <line key={y} x1="0" y1={toY(y)} x2={W} y2={toY(y)}
            stroke="rgba(0,245,255,0.07)" strokeWidth="1" strokeDasharray="4 6" />
        ))}
      </svg>
    </div>
  )
}