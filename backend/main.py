"""
TrueNest AI — Backend Server
FastAPI server that:
1. Receives session data from Pipecat when conversation ends
2. Triggers parallel browser automations (the theater)
3. Serves hardcoded results with dynamic match scores
4. Exposes status and live log endpoints for the frontend to poll
"""

import asyncio
import os
from contextlib import asynccontextmanager
from typing import Any

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

load_dotenv()

from automations.log_store import clear_logs, get_logs
from automations.runner import AutomationRunner
from results.engine import compute_results
from session.store import SessionStore

# ── Shared state ────────────────────────────────────────────────────────────
session_store = SessionStore()
automation_runner = AutomationRunner()


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
    Saves session data, clears old logs, and triggers all automations in parallel.
    """
    session_store.save(data.model_dump())
    clear_logs()
    asyncio.create_task(automation_runner.run_all(data.model_dump()))
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
    Returns all logs collected so far from all 3 browser automations.
    """
    return {"logs": get_logs()}


@app.get("/results")
async def get_results():
    """
    Returns hardcoded property cards with dynamically computed match scores
    based on session data collected from Nest.
    """
    session = session_store.get()
    if not session:
        session = {}
    results = compute_results(session)
    return {"results": results}


@app.post("/theater/reset")
async def reset_theater():
    """Dev endpoint — reset automation state for re-running."""
    automation_runner.reset()
    session_store.clear()
    clear_logs()
    return {"status": "reset"}
