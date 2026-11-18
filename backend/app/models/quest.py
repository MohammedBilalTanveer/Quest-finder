from typing import List, Optional

from pydantic import BaseModel


class Quest(BaseModel):
    id: str
    name: str
    latitude: float
    longitude: float
    pokemon: str
    quest: str
    reward: Optional[str] = None
    expiration: Optional[int] = None


class Filters(BaseModel):
    pokemon: str
    task: str


class QuestResponse(BaseModel):
    source: str
    filters: Filters
    fetchedAt: str
    count: int
    cached: bool = False
    sample: bool = False
    results: List[Quest]
