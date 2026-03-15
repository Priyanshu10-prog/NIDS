const LINKS = ['Upload', 'Dashboard', 'Live Monitor', 'Analytics']

export default function Navbar({ active, setActive, wsStatus, uploadResult }) {
  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      borderBottom: '1px solid rgba(0,245,255,0.12)',
      backdropFilter: 'blur(20px)',
      background: 'rgba(2,4,9,0.9)',
      display: 'flex', alignItems: 'center',
      padding: '0 2rem', height: 64,
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginRight: 40 }}>
        <div style={{
          width: 36, height: 36, border: '2px solid var(--cyan)',
          borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'glow 2.5s ease-in-out infinite',
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="#00f5ff" strokeWidth="1.5" fill="rgba(0,245,255,0.1)" />
            <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="#00f5ff" strokeWidth="1.5" />
          </svg>
        </div>
        <div>
          <div style={{ color: 'var(--cyan)', fontSize: 13, fontWeight: 700, letterSpacing: 3 }}>SENTINEL</div>
          <div style={{ color: 'rgba(0,245,255,0.4)', fontSize: 8, letterSpacing: 3 }}>IDS PLATFORM</div>
        </div>
      </div>

      {/* Nav links */}
      {LINKS.map(l => (
        <button key={l} onClick={() => setActive(l)} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: active === l ? 'var(--cyan)' : 'var(--text-muted)',
          fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: 2,
          padding: '0 16px', height: 64,
          borderBottom: active === l ? '2px solid var(--cyan)' : '2px solid transparent',
          transition: 'all 0.2s', textTransform: 'uppercase',
          position: 'relative',
        }}>
          {l}
          {/* Green dot when a file is loaded, amber dot when not */}
          {l === 'Upload' && (
            <span style={{
              position: 'absolute', top: 14, right: 8,
              width: 6, height: 6, borderRadius: '50%',
              background: uploadResult ? 'var(--green)' : 'var(--amber)',
              opacity: 0.85,
              boxShadow: uploadResult ? '0 0 6px var(--green)' : 'none',
            }} />
          )}
        </button>
      ))}

      {/* WS status — right side, identical to original */}
      <div style={{ marginLeft: 'auto' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'rgba(0,245,255,0.06)', border: '1px solid rgba(0,245,255,0.2)',
          borderRadius: 20, padding: '4px 14px',
        }}>
          <div style={{
            width: 6, height: 6, borderRadius: '50%',
            background: wsStatus === 'connected' ? 'var(--green)' : 'var(--red)',
            animation: wsStatus === 'connected' ? 'pulse 1.5s infinite' : 'blink 1s infinite',
          }} />
          <span style={{
            color: wsStatus === 'connected' ? 'var(--green)' : 'var(--red)',
            fontSize: 10, letterSpacing: 2,
          }}>
            {wsStatus === 'connected' ? 'LIVE' : 'OFFLINE'}
          </span>
        </div>
      </div>
    </nav>
  )
}