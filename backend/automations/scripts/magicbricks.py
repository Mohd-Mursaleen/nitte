"""
MagicBricks Automation — Choreography Script
Third platform — opens a comparison/loading view, then closes.
This is the 'analyzing results' phase of the theater.
"""

import asyncio
from typing import Any

from playwright.async_api import async_playwright

from automations.utils import get_chrome_profile

SEARCH_URL = "https://www.magicbricks.com/property-for-rent/residential-real-estate?bedroom=2&proptype=Multistorey-Apartment,Builder-Floor-Apartment,Penthouse,Studio-Apartment&cityName=Bangalore"


async def run_magicbricks(session: dict[str, Any]):
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

        # ── STEP 1: Land on results ──────────────────────────────────────────
        await page.goto(SEARCH_URL, wait_until="domcontentloaded")
        await asyncio.sleep(2)

        # ── STEP 2: Quick scroll — "scanning" ────────────────────────────────
        for _ in range(5):
            await page.evaluate("window.scrollBy(0, 450)")
            await asyncio.sleep(0.35)

        await asyncio.sleep(1)

        # ── STEP 3: Scroll back up slowly ────────────────────────────────────
        for _ in range(3):
            await page.evaluate("window.scrollBy(0, -300)")
            await asyncio.sleep(0.5)

        await asyncio.sleep(2)
        await browser.close()
