import { useState } from 'react'

const FEATURE_GROUPS = [
  { group: 'Basic Flow Info',    color: 'var(--cyan)',   features: ['Destination Port','Flow Duration','Total Fwd Packets','Total Backward Packets','Total Length of Fwd Packets','Total Length of Bwd Packets'] },
  { group: 'Packet Length',      color: 'var(--green)',  features: ['Fwd Packet Length Max','Fwd Packet Length Min','Fwd Packet Length Mean','Fwd Packet Length Std','Bwd Packet Length Max','Bwd Packet Length Min','Bwd Packet Length Mean','Bwd Packet Length Std','Min Packet Length','Max Packet Length','Packet Length Mean','Packet Length Std','Packet Length Variance'] },
  { group: 'Flow Rate',          color: 'var(--amber)',  features: ['Flow Bytes/s','Flow Packets/s','Fwd Packets/s','Bwd Packets/s','Down/Up Ratio'] },
  { group: 'Inter-Arrival Time', color: 'var(--purple)', features: ['Flow IAT Mean','Flow IAT Std','Flow IAT Max','Flow IAT Min','Fwd IAT Total','Fwd IAT Mean','Fwd IAT Std','Fwd IAT Max','Fwd IAT Min','Bwd IAT Total','Bwd IAT Mean','Bwd IAT Std','Bwd IAT Max','Bwd IAT Min'] },
  { group: 'TCP Flags',          color: 'var(--red)',    features: ['Fwd PSH Flags','Bwd PSH Flags','Fwd URG Flags','Bwd URG Flags','FIN Flag Count','SYN Flag Count','RST Flag Count','PSH Flag Count','ACK Flag Count','URG Flag Count','CWE Flag Count','ECE Flag Count'] },
  { group: 'Header & Segment',   color: '#00d4ff',       features: ['Fwd Header Length','Bwd Header Length','Average Packet Size','Avg Fwd Segment Size','Avg Bwd Segment Size'] },
  { group: 'Bulk Transfer',      color: '#ff9f43',       features: ['Fwd Avg Bytes/Bulk','Fwd Avg Packets/Bulk','Fwd Avg Bulk Rate','Bwd Avg Bytes/Bulk','Bwd Avg Packets/Bulk','Bwd Avg Bulk Rate'] },
  { group: 'Subflow',            color: '#a29bfe',       features: ['Subflow Fwd Packets','Subflow Fwd Bytes','Subflow Bwd Packets','Subflow Bwd Bytes'] },
  { group: 'TCP Window',         color: '#55efc4',       features: ['Init_Win_bytes_forward','Init_Win_bytes_backward','act_data_pkt_fwd','min_seg_size_forward'] },
  { group: 'Active / Idle',      color: '#fd79a8',       features: ['Active Mean','Active Std','Active Max','Active Min','Idle Mean','Idle Std','Idle Max','Idle Min'] },
]

const FILES = [
  { name: 'Monday-WorkingHours',          type: 'Normal Traffic',   records: 529918,  color: 'var(--green)',  labels: ['BENIGN'],                                                                           desc: 'Baseline normal traffic only. No attacks. Used to establish benign patterns.' },
  { name: 'Tuesday-WorkingHours',         type: 'Brute Force',      records: 445909,  color: 'var(--red)',    labels: ['BENIGN','FTP-Patator','SSH-Patator'],                                                desc: 'FTP and SSH brute-force attacks using the Patator tool.' },
  { name: 'Wednesday-WorkingHours',       type: 'DoS / Heartbleed', records: 692703,  color: 'var(--red)',    labels: ['BENIGN','DoS Slowloris','DoS Slowhttptest','DoS Hulk','DoS GoldenEye','Heartbleed'],  desc: 'Multiple DoS attack variants and the Heartbleed OpenSSL exploit.' },
  { name: 'Thursday-Morning-WebAttacks',  type: 'Web Attacks',      records: 170366,  color: 'var(--amber)',  labels: ['BENIGN','Web Attack – Brute Force','Web Attack – XSS','Web Attack – Sql Injection'],  desc: 'Web attacks: brute force, cross-site scripting, SQL injection.' },
  { name: 'Thursday-Afternoon-Infiltr.',  type: 'Infiltration',     records: 288602,  color: 'var(--purple)', labels: ['BENIGN','Infiltration'],                                                             desc: 'Network infiltration — attacker gains access and pivots internally.' },
  { name: 'Friday-Morning',               type: 'Botnet',           records: 191033,  color: 'var(--amber)',  labels: ['BENIGN','Bot'],                                                                      desc: 'Botnet command-and-control traffic mixed with normal web traffic.' },
  { name: 'Friday-Afternoon-PortScan',    type: 'Port Scan',        records: 286467,  color: 'var(--cyan)',   labels: ['BENIGN','PortScan'],                                                                 desc: 'Network reconnaissance using port scanning (nmap and related tools).' },
  { name: 'Friday-Afternoon-DDoS',        type: 'DDoS',             records: 225745,  color: 'var(--red)',    labels: ['BENIGN','DDoS'],                                                                     desc: 'Distributed Denial of Service high-volume flood traffic.' },
]

