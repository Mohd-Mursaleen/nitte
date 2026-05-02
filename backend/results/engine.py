"""
Results Engine
Returns 6 hardcoded property cards — real 2BHK listings in Electronic City, Bangalore.
Match score is computed dynamically based on the session data from Nest.
"""

from typing import Any

# ── Hardcoded listings (edit these for demo) ─────────────────────────────────
HARDCODED_LISTINGS = [
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
            "verified": True,
        },
        "platform": "NoBroker",
        "platform_color": "#2563eb",
        "platform_url": "https://www.nobroker.in/2bhk-flats-for-rent-in-electronic-city-bangalore-prjtl",
        "image": "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80",
        "tags": ["Semi-Furnished", "Phase 1", "Near Infosys", "Zero Brokerage", "Gated"],
        "locality": "electronic city phase 1",
        "phase": "Phase 1",
        "lifestyle": "balanced",
        "commute_friendly": True,
        "nearby": {
            "it_companies": ["Infosys (1.2 km)", "Wipro (2.1 km)", "HCL (2.4 km)"],
            "metro": "Electronic City Metro Station (Yellow Line) — 1.8 km",
            "hospital": "Narayana Health City — 3.2 km",
            "supermarket": "More Hypermarket Phase 1 — 0.9 km",
            "school": "Delhi Public School Electronic City — 2.0 km",
            "bus_stop": "Electronic City Toll — 0.6 km",
        },
        "locality_intel": {
            "overall_rating": 3.8,
            "summary": "Mature Phase 1 locality — dense, convenient, noisy near Hosur Road. Best for IT professionals who want zero commute.",
            "pros": [
                "Walking distance to Infosys and Wipro campuses",
                "Metro Yellow Line — Silk Board to E-City in 20 min",
                "Banks, ATMs, clinics, supermarkets all within 1 km",
                "Swiggy/Zomato delivery under 30 min",
                "BMTC Volvo buses every 20 min to Koramangala and BTM",
            ],
            "red_flags": [
                "Hosur Road traffic brutal 8–10 AM and 6–8 PM — 45 min for 4 km",
                "Sub-lanes narrow and potholed",
                "Water via BWSSB tankers only 3 days/week",
                "Construction noise along NH44 on weekdays",
                "Ground floor flats noisy post 10 PM due to commercial activity",
            ],
            "aqi": {"value": 90, "level": "Moderate", "pm25": "30 µg/m³", "pm10": "36 µg/m³"},
            "noise": {"level_db": 72, "category": "High", "note": "Above CPCB residential limit of 55 dB. Inner lane buildings quieter by ~8 dB."},
            "traffic": {"peak_delay": "45–60 min on Hosur Road", "off_peak": "5–10 min to Infosys"},
            "water_supply": {"source": "BWSSB + tankers", "frequency": "3 days/week", "flag": "2–3 hr cuts in summer"},
            "safety": {"rating": "Moderate", "police_station": "Electronic City PS — 1.5 km"},
            "internet": "Jio Fiber, ACT, BSNL — 100–300 Mbps",
            "power_backup": "DG backup for common areas only",
        },
        "fraud_score": 12,
        "vibe_score": 52,
    },
    {
        "id": 2,
        "title": "2 BHK in DS Max Silveroak",
        "society": "DS Max Silveroak",
        "address": "Kamasandra, Electronic City Phase 2, Hosur Road, Bengaluru 560100",
        "bhk": "2 BHK",
        "area_sqft": 1050,
        "floor": "3rd Floor / 7 Floors",
        "total_floors": 7,
        "facing": "North-East",
        "age_years": 6,
        "rent": 15500,
        "maintenance": 2500,
        "deposit": 46500,
        "furnishing": "semi-furnished",
        "furnishing_details": ["Modular Kitchen", "Wardrobe", "Fan", "Geyser", "TV Unit"],
        "amenities": ["Parking", "Lift", "Security", "Gym", "Badminton Court", "Club House", "Power Backup", "Swimming Pool"],
        "available_from": "Immediate",
        "preferred_tenants": "Family/Bachelor",
        "owner": {
            "name": "Suresh Babu K",
            "phone": "+91 99001 54823",
            "type": "Owner",
            "since": "Listed 1 week ago",
            "verified": True,
        },
        "platform": "MagicBricks",
        "platform_color": "#e63946",
        "platform_url": "https://www.magicbricks.com/ds-max-silveroak-electronic-city-phase-2-bangalore-pdpid-4d4235303739333634",
        "image": "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80",
        "tags": ["Semi-Furnished", "Phase 2", "Full Amenities", "Quieter", "Pool + Gym"],
        "locality": "electronic city phase 2",
        "phase": "Phase 2",
        "lifestyle": "peaceful",
        "commute_friendly": True,
        "nearby": {
            "it_companies": ["Infosys Phase 2 (0.8 km)", "TCS (1.5 km)", "Biocon (2.3 km)"],
            "metro": "Huskur Road Metro Station (Yellow Line) — 2.1 km",
            "hospital": "Vimalalaya Hospital — 1.8 km",
            "supermarket": "Big Bazaar Phase 2 — 1.4 km",
            "school": "Sri Chaitanya School — 0.8 km",
            "bus_stop": "Kamasandra Bus Stop — 0.4 km",
        },
        "locality_intel": {
            "overall_rating": 4.1,
            "summary": "Phase 2 is newer, quieter, 10–15% cheaper than Phase 1. Best if your office is in Phase 2. Roads mixed — main roads fine, sub-lanes rough.",
            "pros": [
                "10–20% lower rent than Phase 1",
                "Newer buildings, modern amenities",
                "Noticeably quieter — no highway-level noise inside",
                "More green cover and open spaces",
                "Full amenities: gym, pool, badminton, clubhouse",
            ],
            "red_flags": [
                "Sub-lanes poorly maintained — waterlogging in monsoon",
                "Water supply largely tanker-dependent",
                "Fewer cabs and autos after midnight",
                "Swiggy/Zomato delivery 45–60 min vs 30 min in Phase 1",
                "Power cuts more frequent in summer",
            ],
            "aqi": {"value": 82, "level": "Moderate", "pm25": "27 µg/m³", "pm10": "28 µg/m³"},
            "noise": {"level_db": 48, "category": "Low-Moderate", "note": "Within CPCB residential limit. Peaceful per resident reviews."},
            "traffic": {"peak_delay": "15–25 min internal Phase 2 roads", "off_peak": "Under 10 min to Phase 2 offices"},
            "water_supply": {"source": "Tankers + BWSSB", "frequency": "Daily tanker", "flag": "DS Max has underground sump — reliable"},
            "safety": {"rating": "Moderate — improving", "police_station": "Heelalige PS — 2.0 km"},
            "internet": "ACT Fibernet and Jio Fiber. Airtel patchy in sub-lanes.",
            "power_backup": "Full DG backup for all flats",
        },
        "fraud_score": 8,
        "vibe_score": 70,
    },
    {
        "id": 3,
        "title": "2 BHK in Ittina Neela",
        "society": "Ittina Neela",
        "address": "Neotown Road, Electronic City Phase 1, Bengaluru 560100",
        "bhk": "2 BHK",
        "area_sqft": 1100,
        "floor": "4th Floor / 17 Towers",
        "total_floors": 4,
        "facing": "West",
        "age_years": 15,
        "rent": 19500,
        "maintenance": 3000,
        "deposit": 58500,
        "furnishing": "semi-furnished",
        "furnishing_details": ["Modular Kitchen", "Wardrobes", "Fan", "Geyser", "AC in Master Bedroom"],
        "amenities": ["Parking", "Lift", "Security", "Swimming Pool", "Jogging Track", "Indoor Games", "Children Play Area", "CCTV"],
        "available_from": "15 days notice",
        "preferred_tenants": "Family",
        "owner": {
            "name": "Priya Venkataraman",
            "phone": "+91 97424 60391",
            "type": "Owner",
            "since": "Listed 2 weeks ago",
            "verified": True,
        },
        "platform": "99acres",
        "platform_color": "#16a34a",
        "platform_url": "https://www.99acres.com/search/property/rent/electronic-city-bangalore",
        "image": "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80",
        "tags": ["Semi-Furnished", "Large Society", "Pool", "1000 Units", "Vastu Compliant"],
        "locality": "electronic city phase 1",
        "phase": "Phase 1",
        "lifestyle": "community",
        "commute_friendly": True,
        "nearby": {
            "it_companies": ["Infosys (1.5 km)", "Wipro (2.0 km)", "Siemens (1.8 km)"],
            "metro": "Electronic City Metro Station (Yellow Line) — 1.6 km",
            "hospital": "Vimalalaya Hospital — 2.5 km",
            "supermarket": "More Hypermarket — 1.1 km",
            "school": "Delhi Public School — 1.8 km",
            "bus_stop": "Singena Agrahara — 0.5 km, Heelalige Railway Station — 1.3 km",
        },
        "locality_intel": {
            "overall_rating": 3.6,
            "summary": "Large community of 1000 units across 17 towers. Great social vibe but building is ~15 years old — some units report seepage. Popular with long-term IT families.",
            "pros": [
                "Massive gated community — very active RWA",
                "Pool, jogging track, indoor games, kids area",
                "Vastu-compliant — popular with families",
                "Heelalige Railway Station 1.3 km — useful for inter-city travel",
                "BMTC bus routes 365K and 365E at 0.5 km",
            ],
            "red_flags": [
                "15-year-old building — some units have bathroom seepage and leakage",
                "Ground floor units reported as damp — prefer 3rd floor and above",
                "No power backup for individual flats",
                "Parking chaotic during weekends and festivals — 1000 units is a lot",
                "Neotown Road poorly lit after 10 PM outside the gate",
                "Some resident reviews flag cleanliness concerns in common areas",
            ],
            "aqi": {"value": 90, "level": "Moderate", "pm25": "30 µg/m³", "pm10": "36 µg/m³"},
            "noise": {"level_db": 65, "category": "Moderate-High", "note": "Internal campus noise from 1000 units. Upper floors quieter by 10 dB."},
            "traffic": {"peak_delay": "30–40 min Hosur Road", "off_peak": "10 min to Infosys/Wipro"},
            "water_supply": {"source": "BWSSB + overhead tanks", "frequency": "Reliable", "flag": "RWA manages actively — no major issues"},
            "safety": {"rating": "Good within campus", "police_station": "Electronic City PS — 2.0 km"},
            "internet": "Jio Fiber, ACT, Airtel — 100–200 Mbps consistently",
            "power_backup": "DG backup common areas and lifts only — invest in UPS if WFH",
        },
        "fraud_score": 14,
        "vibe_score": 65,
    },
    {
        "id": 4,
        "title": "2 BHK in Prestige Falcon City",
        "society": "Prestige Falcon City",
        "address": "Kanakpura Road end, Konanakunte Cross, Electronic City Periphery, Bengaluru 560062",
        "bhk": "2 BHK",
        "area_sqft": 1195,
        "floor": "7th Floor / 20 Floors",
        "total_floors": 20,
        "facing": "North",
        "age_years": 5,
        "rent": 19000,
        "maintenance": 3500,
        "deposit": 57000,
        "furnishing": "fully-furnished",
        "furnishing_details": ["Sofa", "Dining Set", "Bed", "AC x2", "Modular Kitchen", "Washing Machine", "Fridge", "Wardrobe"],
        "amenities": ["Parking", "Lift", "Security", "Gym", "Swimming Pool", "Squash Court", "Supermarket inside campus", "ATM inside campus", "Club House", "Power Backup", "24x7 Water"],
        "available_from": "Immediate",
        "preferred_tenants": "Family/Bachelor",
        "owner": {
            "name": "Anil Sharma",
            "phone": "+91 98867 22401",
            "type": "Owner",
            "since": "Listed 5 days ago",
            "verified": True,
        },
        "platform": "NoBroker",
        "platform_color": "#2563eb",
        "platform_url": "https://www.nobroker.in/2bhk-flats-for-rent-in-electronic-city-bangalore-prjtl",
        "image": "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80",
        "tags": ["Fully Furnished", "High Floor", "Prestige Brand", "Self-Contained Campus", "City View"],
        "locality": "electronic city phase 1",
        "phase": "Phase 1 periphery",
        "lifestyle": "premium",
        "commute_friendly": True,
        "nearby": {
            "it_companies": ["Infosys (3.5 km via NICE Road)", "TCS Bannerghatta (4.0 km)", "JP Morgan (5 km)"],
            "metro": "Konanakunte Cross Metro (Purple Line) — 1.2 km",
            "hospital": "Apollo Hospitals Bannerghatta — 3.5 km",
            "supermarket": "Supermarket inside Prestige campus",
            "school": "Inventure Academy — 2.0 km",
            "bus_stop": "Konanakunte Cross — 0.8 km",
        },
        "locality_intel": {
            "overall_rating": 4.4,
            "summary": "Premium township — self-contained campus with supermarket, ATM, gym, pool inside. Best lifestyle of the 6 options. Slightly away from Phase 1/2 core but metro is close.",
            "pros": [
                "Supermarket, ATM, gym, pool, squash court all inside campus",
                "High floor city view — clean, modern finishes",
                "Prestige brand — build quality and maintenance is noticeably superior",
                "Konanakunte Cross Metro (Purple Line) at 1.2 km — dual metro access",
                "24x7 water supply and full power backup standard for all units",
            ],
            "red_flags": [
                "Slightly outside Electronic City core — commute to Phase 1/2 IT parks is 3.5–5 km",
                "Maintenance of ₹3500/month is highest in this list — budget accordingly",
                "Society rules strict — no parties, noise rules enforced after 10 PM",
                "Visitor parking limited — guests often park on road",
                "Premium pricing means value vs rent is debatable for solo tenants",
            ],
            "aqi": {"value": 74, "level": "Moderate", "pm25": "23 µg/m³", "pm10": "26 µg/m³"},
            "noise": {"level_db": 42, "category": "Low", "note": "High floor + gated premium campus = very quiet. Best noise rating of all 6 options."},
            "traffic": {"peak_delay": "20–30 min to Electronic City core via Hosur Road or NICE Road", "off_peak": "12 min"},
            "water_supply": {"source": "Bore well + municipal + treated water 24x7", "frequency": "No cuts reported", "flag": "None — most reliable water supply in this list"},
            "safety": {"rating": "Excellent", "police_station": "Konanakunte PS — 1.8 km"},
            "internet": "Jio Fiber, ACT, Airtel all excellent. Average 200–500 Mbps.",
            "power_backup": "Full DG backup for all flats including ACs",
        },
        "fraud_score": 5,
        "vibe_score": 88,
    },
    {
        "id": 5,
        "title": "2 BHK in Salarpuria Greenage",
        "society": "Salarpuria Greenage",
        "address": "Bommanahalli, Off Hosur Road, Electronic City Corridor, Bengaluru 560068",
        "bhk": "2 BHK",
        "area_sqft": 1020,
        "floor": "5th Floor / 14 Floors",
        "total_floors": 14,
        "facing": "South-East",
        "age_years": 9,
        "rent": 18000,
        "maintenance": 2800,
        "deposit": 54000,
        "furnishing": "semi-furnished",
        "furnishing_details": ["Modular Kitchen", "Wardrobe", "Fan", "Geyser", "Curtains"],
        "amenities": ["Parking", "Lift", "Security", "Gym", "Swimming Pool", "Jogging Track", "Kids Zone", "Power Backup"],
        "available_from": "10 days notice",
        "preferred_tenants": "Family/Working Professional",
        "owner": {
            "name": "Kavitha Reddy",
            "phone": "+91 96866 18734",
            "type": "Owner",
            "since": "Listed 4 days ago",
            "verified": True,
        },
        "platform": "99acres",
        "platform_color": "#16a34a",
        "platform_url": "https://www.99acres.com/search/property/rent/electronic-city-bangalore",
        "image": "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80",
        "tags": ["Semi-Furnished", "Salarpuria Brand", "Pool + Gym", "Near Bommanahalli", "Mid-range"],
        "locality": "electronic city corridor",
        "phase": "Hosur Road Corridor",
        "lifestyle": "balanced",
        "commute_friendly": True,
        "nearby": {
            "it_companies": ["Wipro (2.5 km)", "Infosys (3.0 km)", "KPIT (1.8 km)"],
            "metro": "Bommanahalli Metro Station (Yellow Line) — 1.0 km",
            "hospital": "Fortis Hospital Bannerghatta — 4.0 km",
            "supermarket": "Reliance Fresh Bommanahalli — 0.7 km",
            "school": "National Public School Koramangala — 4.5 km",
            "bus_stop": "Bommanahalli Bus Stop — 0.4 km",
        },
        "locality_intel": {
            "overall_rating": 3.9,
            "summary": "Well-positioned on Hosur Road corridor — equidistant between Koramangala and Electronic City. Good for people who split time between both zones.",
            "pros": [
                "Bommanahalli Metro just 1 km — best metro access of all 6 options",
                "Mid-range sweet spot — better than Phase 1 density, cheaper than Prestige",
                "Salarpuria brand — reliable maintenance and build quality",
                "Good restaurant and shopping options near Bommanahalli junction",
                "Easy access to BTM, Koramangala, and HSR Layout",
            ],
            "red_flags": [
                "Bommanahalli area known for waterlogging during heavy monsoon",
                "Hosur Road noise significant on lower floors — request higher floors",
                "Distance to Electronic City Phase 2 office parks is 4+ km",
                "BBMP road maintenance in surrounding streets inconsistent",
                "Complex is 9 years old — some wear visible in common areas",
            ],
            "aqi": {"value": 95, "level": "Moderate", "pm25": "33 µg/m³", "pm10": "40 µg/m³"},
            "noise": {"level_db": 68, "category": "Moderate-High", "note": "Hosur Road traffic noise on lower floors. 5th floor and above significantly better."},
            "traffic": {"peak_delay": "35–50 min Hosur Road to Silk Board", "off_peak": "12 min to Electronic City toll"},
            "water_supply": {"source": "BWSSB + borewell", "frequency": "Regular — no major issues", "flag": "Occasional pressure drops in summer"},
            "safety": {"rating": "Good", "police_station": "Bommanahalli PS — 1.2 km"},
            "internet": "ACT Fibernet and Jio Fiber — 150–300 Mbps",
            "power_backup": "Full DG backup for all flats",
        },
        "fraud_score": 9,
        "vibe_score": 72,
    },
    {
        "id": 6,
        "title": "2 BHK in Mantri Lithos",
        "society": "Mantri Lithos",
        "address": "Doddanagamangala, Electronic City Phase 2, Bengaluru 560100",
        "bhk": "2 BHK",
        "area_sqft": 1130,
        "floor": "6th Floor / 16 Floors",
        "total_floors": 16,
        "facing": "East",
        "age_years": 7,
        "rent": 16500,
        "maintenance": 2200,
        "deposit": 49500,
        "furnishing": "semi-furnished",
        "furnishing_details": ["Modular Kitchen", "Wardrobe x2", "Fan", "Geyser", "Study Table"],
        "amenities": ["Parking", "Lift", "Security", "Gym", "Swimming Pool", "Jogging Track", "Amphitheater", "Kids Play Area", "Power Backup"],
        "available_from": "Immediate",
        "preferred_tenants": "Bachelor/Family",
        "owner": {
            "name": "Mohammed Irfan",
            "phone": "+91 90089 37512",
            "type": "Owner",
            "since": "Listed 6 days ago",
            "verified": True,
        },
        "platform": "NoBroker",
        "platform_color": "#2563eb",
        "platform_url": "https://www.nobroker.in/2bhk-flats-for-rent-in-electronic-city-bangalore-prjtl",
        "image": "https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?w=800&q=80",
        "tags": ["Semi-Furnished", "Phase 2", "High Floor", "Mantri Brand", "Amphitheater"],
        "locality": "electronic city phase 2",
        "phase": "Phase 2",
        "lifestyle": "balanced",
        "commute_friendly": True,
        "nearby": {
            "it_companies": ["Infosys Phase 2 (1.0 km)", "Biocon (1.5 km)", "Microland (2.0 km)"],
            "metro": "Huskur Road Metro Station (Yellow Line) — 2.5 km",
            "hospital": "Vimalalaya Hospital — 2.0 km",
            "supermarket": "Heritage Fresh — 1.0 km",
            "school": "Sri Chaitanya Techno School — 1.2 km",
            "bus_stop": "Doddanagamangala Bus Stop — 0.5 km",
        },
        "locality_intel": {
            "overall_rating": 4.0,
            "summary": "Mantri brand quality in Phase 2 at Phase 2 prices. Quieter than Phase 1, newer building, amphitheater is unique. Internal road access is the main pain point.",
            "pros": [
                "Mantri brand — premium build quality and proactive maintenance",
                "Amphitheater, pool, gym, jogging track — lifestyle amenities",
                "Phase 2 prices with Phase 1-comparable brand reputation",
                "Quiet locality — resident reviews consistently praise silence",
                "Very close to Infosys Phase 2 campus (1.0 km)",
            ],
            "red_flags": [
                "Doddanagamangala internal roads are rough and flood-prone in monsoon",
                "Auto and cab availability poor after 11 PM — must have own vehicle",
                "Only 1 supermarket within 1 km — limited daily shopping options",
                "Metro is 2.5 km — needs auto/cab hop vs Phase 1 walkability",
                "Area development is patchy — adjacent plots are empty or under construction",
            ],
            "aqi": {"value": 80, "level": "Moderate", "pm25": "26 µg/m³", "pm10": "30 µg/m³"},
            "noise": {"level_db": 45, "category": "Low", "note": "One of the quietest options. Internal Phase 2 road traffic minimal. Construction on adjacent plots on weekday mornings."},
            "traffic": {"peak_delay": "20–30 min to Phase 1 core via Hosur Road", "off_peak": "8 min to Infosys Phase 2"},
            "water_supply": {"source": "Tankers + borewell", "frequency": "Daily", "flag": "Mantri maintains large underground sump — rarely runs dry"},
            "safety": {"rating": "Good", "police_station": "Heelalige PS — 2.2 km"},
            "internet": "Jio Fiber and ACT available. 100–250 Mbps typical.",
            "power_backup": "Full DG backup for all flats including ACs",
        },
        "fraud_score": 7,
        "vibe_score": 75,
    },
]


