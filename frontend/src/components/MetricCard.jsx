import { useState, useEffect } from 'react'

export default function MetricCard({ label, value, sub, accent, icon, delay = 0 }) {
  const raw = parseFloat(String(value).replace(/[^0-9.]/g, ''))
  const isPercent = String(value).includes('%')
  const isDecimal = !isPercent && String(value).includes('.')
  const [count, setCount] = useState(0)

  useEffect(() => {
    const steps = 45
    let i = 0
    const t = setTimeout(() => {
      const iv = setInterval(() => {
        i++
        setCount(+(raw * i / steps).toFixed(isDecimal ? 4 : 0))
        if (i >= steps) clearInterval(iv)
      }, 25)
      return () => clearInterval(iv)
    }, delay)
    return () => clearTimeout(t)
  }, [raw])

  const display = isPercent ? `${count}%` : isDecimal ? count.toFixed(4) : count

  return (
    <div style={{
      background: 'var(--card)', border: `1px solid ${accent}22`,
      borderRadius: 12, padding: '20px 24px', position: 'relative', overflow: 'hidden',
      backdropFilter: 'blur(10px)',
      animation: `slideUp 0.5s ease ${delay}ms both`,
    }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
      }} />
      <div style={{ color: `${accent}99`, fontSize: 10, letterSpacing: 3, marginBottom: 10 }}>
        {icon} {label}
      </div>
      <div style={{ color: '#fff', fontSize: 30, fontFamily: 'var(--display)', fontWeight: 700, lineHeight: 1 }}>
        {display}
      </div>
      <div style={{ color: 'var(--text-muted)', fontSize: 11, marginTop: 8 }}>
        {sub}
      </div>
    </div>
  )
}