export default function Dataset({ stats, uploadResult }) {
  const [selected,    setSelected]    = useState(null)
  const [search,      setSearch]      = useState('')
  const [activeGroup, setActiveGroup] = useState('All')

  const info = stats?.dataset

  // Class distribution: use upload data if available, else CIC-IDS 2017 totals
  const benign    = uploadResult ? uploadResult.benign  : (info?.benign_count  ?? 2095057)
  const attack    = uploadResult ? uploadResult.attacks : (info?.attack_count  ?? 425741)
  const total     = benign + attack
  const benignPct = (benign / total * 100).toFixed(1)
  const attackPct = (attack / total * 100).toFixed(1)

  const selectedFile = FILES.find(f => f.name === selected)
  const groups       = ['All', ...FEATURE_GROUPS.map(g => g.group)]

  const filteredFeatures = FEATURE_GROUPS.flatMap(g =>
    (activeGroup === 'All' || activeGroup === g.group)
      ? g.features
          .filter(f => f.toLowerCase().includes(search.toLowerCase()))
          .map(f => ({ feature: f, color: g.color }))
      : []
  )

  return (
    <>
      {/* Top stat cards — same 4-card grid as original */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 18 }}>
        {(uploadResult ? [
          { label: 'TOTAL ROWS',    value: uploadResult.total.toLocaleString(),   accent: 'var(--cyan)'   },
          { label: 'ATTACKS',       value: uploadResult.attacks.toLocaleString(), accent: 'var(--red)'    },
          { label: 'BENIGN',        value: uploadResult.benign.toLocaleString(),  accent: 'var(--green)'  },
          { label: 'FEATURES',      value: uploadResult.n_features,               accent: 'var(--amber)'  },
        ] : [
          { label: 'TOTAL SAMPLES',  value: (info?.total_samples_raw     ?? 2830743).toLocaleString(), accent: 'var(--cyan)'   },
          { label: 'AFTER CLEANING', value: (info?.total_samples_cleaned ?? 2520798).toLocaleString(), accent: 'var(--green)'  },
          { label: 'FEATURES',       value: '78',                                                       accent: 'var(--amber)'  },
          { label: 'CSV FILES',      value: '8',                                                        accent: 'var(--purple)' },
        ]).map((c, i) => (
          <div key={c.label} style={{
            background: 'var(--card)', border: `1px solid ${c.accent}22`,
            borderRadius: 12, padding: '20px 24px', position: 'relative', overflow: 'hidden',
            backdropFilter: 'blur(10px)',
            animation: `slideUp 0.5s ease ${i * 80}ms both`,
          }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,transparent,${c.accent},transparent)` }} />
            <div style={{ color: `${c.accent}99`, fontSize: 10, letterSpacing: 3, marginBottom: 10 }}>{c.label}</div>
            <div style={{ color: '#fff', fontSize: 30, fontFamily: 'var(--display)', fontWeight: 700, lineHeight: 1 }}>{c.value}</div>
          </div>
        ))}
      </div>

      {/* Main two-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 1.5fr' : '2fr 1fr', gap: 16, transition: 'grid-template-columns 0.3s' }}>

        {/* Left — file list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: 24 }}>
            <div style={{ color: 'var(--cyan)', fontSize: 11, letterSpacing: 3, marginBottom: 16 }}>
              ◉ DATASET FILES — CLICK TO INSPECT
            </div>
            {FILES.map((f, i) => {
              const isActive = selected === f.name
              return (
                <div key={f.name} onClick={() => setSelected(isActive ? null : f.name)} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '11px 14px', borderRadius: 8,
                  background: isActive ? `${f.color}12` : 'rgba(0,245,255,0.02)',
                  border: `1px solid ${isActive ? f.color + '55' : 'rgba(0,245,255,0.07)'}`,
                  marginBottom: 7, cursor: 'pointer', transition: 'all 0.18s',
                  animation: `slideUp 0.4s ease ${i * 45}ms both`,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: f.color, opacity: isActive ? 1 : 0.75, boxShadow: isActive ? `0 0 8px ${f.color}` : 'none', transition: 'all 0.2s', flexShrink: 0 }} />
                    <div>
                      <div style={{ color: isActive ? '#fff' : 'var(--text)', fontSize: 11, fontFamily: 'var(--mono)' }}>{f.name}</div>
                      <div style={{ color: f.color, fontSize: 9, letterSpacing: 1, marginTop: 2, opacity: 0.8 }}>{f.type}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: 10 }}>{f.records.toLocaleString()}</div>
                    <div style={{ color: isActive ? 'var(--cyan)' : 'var(--text-muted)', fontSize: 13, transition: 'transform 0.2s', transform: isActive ? 'rotate(90deg)' : 'rotate(0deg)' }}>›</div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Class distribution card */}
          {!selected && (
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: 24 }}>
              <div style={{ color: 'var(--cyan)', fontSize: 11, letterSpacing: 3, marginBottom: 16 }}>
                ◈ CLASS DISTRIBUTION{uploadResult ? ' — CUSTOM FILE' : ''}
              </div>
              {[
                { label: 'BENIGN', val: benign, pct: benignPct, color: 'var(--cyan)' },
                { label: 'ATTACK', val: attack, pct: attackPct, color: 'var(--red)'  },
              ].map(d => (
                <div key={d.label} style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ color: d.color, fontSize: 12, fontWeight: 700, letterSpacing: 2 }}>{d.label}</span>
                    <span style={{ color: '#fff', fontSize: 15, fontFamily: 'var(--display)', fontWeight: 600 }}>{d.pct}%</span>
                  </div>
                  <div style={{ height: 5, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden', marginBottom: 4 }}>
                    <div style={{ height: '100%', width: `${d.pct}%`, background: d.color, borderRadius: 3, opacity: 0.7 }} />
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>{d.val.toLocaleString()} samples</div>
                </div>
              ))}
              {!uploadResult && (
                <div style={{ marginTop: 16, padding: 14, background: 'rgba(0,0,0,0.3)', borderRadius: 8, border: '1px solid rgba(0,245,255,0.08)' }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: 9, letterSpacing: 3, marginBottom: 10 }}>SPLIT STRATEGY</div>
                  {[['Train (80%)', '2,016,638'], ['Test (20%)', '504,160'], ['Split', 'Temporal']].map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>{k}</span>
                      <span style={{ color: '#fff', fontSize: 11 }}>{v}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right — feature inspector (shown when file selected) */}
        {selected && selectedFile && (
          <div style={{ background: 'var(--card)', border: `1px solid ${selectedFile.color}44`, borderRadius: 12, padding: 24, animation: 'slideUp 0.3s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
              <div>
                <div style={{ color: selectedFile.color, fontSize: 9, letterSpacing: 3, marginBottom: 4 }}>◈ {selectedFile.type.toUpperCase()}</div>
                <div style={{ color: '#fff', fontSize: 15, fontFamily: 'var(--display)', fontWeight: 700, marginBottom: 3 }}>{selectedFile.name}</div>
              </div>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: '1px solid rgba(0,245,255,0.2)', borderRadius: 6, color: 'var(--text-muted)', fontSize: 11, cursor: 'pointer', padding: '4px 10px', fontFamily: 'var(--mono)' }}>✕</button>
            </div>

            <div style={{ color: 'var(--text-muted)', fontSize: 11, lineHeight: 1.7, background: 'rgba(0,0,0,0.3)', borderRadius: 8, padding: '10px 14px', border: '1px solid rgba(0,245,255,0.06)', marginBottom: 14 }}>
              {selectedFile.desc}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 14 }}>
              {[
                { label: 'RECORDS',  value: selectedFile.records.toLocaleString(), color: selectedFile.color },
                { label: 'FEATURES', value: '78',                                   color: 'var(--amber)'    },
                { label: 'CLASSES',  value: selectedFile.labels.length,             color: 'var(--purple)'   },
              ].map(s => (
                <div key={s.label} style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 8, padding: '10px 12px', border: `1px solid ${s.color}22` }}>
                  <div style={{ color: `${s.color}88`, fontSize: 9, letterSpacing: 3, marginBottom: 4 }}>{s.label}</div>
                  <div style={{ color: '#fff', fontSize: 16, fontFamily: 'var(--display)', fontWeight: 700 }}>{s.value}</div>
                </div>
              ))}
            </div>

            <div style={{ marginBottom: 14 }}>
              <div style={{ color: 'var(--text-muted)', fontSize: 9, letterSpacing: 3, marginBottom: 8 }}>CLASSES IN THIS FILE</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {selectedFile.labels.map(lbl => (
                  <span key={lbl} style={{
                    padding: '3px 10px', borderRadius: 20, fontSize: 10, fontFamily: 'var(--mono)',
                    background: lbl === 'BENIGN' ? 'rgba(0,245,255,0.1)' : 'rgba(255,60,100,0.1)',
                    border: `1px solid ${lbl === 'BENIGN' ? 'rgba(0,245,255,0.3)' : 'rgba(255,60,100,0.3)'}`,
                    color: lbl === 'BENIGN' ? 'var(--cyan)' : 'var(--red)', letterSpacing: 1,
                  }}>{lbl}</span>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ color: 'var(--text-muted)', fontSize: 9, letterSpacing: 3 }}>78 FEATURES · {filteredFeatures.length} SHOWN</div>
              </div>
              <input
                placeholder="Search features..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(0,245,255,0.15)', borderRadius: 8, padding: '7px 12px', color: 'var(--text)', fontSize: 11, fontFamily: 'var(--mono)', outline: 'none', marginBottom: 8 }}
              />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {groups.map(g => (
                  <button key={g} onClick={() => setActiveGroup(g)} style={{
                    background: activeGroup === g ? 'rgba(0,245,255,0.12)' : 'rgba(0,0,0,0.3)',
                    border: `1px solid ${activeGroup === g ? 'rgba(0,245,255,0.4)' : 'rgba(0,245,255,0.1)'}`,
                    borderRadius: 5, padding: '3px 8px', fontSize: 8, fontFamily: 'var(--mono)', letterSpacing: 1,
                    color: activeGroup === g ? 'var(--cyan)' : 'var(--text-muted)', cursor: 'pointer',
                  }}>{g === 'All' ? 'ALL' : g.slice(0, 14).toUpperCase()}</button>
                ))}
              </div>
            </div>

            <div style={{ overflowY: 'auto', maxHeight: 280, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5 }}>
              {filteredFeatures.map(({ feature, color }, i) => (
                <div key={feature} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '5px 9px', borderRadius: 5, background: 'rgba(0,0,0,0.25)', border: `1px solid ${color}18`, animation: i < 40 ? `slideUp 0.22s ease ${i * 8}ms both` : 'none' }}>
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: color, opacity: 0.85, flexShrink: 0 }} />
                  <span style={{ color: 'var(--text)', fontSize: 10, fontFamily: 'var(--mono)', lineHeight: 1.3 }}>{feature}</span>
                </div>
              ))}
              {filteredFeatures.length === 0 && (
                <div style={{ gridColumn: '1/-1', color: 'var(--text-muted)', fontSize: 11, textAlign: 'center', padding: '20px 0' }}>No features match "{search}"</div>
              )}
            </div>

            <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid rgba(0,245,255,0.08)' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {FEATURE_GROUPS.map(g => (
                  <div key={g.group} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: g.color }} />
                    <span style={{ color: 'var(--text-muted)', fontSize: 9, fontFamily: 'var(--mono)' }}>{g.group}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}