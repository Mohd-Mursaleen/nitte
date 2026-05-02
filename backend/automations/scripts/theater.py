"""
Theater automation scripts — one coroutine per property site.

Uses browser-use Agent (headless=False) + ChatOpenAI gpt-4o-mini.
Each function opens a visible browser window, runs the AI agent against
a session-aware search task, and logs every step to theater_log.

Import surface:
    run_nobroker(session)
    run_99acres(session)
    run_magicbricks(session)
"""

import os
import sys
from typing import Any

# Add browser-use-main to path so it can be imported without pip install
_BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
_BROWSER_USE_DIR = os.path.join(_BACKEND_DIR, "browser-use-main")
if _BROWSER_USE_DIR not in sys.path:
    sys.path.insert(0, _BROWSER_USE_DIR)

from browser_use import Agent, ChatOpenAI
from browser_use.browser import BrowserProfile, BrowserSession

from automations.log_store import append_log


# ── Helpers ──────────────────────────────────────────────────────────────────

def _extract(session: dict[str, Any]) -> tuple[str, str, str]:
    """
    Pull key search fields from session with safe defaults.

    Returns:
        (bhk, locality, budget) — all strings, never None.
    """
    bhk = session.get("bhk_type") or "2 BHK"
    locality = (
        session.get("locality")
        or session.get("suggested_locality_choice")
        or "Electronic City"
    )
    budget = session.get("budget_range") or ""
    return bhk, locality, budget


def _build_task(site_url: str, bhk: str, locality: str, budget: str) -> str:
    """
    Build a natural language task string for the agent.

    Args:
        site_url: Root URL of the property site.
        bhk: BHK type, e.g. "2 BHK".
        locality: Target locality, e.g. "Electronic City".
        budget: Budget range string. May be empty.

    Returns:
        Full instruction string for the browser-use Agent.
    """
    task = (
        f"Go to {site_url}. "
        f"Search for {bhk} flat for rent in {locality}, Bangalore."
    )
    if budget:
        task += f" Budget around {budget}."
    task += (
        " Scroll through at least 3 listings to display the results, "
        "then open one listing to view its full details."
    )
    return task


def _make_step_callback(site_name: str):
    """
    Returns an async on_step_end hook that logs each agent step.

    Args:
        site_name: Label for log lines, e.g. "NoBroker".
    """
    async def on_step_end(agent: Agent) -> None:
        step = agent.state.n_steps
        goal = ""
        try:
            goal = agent.state.last_model_output.current_state.next_goal
        except Exception:
            pass
        msg = f"Step {step}: {goal}" if goal else f"Step {step}"
        append_log(f"[{site_name}] {msg}")

    return on_step_end


async def _run_site(site_name: str, task: str, max_steps: int = 20) -> None:
    """
    Shared runner — opens a visible browser, runs the agent, closes when done.

    Args:
        site_name: Label used in logs.
        task: Full natural language instruction for the agent.
        max_steps: Hard cap on agent steps to control cost.
    """
    llm = ChatOpenAI(model="gpt-5.4-2026-03-05")

    browser_session = BrowserSession(
        browser_profile=BrowserProfile(
            headless=False,   # visible browser — the theater effect
            keep_alive=False, # auto-close when agent finishes
        )
    )

    agent = Agent(
        task=task,
        llm=llm,
        browser_session=browser_session,
    )

    append_log(f"[{site_name}] Starting agent")
    try:
        await agent.run(
            max_steps=max_steps,
            on_step_end=_make_step_callback(site_name),
        )
        append_log(f"[{site_name}] Agent finished")
    except Exception as e:
        append_log(f"[{site_name}] Error: {e}")
    finally:
        try:
            await browser_session.kill()
        except Exception:
            pass


# ── Site runners ─────────────────────────────────────────────────────────────

async def run_nobroker(session: dict[str, Any]) -> None:
    """
    Run browser-use agent on NoBroker with session-aware search task.

    Args:
        session: Voice session data collected by Nest.
    """
    bhk, locality, budget = _extract(session)
    task = _build_task("https://www.nobroker.in", bhk, locality, budget)
    await _run_site("NoBroker", task)


async def run_99acres(session: dict[str, Any]) -> None:
    """
    Run browser-use agent on 99acres with session-aware search task.

    Args:
        session: Voice session data collected by Nest.
    """
    bhk, locality, budget = _extract(session)
    task = _build_task("https://www.99acres.com", bhk, locality, budget)
    await _run_site("99Acres", task)


async def run_magicbricks(session: dict[str, Any]) -> None:
    """
    Run browser-use agent on MagicBricks with session-aware search task.

    Args:
        session: Voice session data collected by Nest.
    """
    bhk, locality, budget = _extract(session)
    task = _build_task("https://www.magicbricks.com", bhk, locality, budget)
    await _run_site("MagicBricks", task)
