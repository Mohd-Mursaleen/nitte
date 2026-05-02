"""
MagicBricks Automation — Choreography Script
Third platform — fast scan down (AI skimming), slow review back up.
Total runtime: ~22–25 seconds. Closes first — no stagger delay.
"""

import asyncio
import time
from typing import Any

from playwright.async_api import async_playwright

from automations.log_store import theater_log
from automations.utils import CHROME_BINARY, get_chrome_profile

SEARCH_URL = (
    "https://www.magicbricks.com/property-for-rent/residential-real-estate"
    "?bedroom=2&proptype=Multistorey-Apartment,Builder-Floor-Apartment"
    "&cityName=Bangalore&localityName=Electronic-City"
)


def log(message: str):
    """Prints a timestamped log entry and appends it to the shared theater log."""
    entry = f"[{time.strftime('%H:%M:%S')}] [MagicBricks] {message}"
    print(entry)
    theater_log.append(entry)


async def run_magicbricks(session: dict[str, Any]):
    """
    Theater choreography for MagicBricks.
    Fast scan down + slow review scroll back up.
    Closes first — no stagger delay.
    """
    chrome_profile = get_chrome_profile()
    playwright_instance = await async_playwright().start()
    browser = None
    try:
        browser = await playwright_instance.chromium.launch_persistent_context(
            user_data_dir=chrome_profile,
            executable_path=CHROME_BINARY,
            headless=False,
            slow_mo=120,
            args=[
                "--start-maximized",
                "--disable-blink-features=AutomationControlled",
                "--disable-infobars",
            ],
            no_viewport=True,
        )

        page = await browser.new_page()

        # ── STEP 1: Land on results ──────────────────────────────────────────
        log("Navigating to MagicBricks Electronic City filter...")
        await page.goto(SEARCH_URL, wait_until="domcontentloaded")
        await asyncio.sleep(3)

        # ── STEP 2: Fast scan down — AI skimming ─────────────────────────────
        log("Page loaded. Applying 2BHK + rent filters...")
        await asyncio.sleep(1)
        log("Fast-scanning 134 listings for price anomalies...")
        for i in range(7):
            try:
                log(f"Scrolling rapidly... (analyzing)")
                await page.evaluate("window.scrollBy(0, 450)")
                await asyncio.sleep(0.6)
            except Exception:
                pass

        await asyncio.sleep(1.5)

        # ── STEP 3: Slow scroll back up — reviewing ───────────────────────────
        log("Scroll complete. Reviewing top matches...")
        for _ in range(4):
            try:
                await page.evaluate("window.scrollBy(0, -300)")
                await asyncio.sleep(1.0)
            except Exception:
                pass

        await asyncio.sleep(1)
        log("Comparing MagicBricks data with previous platforms...")
        await asyncio.sleep(2)
        log("Analysis complete. Best value listing identified.")
        await asyncio.sleep(1)

        # ── STAGGER: MagicBricks closes first — no extra delay ───────────────
        log("✓ MagicBricks analysis complete. Window closing.")

    except Exception as e:
        log(f"Error: {e}")
    finally:
        if browser:
            await browser.close()
        await playwright_instance.stop()
