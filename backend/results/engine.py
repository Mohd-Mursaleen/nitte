"""
Results Engine
Returns 3 hardcoded property cards.
Match score is computed dynamically based on the session data from Nest.
Even with hardcoded listings, the score changes based on what the user said.
"""

from typing import Any

# ── Hardcoded listings (edit these for demo) ─────────────────────────────────
HARDCODED_LISTINGS = [
    {
        "id": 1,
        "title": "Spacious 2 BHK in Koramangala 5th Block",
        "address": "5th Block, Koramangala, Bangalore",
        "bhk": "2 BHK",
        "floor": "3rd Floor / 6 Floors",
        "rent": 22000,
        "deposit": 66000,
        "furnishing": "semi-furnished",
        "amenities": ["parking", "lift", "security", "gym"],
        "platform": "99acres",
        "platform_color": "#e63946",
        "image": "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600",
        "tags": ["Semi-Furnished", "Lift", "Parking", "Pet Friendly"],
        "locality": "koramangala",
        "lifestyle": "happening",
        "commute_friendly": True,
    },
    {
        "id": 2,
        "title": "Modern 2 BHK near Indiranagar Metro",
        "address": "100 Feet Road, Indiranagar, Bangalore",
        "bhk": "2 BHK",
        "floor": "2nd Floor / 4 Floors",
        "rent": 24000,
        "deposit": 72000,
        "furnishing": "fully-furnished",
        "amenities": ["parking", "lift", "security", "power backup"],
        "platform": "NoBroker",
        "platform_color": "#2563eb",
        "image": "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600",
        "tags": ["Fully Furnished", "Metro Nearby", "Power Backup"],
        "locality": "indiranagar",
        "lifestyle": "happening",
        "commute_friendly": True,
    },
    {
        "id": 3,
        "title": "Quiet 2 BHK in HSR Layout Sector 2",
        "address": "Sector 2, HSR Layout, Bangalore",
        "bhk": "2 BHK",
        "floor": "1st Floor / 3 Floors",
        "rent": 20000,
        "deposit": 60000,
        "furnishing": "semi-furnished",
        "amenities": ["parking", "security", "garden"],
        "platform": "MagicBricks",
        "platform_color": "#16a34a",
        "image": "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=600",
        "tags": ["Semi-Furnished", "Peaceful Area", "Garden", "Parking"],
        "locality": "hsr layout",
        "lifestyle": "peaceful",
        "commute_friendly": True,
    },
]


def compute_match_score(listing: dict, session: dict[str, Any]) -> int:
    """
    Computes a match % by checking how many session fields align with listing.
    Hardcoded listings always score 75-97% — feels live, looks smart.
    """
    score = 60  # base score

    # BHK match
    bhk = session.get("bhk_type", "").lower()
    if bhk and bhk in listing["bhk"].lower():
        score += 10

    # Furnishing match
    furnishing = session.get("furnishing_type", "").lower()
    if furnishing and furnishing in listing["furnishing"].lower():
        score += 8

    # Budget match — check if rent is within stated budget
    budget = session.get("budget_range", "")
    if budget:
        try:
            # Handle formats like "20000-25000" or "25k" or "25,000"
            budget_clean = budget.replace("k", "000").replace(",", "").replace(" ", "")
            if "-" in budget_clean:
                low, high = budget_clean.split("-")
                if int(low) <= listing["rent"] <= int(high):
                    score += 10
            elif int(budget_clean) >= listing["rent"]:
                score += 10
        except Exception:
            pass

    # Lifestyle match
    lifestyle = session.get("lifestyle_preference", "").lower()
    if lifestyle and lifestyle in listing.get("lifestyle", ""):
        score += 7

    # Locality preference
    locality = session.get("locality", session.get("suggested_locality_choice", "")).lower()
    if locality and locality in listing["locality"]:
        score += 5

    return min(score, 97)  # cap at 97% — 100% looks fake


def compute_results(session: dict[str, Any]) -> list[dict]:
    results = []
    for listing in HARDCODED_LISTINGS:
        card = listing.copy()
        card["match_score"] = compute_match_score(listing, session)
        results.append(card)

    # Sort by match score descending
    results.sort(key=lambda x: x["match_score"], reverse=True)
    return results
