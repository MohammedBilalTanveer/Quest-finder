import logging

from fastapi import APIRouter, HTTPException, Query

from ..models.quest import QuestResponse
from ..services.cache import get_quests
from ..services.source_client import SourceError, SourceFormatError

log = logging.getLogger(__name__)
router = APIRouter()


@router.get("/api/quests", response_model=QuestResponse)
def quests(refresh: bool = Query(False)):
    try:
        return get_quests(force=refresh)
    except SourceError as exc:
        log.warning("Source unavailable: %s", exc)
        raise HTTPException(502, "Quest data is temporarily unavailable. Please try again.")
    except SourceFormatError as exc:
        log.error("Source format changed: %s", exc)
        raise HTTPException(502, "The quest data source changed its format and cannot be read right now.")


@router.get("/")
def root():
    return {"service": "pokemon-quest-finder-api", "quests": "/api/quests", "health": "/api/health"}


@router.get("/api/health")
def health():
    return {"status": "ok"}
