"""
NoBroker Automation — Browser Use Cloud SDK v3
LLM agent navigates NoBroker, searches for 2BHK listings in Koramangala,
and returns structured results. Streams step-by-step logs to theater_log.
"""

import json
import time
from typing import Any

from pydantic import BaseModel

from automations.log_store import theater_log

# Module-level cache — populated after each run
nobroker_results: list[dict] = []


class PropertyListing(BaseModel):
    title: str
    price: str
    location: str
    source: str


class PropertyListings(BaseModel):
    listings: list[PropertyListing]


TASK_PROMPT = (
    "Go to https://www.nobroker.in and search for 2 BHK flats for rent in "
    "Koramangala, Bangalore. Browse through at least 5 listings. For each listing "
    "note down: property name or title, rent price, and location. Return a JSON list "
    "of the top 3 listings you found with keys: title, price, location, "
    "source (set to 'NoBroker')."
)


def log(message: str):
    """Timestamped log entry — printed to stdout and appended to shared theater log."""
    entry = f"[{time.strftime('%H:%M:%S')}] [NoBroker] {message}"
    print(entry)
    theater_log.append(entry)


async def run_nobroker(session: dict[str, Any]) -> list[dict]:
    """
    Launches a browser-use Cloud agent to search NoBroker.
    Streams live step logs. Returns list of up to 3 property dicts.
    """
    global nobroker_results

    from browser_use_sdk.v3 import AsyncBrowserUse  # noqa: PLC0415

    client = AsyncBrowserUse()
    log("Navigating directly to NoBroker Electronic City results...")

    try:
        task = await client.tasks.create_task(
            task=TASK_PROMPT,
            schema=PropertyListings,
            max_steps=15,
        )

        async for step in task.stream():
            goal = getattr(step, "next_goal", None) or getattr(step, "summary", "")
            url = getattr(step, "url", "")
            if goal:
                log(f"Step {step.number}: {goal}" + (f" — {url}" if url else ""))

        result = await task.complete()

        # Prefer typed parsed output; fall back to JSON-parsing raw output
        listings: list[dict] = []
        if result.parsed_output and hasattr(result.parsed_output, "listings"):
            listings = [item.model_dump() for item in result.parsed_output.listings]
        elif result.output:
            try:
                raw = result.output if isinstance(result.output, str) else json.dumps(result.output)
                parsed = json.loads(raw)
                if isinstance(parsed, list):
                    listings = parsed
                elif isinstance(parsed, dict) and "listings" in parsed:
                    listings = parsed["listings"]
            except Exception:
                pass

        nobroker_results = listings
        log(f"✓ NoBroker scan complete. {len(listings)} matches confirmed. Window closing.")
        return listings

    except Exception as e:
        log(f"Error: {e}")
        nobroker_results = []
        return []
