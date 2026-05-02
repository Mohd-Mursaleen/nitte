"""
Theater Log Store
Shared in-memory log list. All 3 automation scripts append here.
FastAPI serves logs via GET /theater/logs for the frontend proof panel.
"""

from typing import List

theater_log: List[str] = []


def clear_logs():
    theater_log.clear()


def get_logs() -> List[str]:
    return list(theater_log)


def append_log(msg: str) -> None:
    """Append a message to the shared theater log."""
    theater_log.append(msg)
