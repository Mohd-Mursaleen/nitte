# TrueNest AI — Backend API Reference

Base URL: `http://localhost:8000`

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

Called when the voice conversation ends. Saves session data and starts the 60-second theater timer in the background.

**Request body** — all fields are strings, all optional (send what you have):
```json
{
  "name": "Mursaleen",
  "age": "28",
  "gender": "male",
  "has_locality": "yes",
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

> After this call, the backend status moves from `idle` → `running`. After 60 seconds it moves to `complete`.

---

### `GET /theater/status`

Poll this every 3–5 seconds to know when the search is done.

**Response**
```json
{ "status": "running" }
```

`status` is one of: `idle` | `running` | `complete`

**Typical flow:**
```
POST /session/complete  →  status = "running"
... 60 seconds ...
GET  /theater/status    →  status = "complete"
GET  /results           →  property cards
```

---

### `GET /theater/logs`

Live log lines from the backend. Poll alongside `/theater/status` to show activity in the UI.

**Response**
```json
{
  "logs": [
    "[AutomationRunner] Theater started. Waiting 60 seconds...",
    "[AutomationRunner] Theater complete."
  ]
}
```

---

### `GET /results`

Returns 6 hardcoded property cards sorted by match score. Call this once `status === "complete"`.

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
    // ... 5 more cards
  ]
}
```

**`match_score`** — integer 60–97. Computed from session fields (BHK, budget, furnishing, locality, lifestyle). Higher = better match. Sorted descending.

**All 6 properties:**

| id | Title | Rent | Platform | Phase |
|----|-------|------|----------|-------|
| 1 | Subha Omkara Apartment | ₹17,500 | NoBroker | Phase 1 |
| 2 | DS Max Silveroak | ₹15,500 | MagicBricks | Phase 2 |
| 3 | Ittina Neela | ₹19,500 | 99acres | Phase 1 |
| 4 | Prestige Falcon City | ₹19,000 | NoBroker | Phase 1 periphery |
| 5 | Salarpuria Greenage | ₹18,000 | 99acres | Hosur Road Corridor |
| 6 | Mantri Lithos | ₹16,500 | NoBroker | Phase 2 |

---

### `POST /theater/reset`

Dev-only. Resets all state — use between test runs.

**Response**
```json
{ "status": "reset" }
```

---

## Frontend Integration Pattern

```js
// 1. Start session (call after voice conversation ends)
await fetch('/session/complete', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(sessionData)
})

// 2. Poll status every 3 seconds
const interval = setInterval(async () => {
  const { status } = await fetch('/theater/status').then(r => r.json())
  if (status === 'complete') {
    clearInterval(interval)
    // 3. Fetch results
    const { results } = await fetch('/results').then(r => r.json())
    // render results sorted by match_score (already sorted)
  }
}, 3000)
```

---

## CORS

Allowed origins: `http://localhost:3000`, `http://localhost:7860`
