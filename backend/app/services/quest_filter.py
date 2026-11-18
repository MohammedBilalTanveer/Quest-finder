"""Normalises raw source records and keeps only the configured target."""
import hashlib
import logging
import re
from typing import Any, Dict, Iterable, List, Optional

from ..config import settings
from ..models.quest import Quest
from ..utils.coordinates import parse_lat, parse_lng

log = logging.getLogger(__name__)


def norm(text: Any) -> str:
    return re.sub(r"\s+", " ", str(text or "")).strip().casefold()


def _flatten(value: Any) -> Iterable[str]:
    if value is None:
        return
    if isinstance(value, (list, tuple)):
        for v in value:
            yield from _flatten(v)
    else:
        for part in str(value).split(","):
            part = part.strip()
            if part:
                yield part


def matches_pokemon(record: Dict[str, Any]) -> bool:
    """Eternatus is a reward on the source: match by reward id or reward text."""
    ids = set(_flatten(record.get("rewards_ids")))
    if settings.target_pokemon_id in ids:
        return True
    return norm(settings.target_pokemon) in norm(record.get("rewards_string"))


def matches_task(record: Dict[str, Any]) -> bool:
    return norm(record.get("conditions_string")) == norm(settings.target_task)


def normalize(record: Dict[str, Any]) -> Optional[Quest]:
    lat = parse_lat(record.get("lat"))
    lng = parse_lng(record.get("lng"))
    if lat is None or lng is None:
        return None
    name = str(record.get("name") or "").strip() or "Unknown PokéStop"
    key = f"{lat:.6f}|{lng:.6f}|{norm(record.get('conditions_string'))}"
    expiration = record.get("expiration")
    try:
        expiration = int(expiration) if expiration is not None else None
    except (TypeError, ValueError):
        expiration = None
    reward = record.get("rewards_string")
    return Quest(
        id=hashlib.sha1(key.encode()).hexdigest()[:16],
        name=name,
        latitude=lat,
        longitude=lng,
        pokemon=settings.target_pokemon,
        quest=str(record.get("conditions_string")).strip(),
        reward=str(reward).strip() if reward else None,
        expiration=expiration,
    )


def filter_quests(raw: List[Any]) -> List[Quest]:
    seen = set()
    results: List[Quest] = []
    skipped = 0
    for record in raw:
        if not isinstance(record, dict):
            skipped += 1
            continue
        if not (matches_pokemon(record) and matches_task(record)):
            continue
        quest = normalize(record)
        if quest is None:
            skipped += 1
            continue
        if quest.id in seen:
            continue
        seen.add(quest.id)
        results.append(quest)
    if skipped:
        log.warning("Skipped %d malformed record(s)", skipped)
    return results
