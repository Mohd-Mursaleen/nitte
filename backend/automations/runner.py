"""
Automation Runner
Launches 3 browser-use Cloud agents in parallel via asyncio.gather().
Collects and flattens their results into self.results.
"""

import asyncio
from typing import Any

from automations.log_store import theater_log
from automations.scripts.theater import run_99acres, run_nobroker, run_magicbricks


class AutomationRunner:
    def __init__(self):
        self.status = "idle"  # idle | running | complete
        self.results: list[dict] = []
        self._tasks: list[asyncio.Task] = []

    def reset(self):
        self.status = "idle"
        self.results = []
        self._tasks = []

    async def run_all(self, session: dict[str, Any]):
        """
        Fires all 3 browser-use agents simultaneously.
        Each returns a list of property dicts; results are flattened and stored.
        Status: idle → running → complete.
        """
        self.status = "running"
        self.results = []
        theater_log.append("[AutomationRunner] All 3 browser agents launching simultaneously...")

        try:
            gathered = await asyncio.gather(
                run_99acres(session),
                run_nobroker(session),
                run_magicbricks(session),
                return_exceptions=True,
            )

            # Flatten results; log any agent-level exceptions
            flat: list[dict] = []
            for item in gathered:
                if isinstance(item, list):
                    flat.extend(item)
                elif isinstance(item, Exception):
                    print(f"[AutomationRunner] Agent failed: {item}")

            self.results = flat
            self.status = "complete"
            theater_log.append(
                f"[AutomationRunner] Theater complete. {len(flat)} live listings collected."
            )

        except Exception as e:
            print(f"[AutomationRunner] Error: {e}")
            self.status = "complete"  # still complete so frontend never hangs

    async def shutdown(self):
        for task in self._tasks:
            task.cancel()
