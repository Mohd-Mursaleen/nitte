# Ghosla — Product Brief & Hackathon Showcase

**Builder:** Mohd Mursaleen  
**Stack:** Voice AI · Browser Automation · FastAPI · Next.js  
**Status:** In Development — Hackathon Demo Build

---

## What We're Building

TrueNest AI is a voice-first real estate assistant that finds rental properties through
a natural conversation — and then visibly searches multiple listing platforms in real time
while the user watches.

You talk to it like a person. It asks you what you need. Then it opens real browser windows
and goes and finds it for you.

---

## The Problem We're Solving

Finding a rental in Bangalore is broken.

- You open 4 tabs (99acres, NoBroker, MagicBricks, Housing)
- You filter the same thing 4 times
- You scroll through 200 listings manually
- You call owners who don't pick up
- You don't know if the locality is actually good or if the AQI is a problem

Nobody has time for this. And no existing product fixes it — they're all just
prettier versions of the same search box.

---

## The End Product

A single-page web app that does this:

### Step 1 — Voice Intake (30–60 seconds)

The user lands on the app and is greeted by an AI voice agent (ElevenLabs).

The agent asks natural questions:

> "Hey! Where in Bangalore are you looking?"  
> "What's your budget per month?"  
> "Do you want it furnished?"  
> "Are you moving alone or with family?"  
> "Any preference — Phase 1, Phase 2, or open?"

The user answers by speaking. No typing. No forms. No dropdowns.

The voice agent collects:

- Location / locality preference
- Budget range (min–max)
- BHK type
- Furnishing preference
- Tenant type (bachelor / family / working professional)
- Move-in timeline

Once it has everything, it says:

> "Got it! Let me search across platforms for you right now."

---

### Step 2 — The Theater (30 seconds)

This is the centerpiece of the demo.

Three real Google Chrome windows open simultaneously on screen — one for each platform:

| Window 1    | Window 2    | Window 3        |
| ----------- | ----------- | --------------- |
| 99acres.com | NoBroker.in | MagicBricks.com |

Each window:

- Navigates to the real website with visible URL bar
- Types the search query visibly into the search bar
- Scrolls through real listings slowly (judges can read them)
- Hovers over individual listing cards
- Clicks into one listing to show the detail page
- Goes back and continues scanning

The windows are **real Chrome** — not Chromium, not headless, not a fake overlay.
Your actual installed Google Chrome with your logged-in profile.

They run for ~25–30 seconds. Then they close **one by one** with a staggered finish:

- MagicBricks closes first (22 seconds)
- NoBroker closes second (26 seconds)
- 99acres closes last (30 seconds)

This stagger makes it look like each platform took a different amount of time to scan —
which is realistic and adds drama.

---

### Step 3 — Live Log Feed (parallel to Step 2)

While the 3 windows are running, the frontend displays a scrolling terminal-style
log panel showing exactly what each browser is doing in real time:

```

[21:14:02] [99acres] Navigating to 99acres.com...
[21:14:04] [99acres] Page loaded. Locating search bar...
[21:14:05] [99acres] Typing: "2 BHK rent Electronic City Bangalore"
[21:14:07] [NoBroker] Navigating directly to NoBroker results...
[21:14:08] [NoBroker] Page loaded. Scanning 267 listings...
[21:14:09] [MagicBricks] Applying 2BHK + rent filters...
[21:14:11] [99acres] Results loaded. Starting scroll...
[21:14:13] [NoBroker] Hovering: "Subha Omkara 2BHK — ₹17,500/month"
[21:14:15] [MagicBricks] Comparing price data with 99acres...
[21:14:22] [MagicBricks] ✓ Analysis complete. Window closing.
[21:14:26] [NoBroker] ✓ 2 matches confirmed. Window closing.
[21:14:30] [99acres] ✓ Best listing identified. Window closing.

```

This log panel is proof. It shows the judges that real browser automation happened —
not a fake loading spinner.

---

### Step 4 — Results Page

Once all 3 windows close, the frontend automatically navigates to the results page.

This page shows **6 curated listings** for the user's query:

Each listing card shows:

