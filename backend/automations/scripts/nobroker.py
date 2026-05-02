"""
NoBroker Automation — Choreography Script
Opens NoBroker directly on search results (AI "already knows" the platform).
Scrolls listings and hovers cards.
"""

import asyncio
from typing import Any

from playwright.async_api import async_playwright

from automations.utils import get_chrome_profile

# Direct results URL — no search typing needed, AI goes straight here
SEARCH_URL = "https://www.nobroker.in/property/rent/flat/bangalore/Electronic-City?radius=0&city=bangalore&locality=Electronic-City"


async def run_nobroker(session: dict[str, Any]):
    """
    Theater choreography for NoBroker.
    Navigates directly to results (faster than 99acres — already knows platform).
    """
    chrome_profile = get_chrome_profile()
    playwright_instance = await async_playwright().start()
    browser = None
    try:
        browser = await playwright_instance.chromium.launch_persistent_context(
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
        await page.goto(SEARCH_URL, wait_until="domcontentloaded")
        await asyncio.sleep(2)

        # ── STEP 2: Scroll through listings ─────────────────────────────────
        for _ in range(6):
            try:
                await page.evaluate("window.scrollBy(0, 400)")
                await asyncio.sleep(0.4)
            except Exception:
                pass

        await asyncio.sleep(1)

        # ── STEP 3: Hover over first 2 listing cards ─────────────────────────
        try:
            cards = await page.locator(
                ".dnone-xs, .property-card, [class*='card']"
            ).all()
            for card in cards[:2]:
                try:
                    await card.hover()
                    await asyncio.sleep(0.9)
                except Exception:
                    pass
        except Exception:
            pass

        # ── STEP 4: Scroll a bit more ────────────────────────────────────────
        for _ in range(3):
            try:
                await page.evaluate("window.scrollBy(0, 300)")
                await asyncio.sleep(0.4)
            except Exception:
                pass

        await asyncio.sleep(2)

    except Exception as e:
        print(f"[NoBroker] Error: {e}")
    finally:
        if browser:
            await browser.close()
        await playwright_instance.stop()
