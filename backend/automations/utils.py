"""
Shared utilities for all automation scripts.
"""

import os
import platform
from playwright.async_api import Locator

# Path to the real installed Google Chrome binary.
# Override via CHROME_BINARY_PATH env var if Chrome is in a non-standard location.
CHROME_BINARY = os.getenv(
    "CHROME_BINARY_PATH",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
)


def get_chrome_profile() -> str:
    """
    Returns the path to your real Chrome user profile.
    Override via CHROME_PROFILE_PATH env var if not at the OS default.
    """
    custom = os.getenv("CHROME_PROFILE_PATH", "")
    if custom:
        return custom

    system = platform.system()
    home = os.path.expanduser("~")

    if system == "Darwin":
        return os.path.join(home, "Library/Application Support/Google/Chrome/Default")
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
    Looks like a human typing — convincing for demos.
    """
    import asyncio
    for char in text:
        await locator.type(char)
        await asyncio.sleep(delay_ms / 1000)
