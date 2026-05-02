"""
NoBroker Automation — Choreography Script
Opens NoBroker, searches faster (second platform, AI "already knows" what to find).
"""

import asyncio
from typing import Any

from playwright.async_api import async_playwright

from automations.utils import get_chrome_profile, slow_type

SITE_URL = "https://www.nobroker.in"
SEARCH_URL = "https://www.nobroker.in/property/rent/flat/bangalore/Koramangala?radius=0&city=bangalore&locality=Koramangala"


async def run_nobroker(session: dict[str, Any]):
    chrome_profile = get_chrome_profile()

    async with async_playwright() as p:
        browser = await p.chromium.launch_persistent_context(
            user_data_dir=chrome_profile,
            headless=False,
            args=[
                "--start-maximized",
                "--disable-blink-features=AutomationControlled",
            ],
            no_viewport=True,
        )

        page = await browser.new_page()

        # ── STEP 1: Navigate directly to search results ──────────────────────
        # Faster than 99acres — AI "already knows" the platform
        await page.goto(SEARCH_URL, wait_until="domcontentloaded")
        await asyncio.sleep(2)

        # ── STEP 2: Scroll through listings ─────────────────────────────────
        for _ in range(6):
            await page.evaluate("window.scrollBy(0, 400)")
            await asyncio.sleep(0.4)

        await asyncio.sleep(1)

        # ── STEP 3: Hover over listings ──────────────────────────────────────
        cards = await page.locator(".dnone-xs, .property-card, [class*='card']").all()
        for card in cards[:2]:
            try:
                await card.hover()
                await asyncio.sleep(0.9)
            except Exception:
                pass

        # ── STEP 4: Scroll more + quick detail peek ──────────────────────────
        for _ in range(3):
            await page.evaluate("window.scrollBy(0, 300)")
            await asyncio.sleep(0.4)

        await asyncio.sleep(2)
        await browser.close()
