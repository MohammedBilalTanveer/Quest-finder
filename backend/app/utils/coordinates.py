import math
from typing import Any, Optional


def parse_coordinate(value: Any, limit: float) -> Optional[float]:
    """Return a finite float within [-limit, limit], else None."""
    if isinstance(value, bool) or value is None:
        return None
    try:
        number = float(value)
    except (TypeError, ValueError):
        return None
    if not math.isfinite(number) or abs(number) > limit:
        return None
    return number


def parse_lat(value: Any) -> Optional[float]:
    return parse_coordinate(value, 90)


def parse_lng(value: Any) -> Optional[float]:
    return parse_coordinate(value, 180)
