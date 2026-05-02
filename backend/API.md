# TrueNest AI — Backend API Reference

Base URL: `http://localhost:8000`

---

## How it works

1. Frontend calls `POST /session/complete` with data collected from the voice conversation.
2. Backend saves the session and immediately starts the **theater** in the background:
   - `t=0s` — NoBroker opens in a visible browser (left third of screen)
   - `t=5s` — 99Acres opens (middle third)
   - `t=10s` — MagicBricks opens (right third)
   - All 3 AI agents browse and search simultaneously
   - `t=120s` — hard timeout, all browsers close
3. Frontend polls `GET /theater/status` until `"complete"`.
4. Frontend calls `GET /results` to get property cards ranked by match score.

```
Voice conv ends
      │
      ▼
POST /session/complete
      │
      ├─ t=0s  → NoBroker browser opens   (agent searches)
      ├─ t=5s  → 99Acres browser opens    (agent searches)
      ├─ t=10s → MagicBricks browser opens (agent searches)
      │
      │  [poll GET /theater/status every 3s]
      │
      ├─ agents finish or t=120s timeout
      │
      ▼
GET /theater/status → "complete"
      │
      ▼
GET /results → 6 property cards sorted by match_score
```

---

## Endpoints

### `GET /health`

Liveness check.

**Response**
```json
{ "status": "ok" }
```

---

### `POST /session/complete`

Saves session data and kicks off the 3-browser theater in the background.

**Request body** — all fields are strings, all optional:

```json
{
  "name": "Mursaleen",
  "age": "28",
  "gender": "male",
  "locality": "Electronic City",
  "budget_range": "15000-20000",
  "bhk_type": "2 BHK",
  "furnishing_type": "semi-furnished",
  "occupancy_type": "full apartment",
  "lifestyle_preference": "balanced",
  "nearby_requirements": "office, metro",
  "priorities": "safety, low traffic",
  "workplace_location": "Electronic City Phase 1",
  "max_commute_time": "15 minutes",
  "user_type": "working professional",
  "living_type": "alone",
  "kids": "",
  "primary_priority": "commute",
  "suggested_locality_choice": "",
  "amenities_required": "parking, lift, security",
  "deal_breakers": "noise, no parking"
}
```

**Response**
```json
{ "status": "started" }
```

> The more session fields provided, the better the match scores on `/results`.

---

### `GET /theater/status`

Poll every 3–5 seconds to know when the theater is done.

**Response**
```json
{ "status": "running" }
```

| Value | Meaning |
|---|---|
| `idle` | No session started yet |
| `running` | Browsers are open, agents are working |
| `complete` | All done — safe to call `/results` |

---

### `GET /theater/logs`

Live log lines from all 3 agents. Poll every 1–2 seconds to show activity in the UI.

**Response**
```json
{
  "logs": [
    "[Runner] Theater started — opening 3 browsers",
    "[NoBroker] Starting agent",
    "[NoBroker] Step 1: Navigate to nobroker.in",
    "[99Acres] Starting agent",
    "[99Acres] Step 1: Navigate to 99acres.com",
    "[MagicBricks] Starting agent",
    "[NoBroker] Step 2: Search for 2 BHK in Electronic City",
    "..."
  ]
}
```

Each line is prefixed with `[SiteName]` so the frontend can colour-code by source.

---

### `GET /results`

Returns 6 property cards sorted by match score. Call once `status === "complete"`.

