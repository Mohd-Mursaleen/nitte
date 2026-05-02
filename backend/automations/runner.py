import asyncio
from typing import Any


class AutomationRunner:
    def __init__(self):
        self.status = "idle"
        self.results = []

    def reset(self):
        self.status = "idle"
        self.results = []

    async def run_all(self, session: dict[str, Any]):
        self.status = "running"
        print("[AutomationRunner] Theater started. Waiting 60 seconds...")
        await asyncio.sleep(60)
        self.status = "complete"
        print("[AutomationRunner] Theater complete.")

    async def shutdown(self):
        pass
