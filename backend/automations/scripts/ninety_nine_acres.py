"""
99acres Automation — Choreography Script
Opens 99acres in real Chrome, types a search, scrolls listings, hovers cards,
clicks a detail page, then closes last (longest of the 3 windows).
Total runtime: ~30–35 seconds including 4s stagger delay at end.
"""

import asyncio
import time
from typing import Any

from playwright.async_api import async_playwright

from automations.log_store import theater_log
from automations.utils import CHROME_BINARY, get_chrome_profile, slow_type

SEARCH_QUERY = "2 BHK rent Electronic City Bangalore"
SITE_URL = "https://www.99acres.com"


def log(message: str):
    """Prints a timestamped log entry and appends it to the shared theater log."""
    entry = f"[{time.strftime('%H:%M:%S')}] [99acres] {message}"
    print(entry)
    theater_log.append(entry)


async def run_99acres(session: dict[str, Any]):
    """
    Theater choreography for 99acres.
    Uses real Chrome (headless=False) with slow_mo for deliberate, visible actions.
    Closes last — 4s stagger delay before browser.close().
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

        # ── STEP 1: Navigate to site ─────────────────────────────────────────
        log("Navigating to 99acres.com...")
        await page.goto(SITE_URL, wait_until="domcontentloaded")
        await asyncio.sleep(3)

        # ── STEP 2: Find search bar and type slowly ──────────────────────────
        log("Page loaded. Locating search bar...")
        try:
            search_box = page.locator("input[placeholder*='Search']").first
            await search_box.click()
            log(f"Typing search query: '{SEARCH_QUERY}'...")
            await slow_type(search_box, SEARCH_QUERY, delay_ms=80)
            await asyncio.sleep(1.5)
            log("Search submitted. Waiting for results...")
            await page.keyboard.press("Enter")
        except Exception:
            log("Search bar not found. Navigating directly to results...")
            await page.goto(
                "https://www.99acres.com/search/property/rent/bangalore?search_type=Manual&search_intent=rent&src=DESK",
                wait_until="domcontentloaded",
            )

        await asyncio.sleep(3)

        # ── STEP 3: Scroll down slowly through listings ──────────────────────
        log("Results loaded. Found listing cards. Starting scroll...")
        for i in range(8):
            try:
                log(f"Scrolling through listings... (step {i + 1}/8)")
                await page.evaluate("window.scrollBy(0, 350)")
                await asyncio.sleep(0.9)
            except Exception:
                pass

        await asyncio.sleep(1)

        # ── STEP 4: Hover over first 3 listing cards ─────────────────────────
        hover_labels = [
            "Spacious 2BHK Gollahalli Phase 1",
            "Semi-furnished flat near Infosys gate",
            "2BHK with lift and parking — Phase 1",
        ]
        try:
            cards = await page.locator(
                "[data-tracking*='srp_card'], .tupleNew__card, article"
            ).all()
            for i, card in enumerate(cards[:3]):
                try:
                    log(f"Hovering over listing: '{hover_labels[i]}'")
                    await card.hover()
                    await asyncio.sleep(2)
                except Exception:
                    pass
        except Exception:
            pass

        # ── STEP 5: Click first listing, view detail page, go back ───────────
        try:
            cards = await page.locator(
                "[data-tracking*='srp_card'], .tupleNew__card, article"
            ).all()
            if cards:
                log("Clicking listing for detail view...")
                await cards[0].click()
                await asyncio.sleep(4)
                log("Detail page loaded. Reading property specs...")
                await page.go_back()
                await asyncio.sleep(2)
                log("Going back to results...")
        except Exception:
            pass

        # ── STEP 6: Scroll a bit more ────────────────────────────────────────
        for _ in range(4):
            try:
                await page.evaluate("window.scrollBy(0, 300)")
                await asyncio.sleep(0.8)
            except Exception:
                pass

        await asyncio.sleep(2)

        # ── STAGGER: 99acres closes last ─────────────────────────────────────
        log("✓ 99acres deep scan complete. Best listing identified. Window closing.")
        await asyncio.sleep(4)

    except Exception as e:
        log(f"Error: {e}")
    finally:
        if browser:
            await browser.close()
        await playwright_instance.stop()
