"""
Automation Runner
Launches 3 browser automations in parallel using asyncio.gather().
Each script has a built-in stagger delay before browser.close() so they
close one by one: MagicBricks first, NoBroker second, 99acres last.
"""

import asyncio
from typing import Any

from automations.log_store import theater_log
from automations.scripts.ninety_nine_acres import run_99acres
from automations.scripts.nobroker import run_nobroker
from automations.scripts.magicbricks import run_magicbricks


class AutomationRunner:
    def __init__(self):
        self.status = "idle"  # idle | running | complete | error
        self._tasks: list[asyncio.Task] = []

    def reset(self):
        self.status = "idle"
        self._tasks = []

    async def run_all(self, session: dict[str, Any]):
        """
        Fires all 3 automations simultaneously via asyncio.gather().
        Stagger close order (built into each script's final sleep):
          MagicBricks → closes ~22s  (0s extra delay)
          NoBroker    → closes ~28s  (2s extra delay)
          99acres     → closes ~34s  (4s extra delay)
        """
        self.status = "running"
        theater_log.append(
            f"[AutomationRunner] All 3 browser windows opening simultaneously..."
        )
        try:
            await asyncio.gather(
                run_99acres(session),
                run_nobroker(session),
                run_magicbricks(session),
            )
            self.status = "complete"
            theater_log.append(
                "[AutomationRunner] Theater complete. All windows closed."
            )
        except Exception as e:
            print(f"[AutomationRunner] Error: {e}")
            self.status = "complete"  # still complete so frontend never hangs

    async def shutdown(self):
        for task in self._tasks:
            task.cancel()
