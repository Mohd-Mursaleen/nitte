"""
TrueNest AI — Backend Server
FastAPI server that:
1. Receives session data from Pipecat when conversation ends
2. Triggers parallel browser-use Cloud agents (the theater)
3. Serves live scraped results merged with hardcoded fallback cards
4. Exposes status and live log endpoints for the frontend to poll
"""

import asyncio
import os
from contextlib import asynccontextmanager
from typing import Any

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

load_dotenv()

from automations.log_store import clear_logs, get_logs
from automations.runner import AutomationRunner
from research.pipeline import run_research_pipeline
from research.store import ResearchStore
from results.engine import compute_results, get_automation_results
from session.store import SessionStore

# ── Shared state ────────────────────────────────────────────────────────────
session_store = SessionStore()
automation_runner = AutomationRunner()
research_store = ResearchStore()


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield
    await automation_runner.shutdown()


app = FastAPI(title="TrueNest AI Backend", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:7860"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Models ───────────────────────────────────────────────────────────────────
class SessionData(BaseModel):
    name: str = ""
    age: str = ""
    gender: str = ""
    has_locality: str = ""
    locality: str = ""
    budget_range: str = ""
    bhk_type: str = ""
    furnishing_type: str = ""
    occupancy_type: str = ""
    lifestyle_preference: str = ""
    nearby_requirements: str = ""
    priorities: str = ""
    workplace_location: str = ""
    max_commute_time: str = ""
    user_type: str = ""
    living_type: str = ""
    kids: str = ""
    primary_priority: str = ""
    suggested_locality_choice: str = ""
    amenities_required: str = ""
    deal_breakers: str = ""


# ── Routes ───────────────────────────────────────────────────────────────────

@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/session/complete")
async def session_complete(data: SessionData):
    """
    Called by Pipecat bot when Nest says the final line.
    Saves session data, clears old logs, and triggers:
      - Browser theater (3 parallel Playwright windows)
      - Exa + GPT research pipeline (property listings + locality → AI-generated cards)
    Both run as background tasks; /theater/status and /results are polled by frontend.
    """
    session_dict = data.model_dump()
    session_store.save(session_dict)
    clear_logs()
    research_store.clear()
    asyncio.create_task(automation_runner.run_all(session_dict))
    asyncio.create_task(run_research_pipeline(session_dict, research_store))
    return {"status": "started"}


@app.get("/theater/status")
async def theater_status():
    """
    Frontend polls this to know when the theater is done.
    Returns: idle | running | complete
    """
    return {"status": automation_runner.status}


@app.get("/theater/logs")
async def get_theater_logs():
    """
    Frontend polls this every 1 second to display live activity logs.
    Returns all logs collected so far from all 3 browser agents.
    """
    return {"logs": get_logs()}


@app.get("/results")
async def get_results():
    """
    Returns property cards with match scores.

    Priority:
      1. AI-generated cards from Exa + GPT research pipeline (if ready)
      2. Live-scraped cards from browser automation (if any) + hardcoded fallback
      3. Hardcoded fallback cards only
    """
    session = session_store.get() or {}

    # 1. Research pipeline results — Exa + GPT generated cards
    research = research_store.get_results()
    if research:
        return {"results": research, "source": "ai"}

    # 2. Live automation scrape + hardcoded fallback
    hardcoded = compute_results(session)
    live = get_automation_results(automation_runner)
    if live:
        return {"results": live + hardcoded, "source": "live+fallback"}

    # 3. Pure hardcoded fallback
    return {"results": hardcoded, "source": "fallback"}


@app.post("/theater/reset")
async def reset_theater():
    """Dev endpoint — reset automation state and research pipeline for re-running."""
    automation_runner.reset()
    session_store.clear()
    research_store.clear()
    clear_logs()
    return {"status": "reset"}
