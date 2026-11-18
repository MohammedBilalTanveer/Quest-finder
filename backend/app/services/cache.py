import threading
import time
from datetime import datetime, timezone
from typing import Optional, Tuple

from ..config import settings
from ..models.quest import Filters, QuestResponse
from .quest_filter import filter_quests
from .source_client import fetch_raw_quests

_lock = threading.Lock()
_entry: Optional[Tuple[float, QuestResponse]] = None


def get_quests(force: bool = False) -> QuestResponse:
    """Return matching quests.

    Normal calls reuse data younger than CACHE_TTL_SECONDS. A forced refresh
    (the Refresh button) still never hits the source more often than once per
    MIN_SOURCE_INTERVAL_SECONDS. Upstream errors propagate (never an empty OK).
    """
    global _entry
    with _lock:
        now = time.monotonic()
        if _entry is not None:
            age = now - _entry[0]
            limit = settings.min_source_interval if force else settings.cache_ttl
            if age < limit:
                return _entry[1].model_copy(update={"cached": True})

        raw = fetch_raw_quests()
        results = filter_quests(raw)
        response = QuestResponse(
            source="NYCPokeMap (SAMPLE DATA)" if settings.use_sample_data else "NYCPokeMap",
            filters=Filters(pokemon=settings.target_pokemon, task=settings.target_task),
            fetchedAt=datetime.now(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z"),
            count=len(results),
            cached=False,
            sample=settings.use_sample_data,
            results=results,
        )
        _entry = (now, response)
        return response
