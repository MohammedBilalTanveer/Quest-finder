"""Fetches raw quest records from the source. Nothing else lives here.

Uses the same public GET endpoint the NYCPokeMap Quest page itself calls
(`quests.php?quests[]=<filter>`). It sends one request, identifies itself,
does not bypass any access control, and is rate-limited by the caller
(see cache.py).
"""
import json
import time
from pathlib import Path
from typing import Any, Dict, List

import httpx

from ..config import settings

SAMPLE_PATH = Path(__file__).resolve().parent.parent.parent / "sample_quests.json"


class SourceError(Exception):
    """Upstream unreachable / refused / blocked."""


class SourceFormatError(Exception):
    """Upstream responded but not in the expected shape."""


def fetch_raw_quests() -> List[Dict[str, Any]]:
    if settings.use_sample_data:
        return json.loads(SAMPLE_PATH.read_text(encoding="utf-8"))["quests"]

    try:
        with httpx.Client(timeout=20.0, follow_redirects=True) as client:
            response = client.get(
                settings.source_url,
                params={
                    "quests[]": settings.source_filter,
                    "time": int(time.time() * 1000),
                },
                headers={
                    "Accept": "application/json",
                    "User-Agent": "pokemon-quest-finder/1.0 (personal hobby project)",
                },
            )
    except httpx.HTTPError as exc:
        raise SourceError(f"Could not reach source: {exc.__class__.__name__}") from exc

    if response.status_code != 200:
        raise SourceError(f"Source returned HTTP {response.status_code}")

    try:
        payload = response.json()
    except ValueError as exc:
        raise SourceFormatError("Source did not return JSON") from exc

    quests = payload.get("quests") if isinstance(payload, dict) else None
    if not isinstance(quests, list):
        raise SourceFormatError("Source JSON has no 'quests' list")
    return quests
