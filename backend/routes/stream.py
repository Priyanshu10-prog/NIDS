# """
# Realistic WebSocket stream — generates structured network events that look
# like real traffic from a deployed IDS sensor.
# """
import asyncio, json, random, math
from datetime import datetime, timedelta
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter(tags=["Stream"])

# ── Realistic network topology ──────────────────────────────────────────────
INTERNAL_SUBNETS = [
    ("192.168.1.", "Web Tier"),
    ("192.168.2.", "App Tier"),
    ("192.168.10.", "DB Tier"),
    ("10.0.0.", "Admin"),
    ("10.10.50.", "DMZ"),
]

EXTERNAL_RANGES = [
    "45.33.", "185.220.", "198.51.", "203.0.", "91.108.",
    "66.240.", "89.248.", "194.165.", "162.142.", "80.82.",
]

KNOWN_SCANNERS = [
    "45.33.32.156", "198.20.70.114", "66.240.236.119",
    "89.248.172.16", "185.220.101.45", "194.165.16.11",
]

ATTACK_SCENARIOS = [
    {
        "type":     "DDoS – UDP Flood",
        "severity": "CRITICAL",
        "ports":    [53, 80, 443],
        "protocol": "UDP",
        "conf_range": (0.91, 0.99),
        "weight":   8,
    },
    {
        "type":     "PortScan – SYN Scan",
        "severity": "MEDIUM",
        "ports":    list(range(20, 1025, 47)),
        "protocol": "TCP",
        "conf_range": (0.72, 0.88),
        "weight":   18,
    },
    {
        "type":     "Web Attack – SQL Injection",
        "severity": "HIGH",
        "ports":    [80, 443, 8080, 8443],
        "protocol": "TCP",
        "conf_range": (0.82, 0.97),
        "weight":   10,
    },
    {
        "type":     "Web Attack – XSS",
        "severity": "HIGH",
        "ports":    [80, 443],
        "protocol": "TCP",
        "conf_range": (0.76, 0.92),
        "weight":   9,
    },
    {
        "type":     "SSH Brute Force",
        "severity": "HIGH",
        "ports":    [22],
        "protocol": "TCP",
        "conf_range": (0.85, 0.98),
        "weight":   12,
    },
    {
        "type":     "FTP Brute Force",
        "severity": "MEDIUM",
        "ports":    [21],
        "protocol": "TCP",
        "conf_range": (0.79, 0.94),
        "weight":   7,
    },
    {
        "type":     "DoS – Slowloris",
        "severity": "HIGH",
        "ports":    [80, 443],
        "protocol": "TCP",
        "conf_range": (0.88, 0.97),
        "weight":   6,
    },
    {
        "type":     "Heartbleed",
        "severity": "CRITICAL",
        "ports":    [443],
        "protocol": "TCP",
        "conf_range": (0.94, 0.99),
        "weight":   2,
    },
    {
        "type":     "Botnet C2 Beacon",
        "severity": "CRITICAL",
        "ports":    [6667, 1080, 8443],
        "protocol": "TCP",
        "conf_range": (0.89, 0.99),
        "weight":   4,
    },
    {
        "type":     "Infiltration – Lateral Move",
        "severity": "CRITICAL",
        "ports":    [445, 135, 3389],
        "protocol": "TCP",
        "conf_range": (0.90, 0.99),
        "weight":   3,
    },
]

WEIGHTS  = [s["weight"] for s in ATTACK_SCENARIOS]
BENIGN_PORTS    = [80, 443, 53, 8080, 8443, 25, 587, 993, 110, 143]
BENIGN_PROTOCOL = ["TCP", "TCP", "TCP", "UDP", "TCP"]


def _internal_ip():
    subnet, _ = random.choice(INTERNAL_SUBNETS)
    return subnet + str(random.randint(2, 254))


def _external_ip():
    if random.random() < 0.08:              # known scanner
        return random.choice(KNOWN_SCANNERS)
    prefix = random.choice(EXTERNAL_RANGES)
    return prefix + str(random.randint(1, 254)) + "." + str(random.randint(1, 254))


def _threat_event():
    scenario = random.choices(ATTACK_SCENARIOS, weights=WEIGHTS)[0]
    conf     = round(random.uniform(*scenario["conf_range"]), 4)
    return {
        "type":        "threat",
        "timestamp":   datetime.utcnow().isoformat(),
        "src_ip":      _external_ip(),
        "dst_ip":      _internal_ip(),
        "attack_type": scenario["type"],
        "severity":    scenario["severity"],
        "confidence":  conf,
        "port":        random.choice(scenario["ports"]),
        "protocol":    scenario["protocol"],
        "bytes_sent":  random.randint(64, 65535),
        "duration_ms": random.randint(1, 8000),
    }


def _stats_event(tick: int):
    # Traffic follows a sinusoidal "business hours" pattern
    hour_factor = 0.6 + 0.4 * abs(math.sin(tick * 0.05))
    pps         = int(random.gauss(2400 * hour_factor, 300))
    attack_rate = random.uniform(0.04, 0.18)
    return {
        "type":      "stats",
        "timestamp": datetime.utcnow().isoformat(),
        "data": {
            "packets_per_sec":   max(200, pps),
            "attacks_last_min":  random.randint(2, int(30 * attack_rate + 5)),
            "benign_pct":        round((1 - attack_rate) * 100, 1),
            "bytes_per_sec":     max(10000, int(pps * random.uniform(400, 1500))),
            "active_connections":random.randint(80, 600),
            "blocked_ips":       random.randint(3, 40),
        },
    }


@router.websocket("/ws/stream")
async def websocket_stream(websocket: WebSocket):
    await websocket.accept()
    tick          = 0
    event_backlog = 0   # burst simulation

    try:
        while True:
            tick += 1

            # Stats every 5 ticks
            if tick % 5 == 0:
                await websocket.send_text(json.dumps(_stats_event(tick)))

            # Occasional burst (simulates an attack wave)
            if random.random() < 0.04:
                event_backlog = random.randint(3, 8)

            n_events = max(1, event_backlog) if event_backlog > 0 else (1 if random.random() < 0.55 else 0)
            event_backlog = max(0, event_backlog - 1)

            for _ in range(n_events):
                await websocket.send_text(json.dumps(_threat_event()))

            await asyncio.sleep(1.0)

    except WebSocketDisconnect:
        pass
    except Exception:
        pass