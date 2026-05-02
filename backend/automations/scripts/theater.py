"""
TrueNest Theater — 3 Playwright scripts that open real Chrome windows,
search for 2 BHK in Electronic City, scroll and click listings like a human.
No LLM involved — pure scripted theater for the demo.
"""

import asyncio
import random

from playwright.async_api import async_playwright

from automations.utils import CHROME_BINARY, get_chrome_profile, slow_type


async def _random_scroll(page, steps: int = 4):
    """Scroll down the page in human-sized chunks."""
    for _ in range(steps):
        await page.mouse.wheel(0, random.randint(400, 700))
        await asyncio.sleep(random.uniform(0.8, 1.6))


async def run_nobroker(session: dict) -> list:
    """
    Opens NoBroker in a real Chrome window, searches 2 BHK Electronic City,
    scrolls through listings and clicks a couple.

    Args:
        session: SessionData fields (unused — search is hardcoded for theater).

    Returns:
        Empty list — results come from the hardcoded engine, not live scraping.
    """
    async with async_playwright() as pw:
        ctx = await pw.chromium.launch_persistent_context(
            user_data_dir=get_chrome_profile(),
            executable_path=CHROME_BINARY,
            headless=False,
            args=["--start-maximized"],
            no_viewport=True,
        )
        page = ctx.pages[0] if ctx.pages else await ctx.new_page()
        try:
            await page.goto("https://www.nobroker.in", timeout=30000)
            await asyncio.sleep(2)

            # Try to find and fill the search box
            search_selectors = [
                'input[placeholder*="Search"]',
                'input[placeholder*="City"]',
                'input[type="search"]',
                '#search',
                '.search-input',
            ]
            for sel in search_selectors:
                try:
                    loc = page.locator(sel).first
                    if await loc.is_visible(timeout=3000):
                        await slow_type(loc, "2 BHK Electronic City Bangalore")
                        await asyncio.sleep(0.5)
                        await page.keyboard.press("Enter")
                        break
                except Exception:
                    continue

            await asyncio.sleep(3)
            await _random_scroll(page, steps=5)

            # Click first visible listing
            for sel in ['[class*="list-card"]', '[class*="property"]', 'article', '.card']:
                try:
                    cards = page.locator(sel)
                    if await cards.count() > 0:
                        await cards.nth(0).click(timeout=3000)
                        await asyncio.sleep(2)
                        await _random_scroll(page, steps=3)
                        await page.go_back()
                        await asyncio.sleep(1.5)
                        await cards.nth(1).click(timeout=3000)
                        await asyncio.sleep(2)
                        await _random_scroll(page, steps=2)
                        break
                except Exception:
                    continue

            await asyncio.sleep(2)
        except Exception as e:
            print(f"[NoBroker] Error: {e}")
        finally:
            await ctx.close()
    return []


async def run_99acres(session: dict) -> list:
    """
    Opens 99Acres in a real Chrome window, searches 2 BHK Electronic City,
    scrolls through listings and clicks a couple.

    Args:
        session: SessionData fields (unused — search is hardcoded for theater).

    Returns:
        Empty list — results come from the hardcoded engine, not live scraping.
    """
    async with async_playwright() as pw:
        ctx = await pw.chromium.launch_persistent_context(
            user_data_dir=get_chrome_profile(),
            executable_path=CHROME_BINARY,
            headless=False,
            args=["--start-maximized"],
            no_viewport=True,
        )
        page = ctx.pages[0] if ctx.pages else await ctx.new_page()
        try:
            await page.goto("https://www.99acres.com", timeout=30000)
            await asyncio.sleep(2)

            search_selectors = [
                'input[placeholder*="Search"]',
                'input[placeholder*="City"]',
                '#keyword',
                '.searchbar input',
                'input[type="text"]',
            ]
            for sel in search_selectors:
                try:
                    loc = page.locator(sel).first
                    if await loc.is_visible(timeout=3000):
                        await slow_type(loc, "2 BHK Electronic City Bangalore")
                        await asyncio.sleep(0.5)
                        await page.keyboard.press("Enter")
                        break
                except Exception:
                    continue

            await asyncio.sleep(3)
            await _random_scroll(page, steps=5)

            for sel in ['[class*="srpTuple"]', '[class*="property"]', 'article', '.card']:
                try:
                    cards = page.locator(sel)
                    if await cards.count() > 0:
                        await cards.nth(0).click(timeout=3000)
                        await asyncio.sleep(2)
                        await _random_scroll(page, steps=3)
                        await page.go_back()
                        await asyncio.sleep(1.5)
                        await cards.nth(2).click(timeout=3000)
                        await asyncio.sleep(2)
                        await _random_scroll(page, steps=2)
                        break
                except Exception:
                    continue

            await asyncio.sleep(2)
        except Exception as e:
            print(f"[99Acres] Error: {e}")
        finally:
            await ctx.close()
    return []


async def run_magicbricks(session: dict) -> list:
    """
    Opens MagicBricks in a real Chrome window, searches 2 BHK Electronic City,
    scrolls through listings and clicks a couple.

    Args:
        session: SessionData fields (unused — search is hardcoded for theater).

    Returns:
        Empty list — results come from the hardcoded engine, not live scraping.
    """
    async with async_playwright() as pw:
        ctx = await pw.chromium.launch_persistent_context(
            user_data_dir=get_chrome_profile(),
            executable_path=CHROME_BINARY,
            headless=False,
            args=["--start-maximized"],
            no_viewport=True,
        )
        page = ctx.pages[0] if ctx.pages else await ctx.new_page()
        try:
            await page.goto("https://www.magicbricks.com", timeout=30000)
            await asyncio.sleep(2)

            search_selectors = [
                'input[placeholder*="Search"]',
                'input[placeholder*="City"]',
                '#txtKeyword',
                '.search-widget input',
                'input[type="text"]',
            ]
            for sel in search_selectors:
                try:
                    loc = page.locator(sel).first
                    if await loc.is_visible(timeout=3000):
                        await slow_type(loc, "2 BHK Electronic City Bangalore")
                        await asyncio.sleep(0.5)
                        await page.keyboard.press("Enter")
                        break
                except Exception:
                    continue

            await asyncio.sleep(3)
            await _random_scroll(page, steps=5)

            for sel in ['[class*="mb-srp"]', '[class*="property"]', 'article', '.card']:
                try:
                    cards = page.locator(sel)
                    if await cards.count() > 0:
                        await cards.nth(0).click(timeout=3000)
                        await asyncio.sleep(2)
                        await _random_scroll(page, steps=3)
                        await page.go_back()
                        await asyncio.sleep(1.5)
                        await cards.nth(1).click(timeout=3000)
                        await asyncio.sleep(2)
                        await _random_scroll(page, steps=2)
                        break
                except Exception:
                    continue

            await asyncio.sleep(2)
        except Exception as e:
            print(f"[MagicBricks] Error: {e}")
        finally:
            await ctx.close()
    return []
