"""
Shared utilities for all automation scripts.
"""

import os
import platform
from playwright.async_api import Locator


def get_chrome_profile() -> str:
    """
    Returns the path to your real Chrome user profile.
    Edit CUSTOM_PROFILE_PATH if your profile is in a non-standard location.
    """
    CUSTOM_PROFILE_PATH = os.getenv("CHROME_PROFILE_PATH", "")
    if CUSTOM_PROFILE_PATH:
        return CUSTOM_PROFILE_PATH

    system = platform.system()
    home = os.path.expanduser("~")

    if system == "Darwin":  # macOS
        return os.path.join(
            home,
            "Library/Application Support/Google/Chrome/Default",
        )
    elif system == "Linux":
        return os.path.join(home, ".config/google-chrome/Default")
    elif system == "Windows":
        return os.path.join(
            os.getenv("LOCALAPPDATA", ""),
            "Google/Chrome/User Data/Default",
        )
    else:
        raise RuntimeError(f"Unsupported OS: {system}")


async def slow_type(locator: Locator, text: str, delay_ms: int = 80):
    """
    Types text character by character with a delay.
    Looks like a human typing — much more convincing for demos.
    """
    import asyncio
    for char in text:
        await locator.type(char)
        await asyncio.sleep(delay_ms / 1000)
