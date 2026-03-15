export default function GridBackground() {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden',
      background: 'linear-gradient(135deg, #020409 0%, #050d1a 50%, #020409 100%)',
    }}>
      <svg width="100%" height="100%" style={{ position: 'absolute', opacity: 0.06 }}>
        <defs>
          <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#00f5ff" strokeWidth="0.6" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
      <div style={{
        position: 'absolute', top: '8%', left: '4%', width: 500, height: 500,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,245,255,0.05) 0%, transparent 70%)',
        animation: 'pulse 5s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute', bottom: '12%', right: '6%', width: 600, height: 600,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,60,100,0.04) 0%, transparent 70%)',
        animation: 'pulse 7s ease-in-out infinite reverse',
      }} />
      <div style={{
        position: 'absolute', left: 0, right: 0, height: 2, pointerEvents: 'none',
        background: 'linear-gradient(90deg, transparent, rgba(0,245,255,0.04), transparent)',
        animation: 'scanline 10s linear infinite',
      }} />
    </div>
  )
}