"""
MagicBricks Automation — Choreography Script
Third platform — scans results quickly, then scrolls back up slowly.
This is the "analyzing results" phase of the theater.
"""

import asyncio
from typing import Any

from playwright.async_api import async_playwright

from automations.utils import get_chrome_profile

SEARCH_URL = (
    "https://www.magicbricks.com/property-for-rent/residential-real-estate"
    "?bedroom=2&proptype=Multistorey-Apartment,Builder-Floor-Apartment"
    "&cityName=Bangalore&localityName=Electronic-City"
)


async def run_magicbricks(session: dict[str, Any]):
    """
    Theater choreography for MagicBricks.
    Fast scan down (AI skimming), then slow scroll back up (reviewing).
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

        # ── STEP 1: Land on results ──────────────────────────────────────────
        await page.goto(SEARCH_URL, wait_until="domcontentloaded")
        await asyncio.sleep(2)

        # ── STEP 2: Quick scroll down — "scanning" ───────────────────────────
        for _ in range(5):
            try:
                await page.evaluate("window.scrollBy(0, 450)")
                await asyncio.sleep(0.35)
            except Exception:
                pass

        await asyncio.sleep(1)

        # ── STEP 3: Slow scroll back up — "reviewing" ────────────────────────
        for _ in range(3):
            try:
                await page.evaluate("window.scrollBy(0, -300)")
                await asyncio.sleep(0.5)
            except Exception:
                pass

        await asyncio.sleep(2)

    except Exception as e:
        print(f"[MagicBricks] Error: {e}")
    finally:
        if browser:
            await browser.close()
        await playwright_instance.stop()