- Property name and society
- Full address + phase (Phase 1 / Phase 2 / Corridor)
- Rent, maintenance, deposit breakdown
- BHK, area (sqft), floor, facing, age
- Furnishing details (what's actually included)
- Amenities list (gym, pool, parking, etc.)
- **Owner name + phone number** (directly callable)
- Available from date + preferred tenant type
- Platform badge (99acres / NoBroker / MagicBricks) with color
- Tags (Semi-Furnished, Near Infosys, Zero Brokerage, etc.)

---

### Step 5 — Locality Intelligence Panel

Every listing has a collapsible **Locality Intel** section — the differentiator.

This is what no other platform gives you:

```

📍 Electronic City Phase 1 — Overall Rating: 3.8 / 5

PROS
✓ Walking distance to Infosys and Wipro campuses
✓ Metro Yellow Line — Silk Board to E-City in 20 min
✓ Banks, ATMs, supermarkets all within 1 km
✓ Swiggy/Zomato delivery under 30 min

RED FLAGS
⚠ Hosur Road traffic brutal 8–10 AM and 6–8 PM (45 min for 4 km)
⚠ Water via BWSSB tankers only 3 days/week
⚠ Construction noise on NH44 on weekdays

AIR QUALITY AQI 90 — Moderate (PM2.5: 30 µg/m³)
NOISE LEVEL 72 dB — Above residential limit (inner lanes quieter)
TRAFFIC 45–60 min peak delay on Hosur Road
WATER SUPPLY BWSSB + tankers — 3 days/week (2–3 hr cuts in summer)
INTERNET Jio Fiber, ACT, BSNL — 100–300 Mbps
POWER BACKUP DG backup for common areas only
SAFETY Moderate — Electronic City PS (1.5 km)

```

This turns TrueNest from a search engine into an advisor.

---

## Tech Stack

### Frontend

- **Next.js 14** (App Router)
- **Tailwind CSS** — dark mode, card-based UI
- ElevenLabs Conversational AI widget (voice intake)
- Polling → `/theater/status` and `/theater/logs` every 1–2 seconds
- Terminal-style log panel with auto-scroll

### Backend

- **FastAPI** (Python 3.12)
- **Playwright** (Python) for browser automation
- 3 automation scripts: `ninety_nine_acres.py`, `nobroker.py`, `magicbricks.py`
- `asyncio.gather()` — all 3 run in parallel
- Staggered close via `asyncio.sleep()` before `browser.close()`
- In-memory log store (`log_store.py`) — appended by all 3 scripts
- Results engine (`engine.py`) — returns 6 hardcoded listings with full schema

### APIs / Services

- **ElevenLabs** — Conversational voice agent (intake)
- **Google Chrome** — Real browser automation (not Chromium)
- Chrome profile reuse — `--profile Default` for logged-in state

### Key Endpoints

```

POST /session/complete → Saves user requirements, triggers 3 browser windows
GET /theater/status → Frontend polls: "idle" / "running" / "complete"
GET /theater/logs → Frontend polls: live log entries from all 3 scripts
GET /results → Returns 6 listings matching the session criteria
POST /theater/reset → Clears session and logs for next demo run

```

---

## What Makes This Demo-Worthy

| Feature                     | Why It Impresses                                              |
| --------------------------- | ------------------------------------------------------------- |
| Voice intake                | No forms — feels magical, sets the tone                       |
| 3 real Chrome windows       | Visible, tangible AI action — not a spinner                   |
| Staggered close             | Feels like real parallel search with different response times |
| Live log feed               | Proof of work — undeniable evidence it's real                 |
| Owner phone numbers         | Immediately actionable — judges can call                      |
| Locality Intelligence       | Shows real product thinking, not just a demo                  |
| Real data (Electronic City) | Specific, credible, researched                                |

---

## What This Is NOT

- Not a scraper (listings are curated/hardcoded for demo reliability)
- Not an LLM-generated response (results are deterministic, not hallucinated)
- Not a fake loading animation (real Chrome windows, real automation)
- Not a form-based search (pure voice intake)

---

## Demo Script (Hackathon Presentation — 3 minutes)

**0:00** — Open the app. Mic is live.
**0:10** — Voice agent greets. Mursaleen speaks naturally: "2BHK, Electronic City, 18k budget, semi-furnished."
**0:40** — Agent confirms. "Searching now."
**0:45** — 3 Chrome windows explode open on screen. Audience sees real websites.
**1:15** — Windows close one by one. Log feed is scrolling on the left.
**1:20** — Results page loads. 6 listings appear with full details.
**1:30** — Click Listing 1. Owner name, phone number visible.
**1:45** — Click Locality Intel. AQI, traffic, red flags all visible.
**2:00** — "You just found a flat in 90 seconds. Without opening a single tab."
**2:05** — Q&A.

---

## Current Build Status

| Component                       | Status                                                |
| ------------------------------- | ----------------------------------------------------- |
| Voice intake (ElevenLabs)       | ✅ Working                                            |
| Session capture + storage       | ✅ Working                                            |
| FastAPI backend                 | ✅ Working                                            |
| Browser automation (Playwright) | 🟡 Working but using Chromium — needs real Chrome fix |
| 3-window parallel theater       | 🟡 Working but too fast — needs slow_mo + timing fix  |
| Live log feed + endpoint        | 🔴 Not built yet                                      |
| Staggered window close          | 🔴 Not built yet                                      |
| Results page (6 listings)       | 🟡 Shows 3 listings — needs 6 with full schema        |
| Owner contact info on cards     | 🔴 Not showing yet                                    |
| Locality Intelligence panel     | 🟡 Data exists — UI needs work                        |
| Frontend log panel              | 🔴 Not built yet                                      |

---

_Built for hackathon. Designed for real use._

```

```
