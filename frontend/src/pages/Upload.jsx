import { useState, useRef } from 'react'
import ShapPanel from '../components/Shappanel'

const STEP_LABELS = ['Select File', 'Uploading', 'Analysing', 'Complete']

function ProgressBar({ pct, color = 'var(--cyan)' }) {
  return (
    <div style={{ height:4, background:'rgba(255,255,255,0.06)', borderRadius:2, overflow:'hidden' }}>
      <div style={{ height:'100%', width:`${pct}%`, background:`linear-gradient(90deg,${color}66,${color})`, borderRadius:2, transition:'width 0.4s ease', boxShadow:`0 0 8px ${color}55` }} />
    </div>
  )
}

function exportCSV(result) {
  const headers = ['Row','Classification','Probability','Is_Attack']
  const lines   = result.rows.map(r => `${r.row},${r.classification},${r.probability},${r.is_attack}`)
  const csv     = [headers.join(','), ...lines].join('\n')
  const blob    = new Blob([csv], { type:'text/csv;charset=utf-8;' })
  const url     = URL.createObjectURL(blob)
  const a       = document.createElement('a')
  a.href = url; a.download = `sentinel_predictions_${result.filename}`; a.click()
  URL.revokeObjectURL(url)
}

const FORMAT_HINTS = [
  {
    title: 'CIC-IDS 2017 / CIC-IDS 2018',
    desc:  '78 numeric flow features. Label column auto-stripped. All 8 daily capture files supported.',
    icon:  '📊',
    color: 'var(--cyan)',
  },
  {
    title: 'CICFlowMeter Export',
    desc:  'CSV output from CICFlowMeter tool. Any capture file converted to flow features.',
    icon:  '🔄',
    color: 'var(--green)',
  },
  {
    title: 'Custom Network Logs',
    desc:  'Any CSV with numeric network flow features. Model uses all numeric columns it was trained on.',
    icon:  '📁',
    color: 'var(--amber)',
  },
  {
    title: 'PCAP → CSV Pipeline',
    desc:  'Convert .pcap with CICFlowMeter first, then upload the resulting CSV here.',
    icon:  '📡',
    color: 'var(--purple)',
  },
]

