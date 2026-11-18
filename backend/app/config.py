import os
from dataclasses import dataclass

from dotenv import load_dotenv

load_dotenv()


@dataclass(frozen=True)
class Settings:
    source_url: str = os.getenv("SOURCE_URL", "https://nycpokemap.com/quests.php")
    source_filter: str = os.getenv("SOURCE_FILTER", "4,0,890")
    target_pokemon: str = os.getenv("TARGET_POKEMON", "Eternatus")
    target_pokemon_id: str = os.getenv("TARGET_POKEMON_ID", "890")
    target_task: str = os.getenv("TARGET_TASK", "Make an Excellent Throw")
    cache_ttl: float = float(os.getenv("CACHE_TTL_SECONDS", "60"))
    min_source_interval: float = float(os.getenv("MIN_SOURCE_INTERVAL_SECONDS", "10"))
    allowed_origins: tuple = tuple(
        o.strip()
        for o in os.getenv(
            "ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173"
        ).split(",")
        if o.strip()
    )
    use_sample_data: bool = os.getenv("USE_SAMPLE_DATA", "0") == "1"


settings = Settings()
