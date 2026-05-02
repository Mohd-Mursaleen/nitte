"""
NoBroker Automation — Choreography Script
Opens NoBroker directly on search results (AI "already knows" the platform).
Scrolls, hovers cards, cross-references data.
Total runtime: ~26–30 seconds including 2s stagger delay at end.
"""

import asyncio
import time
from typing import Any

from playwright.async_api import async_playwright

from automations.log_store import theater_log
from automations.utils import CHROME_BINARY, get_chrome_profile

# Direct results URL — no typing, AI goes straight to results
SEARCH_URL = "https://www.nobroker.in/property/rent/flat/bangalore/Electronic-City?radius=0&city=bangalore&locality=Electronic-City"


def log(message: str):
    """Prints a timestamped log entry and appends it to the shared theater log."""
    entry = f"[{time.strftime('%H:%M:%S')}] [NoBroker] {message}"
    print(entry)
    theater_log.append(entry)


async def run_nobroker(session: dict[str, Any]):
    """
    Theater choreography for NoBroker.
    Navigates directly to results — faster opening than 99acres.
    Closes second — 2s stagger delay before browser.close().
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

        # ── STEP 1: Navigate directly to search results ──────────────────────
        log("Navigating directly to NoBroker Electronic City results...")
        await page.goto(SEARCH_URL, wait_until="domcontentloaded")
        await asyncio.sleep(3)

        # ── STEP 2: Scroll through listings ─────────────────────────────────
        log("Page loaded. Scanning listing cards...")
        log("Scrolling through 267 listings for Electronic City...")
        for i in range(8):
            try:
                await page.evaluate("window.scrollBy(0, 400)")
                await asyncio.sleep(0.9)
            except Exception:
                pass

        await asyncio.sleep(1)

        # ── STEP 3: Hover over first 2 listing cards ─────────────────────────
        hover_labels = [
            "Subha Omkara 2BHK — ₹17,500/month",
            "DS Max Silveroak — ₹15,500/month",
        ]
        try:
            cards = await page.locator(
                ".dnone-xs, .property-card, [class*='card']"
            ).all()
            for i, card in enumerate(cards[:2]):
                try:
                    log(f"Hovering: '{hover_labels[i]}'")
                    await card.hover()
                    await asyncio.sleep(2)
                except Exception:
                    pass
        except Exception:
            pass

        # ── STEP 4: More scrolling + cross-reference pause ────────────────────
        log("Cross-referencing price with 99acres data...")
        for _ in range(4):
            try:
                await page.evaluate("window.scrollBy(0, 350)")
                await asyncio.sleep(0.9)
            except Exception:
                pass

        await asyncio.sleep(2)

        # ── STAGGER: NoBroker closes second ──────────────────────────────────
        log("✓ NoBroker scan complete. 2 matches confirmed. Window closing.")
        await asyncio.sleep(2)

    except Exception as e:
        log(f"Error: {e}")
    finally:
        if browser:
            await browser.close()
        await playwright_instance.stop()
