import { useState, useEffect, useRef, useCallback } from 'react'

import GridBackground from './components/GridBackground'
import Navbar from './components/Navbar'

import Dashboard from './pages/Dashboard'
import LiveMonitor from './pages/LiveMonitor'
import Analytics from './pages/Analytics'
import Dataset from './pages/Dataset'
import Upload from './pages/Upload'


const PAGE_TITLES = {
  Dashboard: 'Security Operations Center',
  'Live Monitor': 'Real-Time Network Monitor',
  Analytics: 'Performance Analytics',
  Dataset: 'Dataset Explorer',
  Upload: 'Upload Network Capture',
}

const PAGE_SUBS = {
  Dashboard: 'Ensemble model active — monitoring network flows',
  'Live Monitor': 'Live sensor feed — packets classified in real time',
  Analytics: 'Model performance and detection statistics',
  Dataset: 'CIC-IDS 2017 training data reference',
  Upload: 'Analyse a custom network flow capture',
}

const ATTACK_TYPES = [
  'DDoS',
  'PortScan',
  'Web Attack',
  'Brute Force',
  'Infiltration',
  'DoS',
  'Heartbleed',
  'Bot'
]


export default function App() {

  const [active, setActive] = useState('Upload')
  const [events, setEvents] = useState([])
  const [liveStats, setLiveStats] = useState(null)
  const [stats, setStats] = useState(null)
  const [wsStatus, setWsStatus] = useState('connecting')
  const [uploadResult, setUploadResult] = useState(null)

  const wsRef = useRef(null)


  useEffect(() => {
    fetch('/api/stats')
      .then(r => r.json())
      .then(setStats)
      .catch(() => {})
  }, [])


  const connectWS = useCallback(() => {

    const ws = new WebSocket(`ws://${window.location.host}/ws/stream`)
    wsRef.current = ws

    ws.onopen = () => setWsStatus('connected')

    ws.onclose = () => {
      setWsStatus('offline')
      setTimeout(connectWS, 3000)
    }

    ws.onerror = () => ws.close()

    ws.onmessage = (e) => {
      try {

        const msg = JSON.parse(e.data)

        if (msg.type === 'stats')
          setLiveStats(msg.data)

        else if (msg.type === 'threat')
          setEvents(prev => [
            { ...msg, id: Date.now() + Math.random() },
            ...prev
          ].slice(0, 100))

      } catch (_) {}

    }

  }, [])


  useEffect(() => {
    connectWS()
    return () => wsRef.current?.close()
  }, [connectWS])


  const handleUploadResult = (result) => {

    setUploadResult(result)

    if (result.top_attacks?.length) {

      const synthetic = result.top_attacks.slice(0, 30).map((a, i) => ({
        id: Date.now() + i,
        type: 'threat',

        timestamp: new Date(Date.now() - i * 3000).toISOString(),

        src_ip: `${45 + (i % 200)}.${(i * 7) % 255}.${(i * 13) % 255}.${(i * 3) % 255}`,

        dst_ip: `192.168.${(i * 5) % 3 + 1}.${(i * 11) % 254 + 1}`,

        attack_type: ATTACK_TYPES[i % ATTACK_TYPES.length],

        severity:
          a.probability > 0.92
            ? 'CRITICAL'
            : a.probability > 0.78
            ? 'HIGH'
            : a.probability > 0.55
            ? 'MEDIUM'
            : 'LOW',

        confidence: a.probability,

        port: [80,443,22,21,8080,3389,53][i % 7],

        protocol: ['TCP','UDP','ICMP'][i % 3],
      }))

      setEvents(prev => [...synthetic, ...prev].slice(0, 100))

    }

    setActive('Dashboard')
  }


  const clearUpload = () => setUploadResult(null)


  const renderPage = () => {

    switch (active) {

      case 'Dashboard':
        return <Dashboard events={events} stats={stats} uploadResult={uploadResult} onClear={clearUpload} wsStatus={wsStatus} onGoUpload={() => setActive('Upload')} />

      case 'Live Monitor':
        return <LiveMonitor events={events} liveStats={liveStats} uploadResult={uploadResult} />

      case 'Analytics':
        return <Analytics stats={stats} uploadResult={uploadResult} />

      case 'Dataset':
        return <Dataset stats={stats} uploadResult={uploadResult} />

      case 'Upload':
        return <Upload onResult={handleUploadResult} lastResult={uploadResult} onClear={clearUpload} />

      default:
        return null
    }

  }


  return (

    <div style={{ minHeight:'100vh' }}>

      <GridBackground />

      <Navbar active={active} setActive={setActive} wsStatus={wsStatus} uploadResult={uploadResult} />

      <main style={{ position:'relative', zIndex:1, paddingTop:88, paddingBottom:48, paddingLeft:32, paddingRight:32, maxWidth:1440, margin:'0 auto' }}>

        <div style={{ marginBottom:28 }}>

          <div style={{ color:'rgba(0,245,255,0.45)', fontSize:10, letterSpacing:4, marginBottom:6 }}>
            {uploadResult
              ? `ANALYSIS MODE · ${uploadResult.filename.toUpperCase()}`
              : wsStatus === 'connected'
                ? `LIVE MONITORING · SENSOR ONLINE · ${active.toUpperCase()}`
                : `SENTINEL IDS · ${active.toUpperCase()}`
            }
          </div>

          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end' }}>

            <h1 style={{ fontSize:26, fontFamily:'var(--display)', fontWeight:700, color:'#fff', margin:0, letterSpacing:2 }}>
              {PAGE_TITLES[active]}
            </h1>

            <span style={{ color:'var(--text-muted)', fontSize:11, fontFamily:'var(--mono)', letterSpacing:1 }}>
              {PAGE_SUBS[active]}
            </span>

          </div>

        </div>

        {renderPage()}

      </main>

    </div>

  )
}