**Response**
```json
{
  "results": [
    {
      "id": 1,
      "title": "2 BHK in Subha Omkara Apartment",
      "society": "Subha Omkara",
      "address": "Balaji Layout Road, Gollahalli, Electronic City Phase 1, Bengaluru 560100",
      "bhk": "2 BHK",
      "area_sqft": 965,
      "floor": "2nd Floor / 4 Floors",
      "total_floors": 4,
      "facing": "East",
      "age_years": 8,
      "rent": 17500,
      "maintenance": 2000,
      "deposit": 52500,
      "furnishing": "semi-furnished",
      "furnishing_details": ["Bed", "Wardrobe", "Modular Kitchen", "Fan", "Geyser"],
      "amenities": ["Parking", "Lift", "Security", "Children Play Area", "CCTV"],
      "available_from": "Immediate",
      "preferred_tenants": "Bachelor/Family",
      "owner": {
        "name": "Ramesh Naidu",
        "phone": "+91 98440 31276",
        "type": "Owner",
        "since": "Listed 3 days ago",
        "verified": true
      },
      "platform": "NoBroker",
      "platform_color": "#2563eb",
      "platform_url": "https://www.nobroker.in/...",
      "image": "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80",
      "tags": ["Semi-Furnished", "Phase 1", "Near Infosys", "Zero Brokerage", "Gated"],
      "locality": "electronic city phase 1",
      "phase": "Phase 1",
      "lifestyle": "balanced",
      "commute_friendly": true,
      "match_score": 93,
      "nearby": {
        "it_companies": ["Infosys (1.2 km)", "Wipro (2.1 km)", "HCL (2.4 km)"],
        "metro": "Electronic City Metro Station (Yellow Line) — 1.8 km",
        "hospital": "Narayana Health City — 3.2 km",
        "supermarket": "More Hypermarket Phase 1 — 0.9 km",
        "school": "Delhi Public School Electronic City — 2.0 km",
        "bus_stop": "Electronic City Toll — 0.6 km"
      },
      "locality_intel": {
        "overall_rating": 3.8,
        "summary": "Mature Phase 1 locality — dense, convenient, noisy near Hosur Road.",
        "pros": ["Walking distance to Infosys and Wipro campuses", "..."],
        "red_flags": ["Hosur Road traffic brutal 8–10 AM and 6–8 PM", "..."],
        "aqi": { "value": 90, "level": "Moderate", "pm25": "30 µg/m³", "pm10": "36 µg/m³" },
        "noise": { "level_db": 72, "category": "High", "note": "Above CPCB residential limit." },
        "traffic": { "peak_delay": "45–60 min on Hosur Road", "off_peak": "5–10 min to Infosys" },
        "water_supply": { "source": "BWSSB + tankers", "frequency": "3 days/week", "flag": "2–3 hr cuts in summer" },
        "safety": { "rating": "Moderate", "police_station": "Electronic City PS — 1.5 km" },
        "internet": "Jio Fiber, ACT, BSNL — 100–300 Mbps",
        "power_backup": "DG backup for common areas only"
      }
    }
  ]
}
```

**`match_score`** — integer 60–97, computed dynamically from session fields:

| Field | Points |
|---|---|
| BHK type matches | +10 |
| Furnishing matches | +8 |
| Rent within budget range | +10 |
| Lifestyle matches | +7 |
| Locality word overlap | +8 |
| Exact phase match (Phase 1 / Phase 2) | +5 |
| Base score | 60 |

Results are sorted by `match_score` descending. Capped at 97 — 100% looks fake.

**All 6 hardcoded properties:**

| id | Title | Rent | Maintenance | Platform | Phase |
|----|-------|------|-------------|----------|-------|
| 1 | Subha Omkara Apartment | ₹17,500 | ₹2,000 | NoBroker | Phase 1 |
| 2 | DS Max Silveroak | ₹15,500 | ₹2,500 | MagicBricks | Phase 2 |
| 3 | Ittina Neela | ₹19,500 | ₹3,000 | 99acres | Phase 1 |
| 4 | Prestige Falcon City | ₹19,000 | ₹3,500 | NoBroker | Phase 1 periphery |
| 5 | Salarpuria Greenage | ₹18,000 | ₹2,800 | 99acres | Hosur Road Corridor |
| 6 | Mantri Lithos | ₹16,500 | ₹2,200 | NoBroker | Phase 2 |

---

### `POST /theater/reset`

Dev-only. Resets all state — use between test runs.

```bash
curl -X POST http://localhost:8000/theater/reset
```

**Response**
```json
{ "status": "reset" }
```

---

## Frontend integration

```js
// 1. After voice conversation ends
await fetch('/session/complete', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(sessionData)
})

// 2. Poll status
const poll = setInterval(async () => {
  const { status } = await fetch('/theater/status').then(r => r.json())
  if (status === 'complete') {
    clearInterval(poll)
    const { results } = await fetch('/results').then(r => r.json())
    // results already sorted by match_score descending
  }
}, 3000)

// 3. Optional — show live logs while waiting
const logPoll = setInterval(async () => {
  const { logs } = await fetch('/theater/logs').then(r => r.json())
  // render logs, colour-code by [NoBroker] / [99Acres] / [MagicBricks] prefix
}, 1500)
```

---

## CORS

Allowed origins: `http://localhost:3000` (frontend), `http://localhost:7860` (Pipecat/Gradio)

---

## Theater window layout

When the theater runs, 3 browser windows open side by side on screen:

```
┌──────────────┬──────────────┬──────────────┐
│   NoBroker   │   99Acres    │  MagicBricks │
│   x=0        │   x=480      │   x=960      │
│   480×900    │   480×900    │   480×900    │
└──────────────┴──────────────┴──────────────┘
```

Default assumes 1440px screen width. Change `SCREEN_WIDTH` in `automations/scripts/theater.py` if needed.

---

## Running locally

```bash
# Install deps
pip install -r requirements.txt
pip install -e ./browser-use-main

# Start server
uvicorn main:app --reload --port 8000

# Trigger a test run
python trigger.py
```
