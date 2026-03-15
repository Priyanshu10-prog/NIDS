import { useState, useMemo } from 'react'
import ModelStats from '../components/ModelStats'
import ConfusionMatrix from '../components/ConfusionMatrix'
import FeatureImportance from '../components/FeatureImportance'

const STATIC_ROWS = [
  { cls: 'BENIGN', precision: 0.97, recall: 0.98, f1: 0.98, support: 336969 },
  { cls: 'ATTACK', precision: 0.96, recall: 0.94, f1: 0.95, support: 167191 },
]

function countsAtThreshold(histogram, threshold, total) {
  if (!histogram?.length) return { attacks: 0, benign: total, attackPct: '0.0', benignPct: '100.0' }
  const attacks = histogram.filter(b => b.bin >= threshold).reduce((s, b) => s + b.count, 0)
  const benign  = total - attacks
  return {
    attacks, benign,
    attackPct: total > 0 ? (attacks / total * 100).toFixed(1) : '0.0',
    benignPct: total > 0 ? (benign  / total * 100).toFixed(1) : '0.0',
  }
}

const DemoBanner = ({ onGoUpload }) => (
  <div style={{
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    background: 'rgba(255,184,0,0.06)', border: '1px solid rgba(255,184,0,0.35)',
    borderRadius: 8, padding: '10px 18px', marginBottom: 16,
    animation: 'slideUp 0.3s ease',
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ background: 'rgba(255,184,0,0.15)', border: '1px solid rgba(255,184,0,0.4)', borderRadius: 5, padding: '2px 10px', color: '#ffb800', fontSize: 10, fontWeight: 700, letterSpacing: 3 }}>
        DEMO MODE
      </div>
      <span style={{ color: 'rgba(255,184,0,0.75)', fontSize: 11, letterSpacing: 1 }}>
        Showing static training metrics from CIC-IDS 2017. Upload a capture to see live analytics.
      </span>
    </div>
    <span onClick={onGoUpload} style={{ color: 'var(--cyan)', fontSize: 10, letterSpacing: 2, cursor: 'pointer', border: '1px solid rgba(0,245,255,0.3)', borderRadius: 5, padding: '3px 12px' }}>
      ↑ UPLOAD FILE
    </span>
  </div>
)

