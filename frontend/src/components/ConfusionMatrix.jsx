export default function ConfusionMatrix({ cm }) {
  const data   = cm
    ? [[cm.tn, cm.fp], [cm.fn, cm.tp]]
    : [[331244, 5725], [10137, 157054]]
  const labels = ['BENIGN', 'ATTACK']
  const max    = Math.max(...data.flat())

  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: 24 }}>
      <div style={{ color: 'var(--cyan)', fontSize: 11, letterSpacing: 3, marginBottom: 20 }}>◫ CONFUSION MATRIX</div>

      <div style={{ textAlign: 'center', marginBottom: 6 }}>
        <span style={{ color: 'var(--text-muted)', fontSize: 9, letterSpacing: 3 }}>PREDICTED →</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '48px 1fr 1fr', gap: 6, alignItems: 'center' }}>
        <div />
        {labels.map(l => (
          <div key={l} style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 9, letterSpacing: 2, paddingBottom: 4 }}>{l}</div>
        ))}

        {data.map((row, ri) => [
          <div key={`lbl${ri}`} style={{
            color: 'var(--text-muted)', fontSize: 9, letterSpacing: 1,
            writingMode: 'vertical-rl', textOrientation: 'mixed',
            transform: 'rotate(180deg)', textAlign: 'center',
          }}>{labels[ri]}</div>,

          ...row.map((val, ci) => {
            const isDiag    = ri === ci
            const intensity = val / max
            return (
              <div key={ci} style={{
                background: isDiag
                  ? `rgba(0,245,255,${intensity * 0.45})`
                  : `rgba(255,60,100,${intensity * 0.7})`,
                border: `1px solid ${isDiag ? 'rgba(0,245,255,0.2)' : 'rgba(255,60,100,0.2)'}`,
                borderRadius: 8, padding: '22px 10px', textAlign: 'center',
              }}>
                {/* No raw numbers — just the label and a visual intensity bar */}
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, fontFamily: 'var(--mono)', letterSpacing: 1, marginBottom: 8 }}>
                  {isDiag ? (ri === 0 ? 'TN' : 'TP') : (ri === 0 ? 'FP' : 'FN')}
                </div>
                {/* Intensity fill bar */}
                <div style={{ height: 4, background: 'rgba(0,0,0,0.3)', borderRadius: 2, overflow: 'hidden', margin: '0 auto', width: '70%' }}>
                  <div style={{
                    height: '100%',
                    width: `${intensity * 100}%`,
                    background: isDiag ? 'rgba(0,245,255,0.7)' : 'rgba(255,60,100,0.8)',
                    borderRadius: 2,
                  }} />
                </div>
                <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 9, marginTop: 8, fontFamily: 'var(--mono)' }}>
                  {(val / data.flat().reduce((a, b) => a + b, 0) * 100).toFixed(1)}%
                </div>
              </div>
            )
          }),
        ])}
      </div>

      <div style={{ display: 'flex', gap: 16, marginTop: 16 }}>
        {[['rgba(0,245,255,0.4)', 'Correct (TN / TP)'], ['rgba(255,60,100,0.4)', 'Misclassified (FP / FN)']].map(([c, l]) => (
          <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 10, height: 10, background: c, borderRadius: 2 }} />
            <span style={{ color: 'var(--text-muted)', fontSize: 10 }}>{l}</span>
          </div>
        ))}
      </div>
    </div>
  )
}