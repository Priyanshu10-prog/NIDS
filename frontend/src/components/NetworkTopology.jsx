import { useEffect, useRef, useState } from 'react'

const FIXED_NODES = [
  { id: 'gateway', x: 0.5,  y: 0.5,  label: 'GATEWAY',   color: '#00f5ff', size: 14 },
  { id: 'web',     x: 0.2,  y: 0.2,  label: 'WEB SRV',   color: '#00ff88', size: 10 },
  { id: 'db',      x: 0.78, y: 0.2,  label: 'DB SRV',    color: '#c084fc', size: 10 },
  { id: 'internal',x: 0.5,  y: 0.82, label: 'INT NET',   color: '#00ff88', size: 10 },
  { id: 'dmz',     x: 0.2,  y: 0.75, label: 'DMZ',       color: '#ffb800', size: 9  },
  { id: 'admin',   x: 0.78, y: 0.75, label: 'ADMIN',     color: '#00f5ff', size: 9  },
]

const EDGES = [
  ['gateway','web'], ['gateway','db'], ['gateway','internal'],
  ['gateway','dmz'], ['gateway','admin'], ['web','db'],
]

function randomExternal(W, H) {
  const side = Math.floor(Math.random() * 4)
  if (side === 0) return { x: Math.random() * W, y: -10 }
  if (side === 1) return { x: W + 10,             y: Math.random() * H }
  if (side === 2) return { x: Math.random() * W,  y: H + 10 }
  return             { x: -10,                    y: Math.random() * H }
}

export default function NetworkTopology({ events = [], uploadResult }) {
  const canvasRef = useRef(null)
  const particlesRef = useRef([])
  const frameRef     = useRef(null)
  const [stats, setStats] = useState({ total: 0, attacks: 0, benign: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = canvas.width, H = canvas.height

    const nodes = FIXED_NODES.map(n => ({ ...n, px: n.x * W, py: n.y * H }))
    const findNode = id => nodes.find(n => n.id === id)

    let totalPkt = 0, attackPkt = 0, benignPkt = 0

    // Spawn a new particle
    const spawnParticle = () => {
      const isAttack = Math.random() < (uploadResult ? uploadResult.attack_pct / 100 : 0.15)
      const target   = nodes[Math.floor(Math.random() * nodes.length)]
      const src      = randomExternal(W, H)
      const speed    = isAttack ? 1.8 + Math.random() * 1.2 : 1.2 + Math.random() * 0.8
      const dx       = target.px - src.x
      const dy       = target.py - src.y
      const dist     = Math.hypot(dx, dy)
      particlesRef.current.push({
        x: src.x, y: src.y,
        vx: (dx / dist) * speed,
        vy: (dy / dist) * speed,
        target, isAttack,
        color: isAttack ? '#ff3c64' : '#00f5ff',
        alpha: 1,
        size:  isAttack ? 3 : 2,
        trail: [],
      })
      totalPkt++
      if (isAttack) attackPkt++; else benignPkt++
      setStats({ total: totalPkt, attacks: attackPkt, benign: benignPkt })
    }

    const spawnInterval = setInterval(spawnParticle, 180)

    const draw = () => {
      ctx.clearRect(0, 0, W, H)

      // Edges
      EDGES.forEach(([a, b]) => {
        const na = findNode(a), nb = findNode(b)
        if (!na || !nb) return
        ctx.beginPath()
        ctx.moveTo(na.px, na.py)
        ctx.lineTo(nb.px, nb.py)
        ctx.strokeStyle = 'rgba(0,245,255,0.08)'
        ctx.lineWidth   = 1
        ctx.stroke()
      })

      // Particles
      particlesRef.current = particlesRef.current.filter(p => p.alpha > 0.05)
      particlesRef.current.forEach(p => {
        const dist = Math.hypot(p.target.px - p.x, p.target.py - p.y)
        if (dist < 6) { p.alpha -= 0.08; return }

        // Trail
        p.trail.push({ x: p.x, y: p.y, a: p.alpha })
        if (p.trail.length > 8) p.trail.shift()
        p.trail.forEach((t, i) => {
          ctx.beginPath()
          ctx.arc(t.x, t.y, p.size * 0.5, 0, Math.PI * 2)
          ctx.fillStyle = p.color + Math.floor(t.a * (i / p.trail.length) * 80).toString(16).padStart(2, '0')
          ctx.fill()
        })

        // Main dot
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.shadowBlur = p.isAttack ? 8 : 4
        ctx.shadowColor = p.color
        ctx.globalAlpha = p.alpha
        ctx.fill()
        ctx.globalAlpha = 1
        ctx.shadowBlur = 0

        p.x += p.vx; p.y += p.vy
      })

      // Nodes
      nodes.forEach(n => {
        // Pulse ring
        ctx.beginPath()
        ctx.arc(n.px, n.py, n.size + 6, 0, Math.PI * 2)
        ctx.strokeStyle = n.color + '22'
        ctx.lineWidth   = 1
        ctx.stroke()

        // Node body
        ctx.beginPath()
        ctx.arc(n.px, n.py, n.size, 0, Math.PI * 2)
        ctx.fillStyle   = n.color + '33'
        ctx.strokeStyle = n.color + '99'
        ctx.lineWidth   = 1.5
        ctx.shadowBlur  = 10
        ctx.shadowColor = n.color
        ctx.fill()
        ctx.stroke()
        ctx.shadowBlur = 0

        // Label
        ctx.font      = '8px Share Tech Mono, monospace'
        ctx.fillStyle = n.color + 'cc'
        ctx.textAlign = 'center'
        ctx.fillText(n.label, n.px, n.py + n.size + 12)
      })

      frameRef.current = requestAnimationFrame(draw)
    }

    draw()
    return () => {
      clearInterval(spawnInterval)
      cancelAnimationFrame(frameRef.current)
      particlesRef.current = []
    }
  }, [uploadResult])

  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <span style={{ color: 'var(--cyan)', fontSize: 11, letterSpacing: 3 }}>◉ NETWORK TOPOLOGY — LIVE FLOWS</span>
        <div style={{ display: 'flex', gap: 20 }}>
          {[
            { label: 'TOTAL', value: stats.total,   color: 'var(--cyan)' },
            { label: 'ATTACK',value: stats.attacks,  color: 'var(--red)'  },
            { label: 'BENIGN',value: stats.benign,   color: 'var(--green)'},
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ color: s.color, fontSize: 14, fontFamily: 'var(--display)', fontWeight: 700 }}>{s.value.toLocaleString()}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 8, letterSpacing: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
      <canvas
        ref={canvasRef}
        width={560} height={260}
        style={{ width: '100%', borderRadius: 8, background: 'rgba(0,0,0,0.3)', display: 'block' }}
      />
      <div style={{ display: 'flex', gap: 20, marginTop: 12 }}>
        {[['#ff3c64','Attack flow'], ['#00f5ff','Benign flow'], ['rgba(0,245,255,0.3)','Network node']].map(([c, l]) => (
          <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: c }} />
            <span style={{ color: 'var(--text-muted)', fontSize: 10 }}>{l}</span>
          </div>
        ))}
      </div>
    </div>
  )
}