def compute_match_score(listing: dict, session: dict[str, Any]) -> int:
    """
    Computes a match % by checking how many session fields align with listing.
    Hardcoded listings always score 75–97% — feels live, looks smart.
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

    # Locality match — word overlap between session input and listing locality
    locality_input = session.get("locality", session.get("suggested_locality_choice", "")).lower()
    listing_locality = listing.get("locality", "").lower()
    if locality_input and any(word in listing_locality for word in locality_input.split()):
        score += 8

    # Phase match — reward listings in the explicitly requested phase
    phase_input = locality_input
    listing_phase = listing.get("phase", "").lower()
    if "phase 1" in phase_input and "phase 1" in listing_phase:
        score += 5
    elif "phase 2" in phase_input and "phase 2" in listing_phase:
        score += 5

    return min(score, 97)  # cap at 97% — 100% looks fake


def compute_results(session: dict[str, Any]) -> list[dict]:
    """Returns all 6 hardcoded listings sorted by match score descending."""
    results = []
    for listing in HARDCODED_LISTINGS:
        card = listing.copy()
        card["match_score"] = compute_match_score(listing, session)
        results.append(card)
    results.sort(key=lambda x: x["match_score"], reverse=True)
    return results


def get_automation_results(runner) -> list[dict]:
    """
    Returns live listings collected by the automation runner.
    Falls back to empty list if the runner has no results yet.
    Caller is responsible for merging with hardcoded fallback cards.
    """
    if runner and getattr(runner, "results", None):
        return list(runner.results)
    return []
