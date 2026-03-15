// Hardcoded fallback — real approximate values from published CIC-IDS 2017 research
// Only shown when no CSV is uploaded (or when model has no feature_importances_)
const KNOWN_IMPORTANCES = [
  { feature: 'Destination Port',        importance: 0.187, group: 'Basic Flow'    },
  { feature: 'Flow Duration',           importance: 0.142, group: 'Basic Flow'    },
  { feature: 'Bwd Packet Length Max',   importance: 0.098, group: 'Packet Length' },
  { feature: 'Flow Bytes/s',            importance: 0.091, group: 'Flow Rate'     },
  { feature: 'Fwd Packet Length Mean',  importance: 0.084, group: 'Packet Length' },
  { feature: 'Flow IAT Mean',           importance: 0.073, group: 'IAT'           },
  { feature: 'Flow IAT Std',            importance: 0.068, group: 'IAT'           },
  { feature: 'Bwd IAT Total',           importance: 0.056, group: 'IAT'           },
  { feature: 'Init_Win_bytes_forward',  importance: 0.049, group: 'TCP Window'    },
  { feature: 'Total Fwd Packets',       importance: 0.041, group: 'Basic Flow'    },
  { feature: 'Fwd IAT Total',           importance: 0.038, group: 'IAT'           },
  { feature: 'ACK Flag Count',          importance: 0.032, group: 'TCP Flags'     },
  { feature: 'PSH Flag Count',          importance: 0.028, group: 'TCP Flags'     },
  { feature: 'Packet Length Variance',  importance: 0.023, group: 'Packet Length' },
  { feature: 'Average Packet Size',     importance: 0.019, group: 'Header'        },
]

const GROUP_COLORS = {
  'Basic Flow':    'var(--cyan)',
  'Packet Length': 'var(--green)',
  'Flow Rate':     'var(--amber)',
  'IAT':           'var(--purple)',
  'TCP Window':    '#55efc4',
  'TCP Flags':     'var(--red)',
  'Header':        '#a29bfe',
}

// Assign a colour to a feature we haven't seen before
// (only needed for upload data where column names may differ)
const UPLOAD_COLORS = [
  'var(--cyan)', 'var(--green)', 'var(--amber)', 'var(--purple)',
  'var(--red)', '#55efc4', '#a29bfe', '#ff9f43', '#fd79a8', '#00d4ff',
  'var(--cyan)', 'var(--green)', 'var(--amber)', 'var(--purple)', 'var(--red)',
]

export default function FeatureImportance({ uploadResult }) {
  // Decide which dataset to display
  const isLive = uploadResult?.feature_importances?.length > 0

  const features = isLive
    ? uploadResult.feature_importances.map((f, i) => ({
        feature:    f.feature,
        importance: f.importance,
        group:      null,           // real upload — group unknown
        color:      UPLOAD_COLORS[i % UPLOAD_COLORS.length],
      }))
    : KNOWN_IMPORTANCES.map(f => ({
        ...f,
        color: GROUP_COLORS[f.group] || 'var(--cyan)',
      }))

  const maxVal = features[0]?.importance ?? 1

  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <div style={{ color: 'var(--cyan)', fontSize: 11, letterSpacing: 3, marginBottom: 4 }}>
            ◈ TOP FEATURE IMPORTANCES
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: 10 }}>
            {isLive
              ? <>From your model's <span style={{ color: 'var(--green)' }}>actual feature_importances_</span> · computed on <span style={{ color: 'var(--cyan)' }}>{uploadResult.filename}</span></>
              : <>Approximate values from published CIC-IDS 2017 research · <span style={{ color: 'var(--amber)' }}>upload a file to see real values</span></>
            }
          </div>
        </div>

        {/* Live badge vs Demo badge */}
        <div style={{
          padding: '3px 12px', borderRadius: 5, fontSize: 9, fontWeight: 700, letterSpacing: 2,
          background: isLive ? 'rgba(0,255,136,0.1)'  : 'rgba(255,184,0,0.1)',
          border:     isLive ? '1px solid rgba(0,255,136,0.35)' : '1px solid rgba(255,184,0,0.35)',
          color:      isLive ? 'var(--green)' : '#ffb800',
          whiteSpace: 'nowrap',
        }}>
          {isLive ? '✓ LIVE — FROM MODEL' : 'DEMO — APPROXIMATE'}
        </div>
      </div>

      {/* Feature rows */}
      {features.map((f, i) => {
        const pct = (f.importance / maxVal * 100).toFixed(1)
        return (
          <div key={f.feature} style={{ marginBottom: 10, animation: `slideUp 0.4s ease ${i * 40}ms both` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: 'var(--text-muted)', fontSize: 9, fontFamily: 'var(--mono)', width: 16, textAlign: 'right' }}>
                  {i + 1}
                </span>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: f.color, flexShrink: 0 }} />
                <span style={{ color: 'rgba(200,220,255,0.85)', fontSize: 11, fontFamily: 'var(--mono)' }}>
                  {f.feature}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                {f.group && (
                  <span style={{ color: 'var(--text-muted)', fontSize: 9, letterSpacing: 1 }}>{f.group}</span>
                )}
                <span style={{ color: f.color, fontSize: 11, fontWeight: 700, fontFamily: 'var(--mono)', width: 44, textAlign: 'right' }}>
                  {(f.importance * 100).toFixed(1)}%
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 16, flexShrink: 0 }} />
              <div style={{ flex: 1, height: 5, background: 'rgba(255,255,255,0.04)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${pct}%`,
                  background: `linear-gradient(90deg, ${f.color}55, ${f.color})`,
                  borderRadius: 3,
                  boxShadow: `0 0 6px ${f.color}44`,
                  '--target-width': `${pct}%`,
                  animation: `progressFill 1s ${i * 60}ms ease both`,
                }} />
              </div>
            </div>
          </div>
        )
      })}

      {/* Footer */}
      <div style={{ marginTop: 16, padding: '10px 14px', background: 'rgba(0,0,0,0.3)', borderRadius: 8, border: '1px solid rgba(0,245,255,0.08)', display: 'flex', gap: 32, flexWrap: 'wrap' }}>
        {(isLive ? [
          { label: 'Source',        value: 'pipeline.pkl'              },
          { label: 'Top Feature',   value: features[0]?.feature ?? '—' },
          { label: 'Features Used', value: uploadResult.n_features      },
        ] : [
          { label: 'Most Decisive', value: 'Destination Port' },
          { label: 'Top Category',  value: 'IAT Features'     },
          { label: 'Source',        value: 'CIC-IDS 2017'     },
        ]).map(s => (
          <div key={s.label}>
            <div style={{ color: 'var(--text-muted)', fontSize: 9, letterSpacing: 2, marginBottom: 3 }}>{s.label}</div>
            <div style={{ color: '#fff', fontSize: 12, fontFamily: 'var(--display)', fontWeight: 600 }}>{String(s.value)}</div>
          </div>
        ))}
      </div>
    </div>
  )
}