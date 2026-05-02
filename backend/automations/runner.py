"""
Automation Runner
Launches 3 browser automations in parallel using asyncio.
Each automation is a separate coroutine — easy to add/remove/edit.
"""

import asyncio
from typing import Any

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
        Fires all 3 automations in parallel.
        Status updates: idle -> running -> complete
        """
        self.status = "running"
        try:
            await asyncio.gather(
                run_99acres(session),
                run_nobroker(session),
                run_magicbricks(session),
            )
            self.status = "complete"
        except Exception as e:
            print(f"[AutomationRunner] Error: {e}")
            self.status = "complete"  # still complete so frontend moves on

    async def shutdown(self):
        for task in self._tasks:
            task.cancel()
