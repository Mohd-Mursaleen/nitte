"""
TrueNest AI — Manual theater test.
Run from backend/ with the FastAPI server already running on port 8000:
  python test_theater.py
"""

import json
import time

import requests

BASE_URL = "http://localhost:8000"

SESSION_PAYLOAD = {
    "name": "Mursaleen",
    "age": "23",
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
    "deal_breakers": "noise, no parking",
}

POLL_INTERVAL_SECONDS = 2
TIMEOUT_SECONDS = 120


def main():
    print("🎬 Starting TrueNest AI theater test...")

    # ── Trigger session + automations ────────────────────────────────────────
    resp = requests.post(f"{BASE_URL}/session/complete", json=SESSION_PAYLOAD)
    resp.raise_for_status()
    print("✅ Session saved. Automations triggered. Watching status...")

    # ── Poll until complete ───────────────────────────────────────────────────
    elapsed = 0
    while elapsed < TIMEOUT_SECONDS:
        status_resp = requests.get(f"{BASE_URL}/theater/status")
        status_resp.raise_for_status()
        status = status_resp.json().get("status", "unknown")

        if status == "complete":
            print(f"✅ Status: {status}")
            break
        else:
            print(f"⏳ Status: {status}...")
            time.sleep(POLL_INTERVAL_SECONDS)
            elapsed += POLL_INTERVAL_SECONDS
    else:
        print(f"⚠️  Timed out after {TIMEOUT_SECONDS}s — status never reached complete.")
        return

    # ── Fetch and display results ─────────────────────────────────────────────
    results_resp = requests.get(f"{BASE_URL}/results")
    results_resp.raise_for_status()
    data = results_resp.json()

    print("\n🏠 Results:")
    print(json.dumps(data, indent=2))

    print("\nQuick summary:")
    for card in data.get("results", []):
        print(f"  [{card['match_score']}%] {card['title']}")

    print("\n🎉 Theater test complete.")


if __name__ == "__main__":
    main()
