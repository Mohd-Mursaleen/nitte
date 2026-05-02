"""
99acres Automation — Choreography Script
Opens 99acres in your Chrome profile, searches, scrolls, hovers listings.
Fully scripted — not AI-driven. Edit STEPS to change behavior.
"""

import asyncio
from typing import Any

from playwright.async_api import async_playwright

from automations.utils import get_chrome_profile, slow_type

# ── Hardcoded search inputs (edit these for demo) ────────────────────────────
SEARCH_QUERY = "2 BHK flats for rent in Electronic City Bangalore"
SITE_URL = "https://www.99acres.com"


async def run_99acres(session: dict[str, Any]):
    """
    Theater choreography for 99acres.
    Opens visibly (headless=False) using your real Chrome profile.
    Types query slowly, scrolls listings, hovers cards, clicks a detail page.
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

        # ── STEP 1: Navigate to site ─────────────────────────────────────────
        await page.goto(SITE_URL, wait_until="domcontentloaded")
        await asyncio.sleep(2)

        # ── STEP 2: Find search bar and type slowly ──────────────────────────
        try:
            search_box = page.locator("input[placeholder*='Search']").first
            await search_box.click()
            await slow_type(search_box, SEARCH_QUERY, delay_ms=80)
            await asyncio.sleep(1)
            await page.keyboard.press("Enter")
        except Exception:
            # Fallback: navigate directly to search results
            await page.goto(
                "https://www.99acres.com/search/property/rent/bangalore?search_type=Manual&search_intent=rent&src=DESK",
                wait_until="domcontentloaded",
            )

        await asyncio.sleep(3)

        # ── STEP 3: Scroll down slowly through listings ──────────────────────
        for _ in range(8):
            try:
                await page.evaluate("window.scrollBy(0, 350)")
                await asyncio.sleep(0.5)
            except Exception:
                pass

        await asyncio.sleep(1)

        # ── STEP 4: Hover over first 3 listing cards ─────────────────────────
        try:
            cards = await page.locator(
                "[data-tracking*='srp_card'], .tupleNew__card, article"
            ).all()
            for card in cards[:3]:
                try:
                    await card.hover()
                    await asyncio.sleep(1.2)
                except Exception:
                    pass
        except Exception:
            pass

        # ── STEP 5: Click first listing, view details, go back ───────────────
        try:
            cards = await page.locator(
                "[data-tracking*='srp_card'], .tupleNew__card, article"
            ).all()
            if cards:
                await cards[0].click()
                await asyncio.sleep(3)
                await page.go_back()
                await asyncio.sleep(2)
        except Exception:
            pass

        # ── STEP 6: Scroll a bit more ────────────────────────────────────────
        for _ in range(4):
            try:
                await page.evaluate("window.scrollBy(0, 300)")
                await asyncio.sleep(0.6)
            except Exception:
                pass

        await asyncio.sleep(2)

    except Exception as e:
        print(f"[99acres] Error: {e}")
    finally:
        if browser:
            await browser.close()
        await playwright_instance.stop()
