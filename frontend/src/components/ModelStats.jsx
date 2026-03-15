const FALLBACK = [
  { label: 'Accuracy',          value: 96.85, color: 'var(--cyan)'   },
  { label: 'Balanced Accuracy', value: 96.12, color: 'var(--cyan)'   },
  { label: 'Attack Recall',     value: 93.94, color: 'var(--red)'    },
  { label: 'Attack Precision',  value: 96.48, color: 'var(--green)'  },
  { label: 'ROC-AUC',           value: 99.38, color: 'var(--amber)'  },
  { label: 'Macro F1',          value: 96.43, color: 'var(--purple)' },
  { label: 'CV Balanced Acc.',  value: 92.88, color: 'rgba(200,220,255,0.5)' },
]

export default function ModelStats({ metrics }) {
  const data = metrics ? [
    { label: 'Accuracy',          value: +(metrics.accuracy * 100).toFixed(2),            color: 'var(--cyan)'   },
    { label: 'Balanced Accuracy', value: +(metrics.balanced_accuracy * 100).toFixed(2),   color: 'var(--cyan)'   },
    { label: 'Attack Recall',     value: +(metrics.attack_recall * 100).toFixed(2),        color: 'var(--red)'    },
    { label: 'Attack Precision',  value: +(metrics.attack_precision * 100).toFixed(2),     color: 'var(--green)'  },
    { label: 'ROC-AUC',           value: +(metrics.roc_auc * 100).toFixed(2),              color: 'var(--amber)'  },
    { label: 'Macro F1',          value: +(metrics.macro_f1 * 100).toFixed(2),             color: 'var(--purple)' },
    { label: 'CV Balanced Acc.',  value: +(metrics.cv_balanced_accuracy * 100).toFixed(2), color: 'rgba(200,220,255,0.5)' },
  ] : FALLBACK

  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: 24 }}>
      <div style={{ color: 'var(--cyan)', fontSize: 11, letterSpacing: 3, marginBottom: 22 }}>◈ MODEL PERFORMANCE</div>
      {data.map((s, i) => (
        <div key={s.label} style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
            <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>{s.label}</span>
            <span style={{ color: s.color, fontSize: 11, fontWeight: 700 }}>{s.value}%</span>
          </div>
          <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: `${s.value}%`,
              background: `linear-gradient(90deg, ${s.color}66, ${s.color})`,
              borderRadius: 2, boxShadow: `0 0 8px ${s.color}55`,
              '--target-width': `${s.value}%`,
              animation: `progressFill 1.2s ${i * 120}ms ease both`,
            }} />
          </div>
        </div>
      ))}
    </div>
  )
}