export default function Analytics({ stats, uploadResult, onGoUpload }) {
  const metrics   = stats?.metrics
  const cm        = metrics?.confusion_matrix
  const report    = metrics?.class_report
  const [threshold, setThreshold] = useState(0.35)

  const rows = report
    ? [{ cls: 'BENIGN', ...report.benign }, { cls: 'ATTACK', ...report.attack }]
    : STATIC_ROWS

  const thresholdCounts = useMemo(
    () => countsAtThreshold(uploadResult?.histogram, threshold, uploadResult?.total ?? 0),
    [threshold, uploadResult]
  )

  return (
    <>
      {!uploadResult && <DemoBanner onGoUpload={onGoUpload} />}

      {/* ModelStats + ConfusionMatrix */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        <ModelStats metrics={metrics} uploadResult={uploadResult} />
        <ConfusionMatrix cm={cm} />
      </div>

      {/* Threshold Slider — only when upload active */}
      {uploadResult && (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: 24, marginBottom: 20, animation: 'slideUp 0.4s ease' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div style={{ color: 'var(--cyan)', fontSize: 11, letterSpacing: 3 }}>◈ DECISION THRESHOLD EXPLORER</div>
            <div style={{ background: 'rgba(0,245,255,0.08)', border: '1px solid rgba(0,245,255,0.25)', borderRadius: 8, padding: '4px 14px', color: 'var(--cyan)', fontSize: 13, fontFamily: 'var(--display)', fontWeight: 700 }}>
              τ = {threshold.toFixed(2)}
            </div>
          </div>
          <style>{`
            .t-slider{-webkit-appearance:none;appearance:none;width:100%;height:4px;
              background:linear-gradient(90deg,var(--cyan) ${(threshold-0.1)/0.8*100}%,rgba(255,255,255,0.08) ${(threshold-0.1)/0.8*100}%);
              border-radius:2px;outline:none;cursor:pointer;}
            .t-slider::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:18px;height:18px;border-radius:50%;
              background:var(--cyan);box-shadow:0 0 10px rgba(0,245,255,0.6);cursor:pointer;}
            .t-slider::-moz-range-thumb{width:18px;height:18px;border-radius:50%;background:var(--cyan);
              box-shadow:0 0 10px rgba(0,245,255,0.6);cursor:pointer;border:none;}
          `}</style>
          <input type="range" min="0.10" max="0.90" step="0.05" value={threshold}
            onChange={e => setThreshold(parseFloat(e.target.value))}
            className="t-slider" style={{ marginBottom: 6 }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
            <span style={{ color: 'var(--text-muted)', fontSize: 9 }}>0.10 — More Sensitive</span>
            <span style={{ color: 'var(--text-muted)', fontSize: 9 }}>0.90 — More Precise</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 16 }}>
            {[
              { label:'ATTACKS',   value: thresholdCounts.attacks.toLocaleString(), color:'var(--red)'    },
              { label:'BENIGN',    value: thresholdCounts.benign.toLocaleString(),  color:'var(--cyan)'   },
              { label:'ATTACK %',  value: `${thresholdCounts.attackPct}%`,          color:'var(--amber)'  },
              { label:'THRESHOLD', value: threshold.toFixed(2),                     color:'var(--purple)' },
            ].map(c => (
              <div key={c.label} style={{ background:'rgba(0,0,0,0.3)', border:`1px solid ${c.color}22`, borderRadius:8, padding:'12px 16px', position:'relative', overflow:'hidden' }}>
                <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,transparent,${c.color},transparent)` }} />
                <div style={{ color:`${c.color}88`, fontSize:9, letterSpacing:3, marginBottom:6 }}>{c.label}</div>
                <div style={{ color:'#fff', fontSize:20, fontFamily:'var(--display)', fontWeight:700, transition:'all 0.15s' }}>{c.value}</div>
              </div>
            ))}
          </div>
          <div style={{ height:12, borderRadius:6, overflow:'hidden', background:'rgba(255,255,255,0.04)', position:'relative' }}>
            <div style={{ position:'absolute', left:0, top:0, height:'100%', width:`${thresholdCounts.benignPct}%`, background:'linear-gradient(90deg,rgba(0,245,255,0.5),rgba(0,245,255,0.3))', borderRadius:'6px 0 0 6px', transition:'width 0.2s ease' }} />
            <div style={{ position:'absolute', right:0, top:0, height:'100%', width:`${thresholdCounts.attackPct}%`, background:'linear-gradient(90deg,rgba(255,60,100,0.3),rgba(255,60,100,0.65))', borderRadius:'0 6px 6px 0', transition:'width 0.2s ease' }} />
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', marginTop:6 }}>
            <span style={{ color:'var(--cyan)', fontSize:10 }}>BENIGN {thresholdCounts.benignPct}%</span>
            <span style={{ color:'var(--red)',  fontSize:10 }}>ATTACK {thresholdCounts.attackPct}%</span>
          </div>
        </div>
      )}

      {/* Classification Report */}
      <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:12, padding:24, marginBottom:20 }}>
        <div style={{ color:'var(--cyan)', fontSize:11, letterSpacing:3, marginBottom:20 }}>◉ CLASSIFICATION REPORT</div>
        <div style={{ display:'grid', gridTemplateColumns:'120px 1fr 1fr 1fr 1fr', gap:12, paddingBottom:12, borderBottom:'1px solid rgba(0,245,255,0.1)', marginBottom:8 }}>
          {['CLASS','PRECISION','RECALL','F1-SCORE','SUPPORT'].map(h => (
            <span key={h} style={{ color:'var(--text-muted)', fontSize:10, letterSpacing:2 }}>{h}</span>
          ))}
        </div>
        {rows.map((r,i) => (
          <div key={r.cls} style={{ display:'grid', gridTemplateColumns:'120px 1fr 1fr 1fr 1fr', gap:12, padding:'10px 0', borderBottom:'1px solid rgba(0,245,255,0.05)', animation:`slideUp 0.4s ease ${i*100}ms both` }}>
            <span style={{ color: i===0?'var(--cyan)':'var(--red)', fontWeight:700, fontSize:12 }}>{r.cls}</span>
            {[r.precision, r.recall, r.f1].map((v,j) => (
              <div key={j}>
                <span style={{ color:'#fff', fontSize:14, fontFamily:'var(--display)', fontWeight:600 }}>{(v*100).toFixed(2)}%</span>
                <div style={{ height:3, marginTop:4, borderRadius:2, overflow:'hidden', background:'rgba(255,255,255,0.06)' }}>
                  <div style={{ height:'100%', width:`${v*100}%`, background:i===0?'var(--cyan)':'var(--red)', opacity:0.7, borderRadius:2 }} />
                </div>
              </div>
            ))}
            <span style={{ color:'var(--text-muted)', fontSize:13 }}>{r.support.toLocaleString()}</span>
          </div>
        ))}
        <div style={{ marginTop:20, padding:16, background:'rgba(0,0,0,0.3)', borderRadius:8, border:'1px solid rgba(0,245,255,0.08)' }}>
          <div style={{ display:'flex', gap:40, flexWrap:'wrap' }}>
            {[
              { label:'Test Samples', value: uploadResult ? uploadResult.total.toLocaleString() : '504,160' },
              { label:'Train Size',   value:'2,016,638' },
              { label:'CV Folds',     value:'5' },
              { label:'Threshold',    value: threshold.toFixed(2) },
              { label:'Exec Time',    value:'1313.98s' },
            ].map(s => (
              <div key={s.label}>
                <div style={{ color:'var(--text-muted)', fontSize:10, letterSpacing:2, marginBottom:4 }}>{s.label}</div>
                <div style={{ color:'#fff', fontSize:14, fontFamily:'var(--display)', fontWeight:600 }}>{s.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Feature Importance — always visible */}
      <div style={{ marginBottom: uploadResult?.histogram ? 20 : 0 }}>
        <FeatureImportance uploadResult={uploadResult} />
      </div>

      {/* Probability Histogram — only when CSV loaded */}
      {uploadResult?.histogram && (
        <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:12, padding:24, animation:'slideUp 0.5s ease' }}>
          <div style={{ color:'var(--cyan)', fontSize:11, letterSpacing:3, marginBottom:6 }}>
            ◈ ATTACK PROBABILITY DISTRIBUTION — {uploadResult.filename}
          </div>
          <div style={{ color:'var(--text-muted)', fontSize:10, marginBottom:20 }}>
            {uploadResult.total.toLocaleString()} flows · threshold {threshold.toFixed(2)} · {thresholdCounts.attacks.toLocaleString()} classified as attack
          </div>
          <div style={{ display:'flex', alignItems:'flex-end', gap:3, height:130 }}>
            {uploadResult.histogram.map((b,i) => {
              const maxCount = Math.max(...uploadResult.histogram.map(x => x.count))
              const h        = maxCount > 0 ? (b.count/maxCount*100) : 0
              const isAtk    = b.bin >= threshold
              return (
                <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center' }}>
                  <div
                    title={`${b.bin.toFixed(2)}–${(b.bin+0.05).toFixed(2)}: ${b.count.toLocaleString()}`}
                    style={{ width:'100%', height:`${h}%`, minHeight:b.count>0?2:0,
                      background: isAtk?`rgba(255,60,100,${0.4+h/150})`:`rgba(0,245,255,${0.3+h/150})`,
                      borderRadius:'2px 2px 0 0',
                      border:`1px solid ${isAtk?'rgba(255,60,100,0.3)':'rgba(0,245,255,0.2)'}`,
                      transition:'background 0.2s, border-color 0.2s',
                    }} />
                </div>
              )
            })}
          </div>
          <div style={{ position:'relative', height:20, marginTop:2 }}>
            <div style={{ position:'absolute', left:`${(threshold-0.1)/0.8*100}%`, top:0, transform:'translateX(-50%)', color:'var(--red)', fontSize:9, letterSpacing:1, transition:'left 0.2s' }}>
              ▲ {threshold.toFixed(2)}
            </div>
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', marginTop:4 }}>
            <span style={{ color:'var(--text-muted)', fontSize:9 }}>0.0 (BENIGN)</span>
            <span style={{ color:'var(--text-muted)', fontSize:9 }}>1.0 (ATTACK)</span>
          </div>
        </div>
      )}
    </>
  )
}