export default function Upload({ onResult, lastResult, onClear }) {
  const [dragging, setDragging] = useState(false)
  const [step,     setStep]     = useState(0)
  const [progress, setProgress] = useState(0)
  const [error,    setError]    = useState(null)
  const [result,   setResult]   = useState(lastResult)
  const [selectedShap, setSelectedShap] = useState(null)
  const fileRef = useRef()

  const handleFile = async (file) => {
    if (!file || !file.name.endsWith('.csv')) { setError('Please select a .csv file.'); return }
    setError(null); setStep(1); setProgress(10)
    const formData = new FormData()
    formData.append('file', file)
    try {
      const ticker = setInterval(() => setProgress(p => Math.min(p + 6, 72)), 180)
      const res    = await fetch('/api/upload', { method:'POST', body:formData })
      clearInterval(ticker)
      if (!res.ok) { const err = await res.json(); throw new Error(err.detail || 'Upload failed') }
      setStep(2); setProgress(88)
      await new Promise(r => setTimeout(r, 500))
      setProgress(100); setStep(3)
      const data = await res.json()
      setResult(data)
      onResult(data)
    } catch (e) { setStep(0); setProgress(0); setError(e.message) }
  }

  const onDrop = (e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]) }
  const reset  = () => { setStep(0); setProgress(0); setError(null); setResult(null); if (onClear) onClear() }

  return (
    <>
      {/* ── Drop zone ──────────────────────────────────────────────────── */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => step === 0 && fileRef.current.click()}
        style={{
          background: dragging ? 'rgba(0,245,255,0.07)' : 'var(--card)',
          border:`2px dashed ${dragging ? 'var(--cyan)' : 'rgba(0,245,255,0.25)'}`,
          borderRadius:16, padding:'48px 32px', textAlign:'center',
          cursor: step===0 ? 'pointer' : 'default',
          marginBottom:24, transition:'all 0.2s', animation:'slideUp 0.4s ease',
        }}
      >
        <input ref={fileRef} type="file" accept=".csv" style={{ display:'none' }} onChange={e => handleFile(e.target.files[0])} />
        {step === 0 && (
          <>
            <div style={{ fontSize:44, marginBottom:16 }}>📡</div>
            <div style={{ color:'#fff', fontSize:18, fontFamily:'var(--display)', fontWeight:700, marginBottom:8 }}>
              Upload Network Flow Capture
            </div>
            <div style={{ color:'var(--text-muted)', fontSize:12, marginBottom:6 }}>
              Drop a CSV export from CICFlowMeter, Wireshark, or any network flow tool
            </div>
            <div style={{ color:'rgba(0,245,255,0.4)', fontSize:11, marginBottom:22 }}>
              Label column auto-detected and removed · Numeric features extracted automatically
            </div>
            <div style={{ display:'inline-block', padding:'8px 28px', border:'1px solid var(--cyan)', borderRadius:8, color:'var(--cyan)', fontSize:12, letterSpacing:2 }}>
              BROWSE FILE
            </div>
          </>
        )}
        {(step===1||step===2) && (
          <div style={{ maxWidth:420, margin:'0 auto' }}>
            <div style={{ width:48, height:48, border:'3px solid rgba(0,245,255,0.15)', borderTop:'3px solid var(--cyan)', borderRadius:'50%', animation:'spin 1s linear infinite', margin:'0 auto 20px' }} />
            <div style={{ color:'var(--cyan)', fontSize:14, fontWeight:700, marginBottom:16 }}>{STEP_LABELS[step]}...</div>
            <ProgressBar pct={progress} />
            <div style={{ color:'var(--text-muted)', fontSize:11, marginTop:10 }}>{progress}%</div>
          </div>
        )}
        {step===3 && result && (
          <>
            <div style={{ fontSize:40, marginBottom:12 }}>✅</div>
            <div style={{ color:'var(--green)', fontSize:16, fontFamily:'var(--display)', fontWeight:700, marginBottom:6 }}>
              Analysis Complete — redirecting to Dashboard
            </div>
            <div style={{ color:'var(--text-muted)', fontSize:12 }}>{result.filename}</div>
          </>
        )}
      </div>

      {error && (
        <div style={{ background:'rgba(255,60,100,0.08)', border:'1px solid rgba(255,60,100,0.3)', borderRadius:8, padding:'12px 20px', marginBottom:24, color:'var(--red)', fontSize:12 }}>✕ {error}</div>
      )}

      {/* ── Step indicator ──────────────────────────────────────────────── */}
      <div style={{ display:'flex', alignItems:'center', marginBottom:28, background:'var(--card)', border:'1px solid var(--border)', borderRadius:12, padding:'16px 24px' }}>
        {STEP_LABELS.map((label,i) => (
          <div key={label} style={{ display:'flex', alignItems:'center', flex: i<STEP_LABELS.length-1 ? 1 : 0 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <div style={{ width:28, height:28, borderRadius:'50%', background: i<step?'var(--green)':i===step?'var(--cyan)':'transparent', border:`1px solid ${i<=step?'transparent':'rgba(0,245,255,0.2)'}`, display:'flex', alignItems:'center', justifyContent:'center', color:i<=step?'#000':'var(--text-muted)', fontSize:11, fontWeight:700, transition:'all 0.3s' }}>
                {i<step?'✓':i+1}
              </div>
              <span style={{ fontSize:11, letterSpacing:1, color:i===step?'#fff':i<step?'var(--green)':'var(--text-muted)' }}>{label}</span>
            </div>
            {i<STEP_LABELS.length-1 && <div style={{ flex:1, height:1, margin:'0 12px', background:i<step?'var(--green)':'rgba(0,245,255,0.1)', transition:'background 0.3s' }} />}
          </div>
        ))}
      </div>

      {/* ── Results ─────────────────────────────────────────────────────── */}
      {result ? (
        <div style={{ animation:'slideUp 0.5s ease' }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:20 }}>
            {[
              { label:'TOTAL FLOWS', value:result.total.toLocaleString(),                  accent:'var(--cyan)',   icon:'◈' },
              { label:'ATTACKS',     value:result.attacks.toLocaleString(),                 accent:'var(--red)',    icon:'⚠' },
              { label:'BENIGN',      value:result.benign.toLocaleString(),                  accent:'var(--green)',  icon:'◉' },
              { label:'AVG CONF.',   value:`${(result.avg_confidence*100).toFixed(1)}%`,   accent:'var(--purple)', icon:'◫' },
            ].map(c => (
              <div key={c.label} style={{ background:'var(--card)', border:`1px solid ${c.accent}22`, borderRadius:12, padding:'20px 24px', position:'relative', overflow:'hidden', backdropFilter:'blur(10px)' }}>
                <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,transparent,${c.accent},transparent)` }} />
                <div style={{ color:`${c.accent}99`, fontSize:10, letterSpacing:3, marginBottom:10 }}>{c.icon} {c.label}</div>
                <div style={{ color:'#fff', fontSize:30, fontFamily:'var(--display)', fontWeight:700, lineHeight:1 }}>{c.value}</div>
              </div>
            ))}
          </div>

          {/* Attack timeline */}
          {result.timeline && (
            <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:12, padding:24, marginBottom:20 }}>
              <div style={{ color:'var(--cyan)', fontSize:11, letterSpacing:3, marginBottom:6 }}>◈ ATTACK TIMELINE — {result.filename}</div>
              <div style={{ color:'var(--text-muted)', fontSize:10, marginBottom:16 }}>Attack density across capture — hover bars for details</div>
              <div style={{ display:'flex', alignItems:'flex-end', gap:2, height:80 }}>
                {result.timeline.map((seg,i) => {
                  const maxPct = Math.max(...result.timeline.map(s => s.attack_pct))
                  const height = maxPct > 0 ? (seg.attack_pct/maxPct*100) : 0
                  return (
                    <div key={i} style={{ flex:1 }}>
                      <div title={`Segment ${i+1}: ${seg.attacks} attacks / ${seg.total} flows (${seg.attack_pct}%)`} style={{
                        width:'100%', height:`${Math.max(height, seg.attacks>0?4:0)}%`, minHeight:seg.attacks>0?2:0,
                        background: seg.attacks>0 ? `rgba(255,60,100,${0.25+seg.attack_pct/100*0.75})` : 'rgba(0,245,255,0.08)',
                        borderRadius:'2px 2px 0 0',
                        border:`1px solid ${seg.attacks>0?'rgba(255,60,100,0.3)':'rgba(0,245,255,0.1)'}`,
                        transition:'height 0.4s ease',
                      }} />
                    </div>
                  )
                })}
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', marginTop:6 }}>
                <span style={{ color:'var(--text-muted)', fontSize:9 }}>START OF CAPTURE</span>
                <span style={{ color:'var(--text-muted)', fontSize:9 }}>END OF CAPTURE</span>
              </div>
            </div>
          )}

          {/* Breakdown + Top attacks */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:20 }}>
            <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:12, padding:24 }}>
              <div style={{ color:'var(--cyan)', fontSize:11, letterSpacing:3, marginBottom:20 }}>◈ TRAFFIC BREAKDOWN</div>
              {[{ label:'BENIGN', val:result.benign, pct:result.benign_pct, color:'var(--cyan)' },{ label:'ATTACK', val:result.attacks, pct:result.attack_pct, color:'var(--red)' }].map(d => (
                <div key={d.label} style={{ marginBottom:18 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                    <span style={{ color:d.color, fontSize:12, fontWeight:700, letterSpacing:2 }}>{d.label}</span>
                    <span style={{ color:'#fff', fontSize:15, fontFamily:'var(--display)', fontWeight:600 }}>{d.pct}%</span>
                  </div>
                  <div style={{ height:6, background:'rgba(255,255,255,0.06)', borderRadius:3, overflow:'hidden', marginBottom:4 }}>
                    <div style={{ height:'100%', width:`${d.pct}%`, background:d.color, borderRadius:3, opacity:0.75 }} />
                  </div>
                  <div style={{ color:'var(--text-muted)', fontSize:11 }}>{d.val.toLocaleString()} flows</div>
                </div>
              ))}
              <div style={{ padding:12, background:'rgba(0,0,0,0.3)', borderRadius:8, border:'1px solid rgba(0,245,255,0.08)' }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                  <span style={{ color:'var(--text-muted)', fontSize:11 }}>Features used</span>
                  <span style={{ color:'#fff', fontSize:11 }}>{result.n_features}</span>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between' }}>
                  <span style={{ color:'var(--text-muted)', fontSize:11 }}>Decision threshold</span>
                  <span style={{ color:'#fff', fontSize:11 }}>0.35</span>
                </div>
              </div>
            </div>

            <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:12, padding:24 }}>
              <div style={{ color:'var(--cyan)', fontSize:11, letterSpacing:3, marginBottom:16 }}>⚠ TOP CONFIDENCE THREATS</div>
              <div style={{ display:'grid', gridTemplateColumns:'60px 1fr 80px', gap:8, paddingBottom:8, borderBottom:'1px solid rgba(0,245,255,0.1)', marginBottom:4 }}>
                {['ROW','CLASS','CONFIDENCE'].map(h => <span key={h} style={{ color:'var(--text-muted)', fontSize:9, letterSpacing:2 }}>{h}</span>)}
              </div>
              <div style={{ overflowY:'auto', maxHeight:200 }}>
                {(result.top_attacks||[]).slice(0,15).map((a,i) => (
                  <div key={i} style={{ display:'grid', gridTemplateColumns:'60px 1fr 80px', gap:8, padding:'6px 0', borderBottom:'1px solid rgba(0,245,255,0.05)', alignItems:'center' }}>
                    <span style={{ color:'var(--text-muted)', fontSize:10 }}>#{a.row}</span>
                    <span style={{ color:'var(--red)', fontSize:11, fontWeight:700 }}>ATTACK</span>
                    <div>
                      <span style={{ color:'#fff', fontSize:11 }}>{(a.probability*100).toFixed(1)}%</span>
                      <div style={{ height:2, marginTop:3, borderRadius:1, overflow:'hidden', background:'rgba(255,255,255,0.06)' }}>
                        <div style={{ height:'100%', width:`${a.probability*100}%`, background:'var(--red)', opacity:0.7 }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sample predictions */}
          <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:12, padding:24 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
              <div>
                <div style={{ color:'var(--cyan)', fontSize:11, letterSpacing:3 }}>◉ SAMPLE PREDICTIONS</div>
                {result.shap_data?.length > 0 && (
                  <div style={{ color:'var(--green)', fontSize:10, marginTop:4 }}>
                    ✓ Click any <span style={{ color:'var(--red)' }}>ATTACK</span> row with a ◈ to see SHAP explanation
                  </div>
                )}
              </div>
              <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                <span style={{ color:'var(--text-muted)', fontSize:10 }}>{result.rows?.length} shown of {result.total.toLocaleString()}</span>
                <button onClick={() => exportCSV(result)} style={{ background:'rgba(0,245,255,0.07)', border:'1px solid rgba(0,245,255,0.3)', borderRadius:6, color:'var(--cyan)', fontSize:10, cursor:'pointer', padding:'4px 12px', fontFamily:'var(--mono)', letterSpacing:1 }}
                  onMouseOver={e => e.currentTarget.style.background='rgba(0,245,255,0.14)'}
                  onMouseOut={e  => e.currentTarget.style.background='rgba(0,245,255,0.07)'}>
                  ↓ EXPORT CSV
                </button>
              </div>
            </div>

            {/* Header */}
            <div style={{ display:'grid', gridTemplateColumns:'70px 1fr 130px 90px 110px', gap:12, paddingBottom:10, borderBottom:'1px solid rgba(0,245,255,0.1)', marginBottom:4 }}>
              {['ROW','CLASSIFICATION','CONFIDENCE','TRUE LABEL','EXPLAIN'].map(h => (
                <span key={h} style={{ color:'var(--text-muted)', fontSize:9, letterSpacing:2 }}>{h}</span>
              ))}
            </div>

            <div style={{ overflowY:'auto', maxHeight:320 }}>
              {(result.rows||[]).map((r, i) => {
                // Find SHAP entry for this row if available
                const shapEntry = result.shap_data?.find(s => s.row === r.row)
                const hasShap   = !!shapEntry && r.is_attack

                return (
                  <div key={i} style={{
                    display:'grid', gridTemplateColumns:'70px 1fr 130px 90px 110px',
                    gap:12, padding:'6px 0', borderBottom:'1px solid rgba(0,245,255,0.04)',
                    alignItems:'center', background:i%2===0?'rgba(0,0,0,0.1)':'transparent',
                  }}>
                    <span style={{ color:'var(--text-muted)', fontSize:10 }}>#{r.row}</span>

                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <div style={{ width:6, height:6, borderRadius:'50%', background:r.is_attack?'var(--red)':'var(--green)', flexShrink:0 }} />
                      <span style={{ color:r.is_attack?'var(--red)':'var(--green)', fontSize:11, fontWeight:700 }}>{r.classification}</span>
                    </div>

                    <div>
                      <span style={{ color:'#fff', fontSize:11 }}>{(r.probability*100).toFixed(2)}%</span>
                      <div style={{ height:2, marginTop:3, borderRadius:1, overflow:'hidden', background:'rgba(255,255,255,0.06)' }}>
                        <div style={{ height:'100%', width:`${r.probability*100}%`, background:r.is_attack?'var(--red)':'var(--cyan)', opacity:0.6 }} />
                      </div>
                    </div>

                    <span style={{
                      fontSize:9, letterSpacing:1, fontFamily:'var(--mono)',
                      color: r.true_label && r.true_label !== 'null'
                        ? (r.true_label.toUpperCase()==='BENIGN'?'var(--cyan)':'var(--amber)')
                        : 'var(--text-muted)',
                      overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
                    }}>
                      {r.true_label && r.true_label !== 'null' ? r.true_label : '—'}
                    </span>

                    {hasShap ? (
                      <button
                        onClick={() => setSelectedShap(shapEntry)}
                        style={{
                          background:'rgba(0,245,255,0.06)', border:'1px solid rgba(0,245,255,0.25)',
                          borderRadius:5, color:'var(--cyan)', fontSize:9, cursor:'pointer',
                          padding:'3px 8px', fontFamily:'var(--mono)', letterSpacing:1,
                        }}
                        onMouseOver={e => e.currentTarget.style.background='rgba(0,245,255,0.14)'}
                        onMouseOut={e  => e.currentTarget.style.background='rgba(0,245,255,0.06)'}
                      >
                        ◈ SHAP
                      </button>
                    ) : (
                      <span style={{ color:'var(--text-muted)', fontSize:9 }}>—</span>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Labels badge */}
            {result.has_labels && (
              <div style={{ marginTop:12, padding:'8px 14px', background:'rgba(0,255,136,0.04)', border:'1px solid rgba(0,255,136,0.15)', borderRadius:6 }}>
                <span style={{ color:'rgba(0,255,136,0.7)', fontSize:10, letterSpacing:1 }}>
                  ✓ Ground-truth labels detected in CSV — True Label column shows actual attack categories
                  {result.has_real_labels ? ' · Radar chart updated with real attack type counts' : ''}
                </span>
              </div>
            )}
          </div>

          <div style={{ marginTop:16, textAlign:'center' }}>
            <button onClick={reset} style={{ background:'none', border:'1px solid rgba(0,245,255,0.25)', borderRadius:8, color:'var(--text-muted)', fontFamily:'var(--mono)', fontSize:11, letterSpacing:2, padding:'8px 24px', cursor:'pointer' }}
              onMouseOver={e => e.currentTarget.style.borderColor='var(--cyan)'}
              onMouseOut={e => e.currentTarget.style.borderColor='rgba(0,245,255,0.25)'}>
              ↑ UPLOAD ANOTHER CAPTURE
            </button>
          </div>

          {/* SHAP explanation modal */}
          {selectedShap && (
            <ShapPanel entry={selectedShap} onClose={() => setSelectedShap(null)} />
          )}
        </div>
      ) : (
        /* ── Idle: supported formats ─────────────────────────────────────── */
        <>
          <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:12, padding:24, marginBottom:16 }}>
            <div style={{ color:'var(--cyan)', fontSize:11, letterSpacing:3, marginBottom:16 }}>◈ SUPPORTED INPUT FORMATS</div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:12 }}>
              {FORMAT_HINTS.map((f,i) => (
                <div key={f.title} style={{ background:'rgba(0,0,0,0.3)', border:`1px solid ${f.color}22`, borderRadius:8, padding:'14px 16px', display:'flex', gap:12, alignItems:'flex-start', animation:`slideUp 0.4s ease ${i*80}ms both` }}>
                  <div style={{ fontSize:22, flexShrink:0 }}>{f.icon}</div>
                  <div>
                    <div style={{ color:f.color, fontSize:12, fontWeight:700, marginBottom:4 }}>{f.title}</div>
                    <div style={{ color:'var(--text-muted)', fontSize:11, lineHeight:1.6 }}>{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:12, padding:24 }}>
            <div style={{ color:'var(--cyan)', fontSize:11, letterSpacing:3, marginBottom:16 }}>◈ HOW SENTINEL ANALYSES YOUR CAPTURE</div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16 }}>
              {[
                { icon:'📥', title:'1. Ingest',    desc:'CSV uploaded, Label column stripped, infinite/NaN values cleaned automatically.' },
                { icon:'⚙️', title:'2. Inference', desc:'Voting Ensemble (RF+LR+ET) runs on every flow row, outputting attack probability.' },
                { icon:'🎯', title:'3. Classify',  desc:'Flows with p ≥ 0.35 flagged as attack. Threshold adjustable in Analytics.' },
                { icon:'📊', title:'4. Report',    desc:'Dashboard, Analytics, and Live Monitor all update instantly with your results.' },
              ].map(s => (
                <div key={s.title} style={{ background:'rgba(0,0,0,0.3)', borderRadius:8, padding:16, border:'1px solid rgba(0,245,255,0.08)' }}>
                  <div style={{ fontSize:24, marginBottom:10 }}>{s.icon}</div>
                  <div style={{ color:'#fff', fontSize:13, fontWeight:700, marginBottom:6 }}>{s.title}</div>
                  <div style={{ color:'var(--text-muted)', fontSize:11, lineHeight:1.6 }}>{s.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  )
}