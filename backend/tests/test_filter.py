import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from app.services.quest_filter import filter_quests  # noqa: E402
from app.utils.coordinates import parse_lat, parse_lng  # noqa: E402

RAW = json.loads((ROOT / "sample_quests.json").read_text(encoding="utf-8"))["quests"]


def test_filters_dedupes_and_validates():
    out = filter_quests(RAW)
    assert [q.name for q in out] == ["Sample Stop A", "Sample Stop B"]
    assert all(q.pokemon == "Eternatus" and q.quest == "Make an Excellent Throw" for q in out)


def test_whitespace_case_and_id_matching():
    rec = {"lat": "1.5", "lng": "2.5", "name": "x", "rewards_string": "Candy",
           "conditions_string": "  make AN excellent  throw ", "rewards_ids": "890"}
    assert len(filter_quests([rec])) == 1


def test_non_dict_and_missing_fields_ignored():
    assert filter_quests([None, 5, {}, {"conditions_string": "Make an Excellent Throw"}]) == []


def test_substring_task_not_matched():
    rec = {"lat": 1, "lng": 2, "rewards_string": "Eternatus",
           "conditions_string": "Make 3 Excellent Throws in a row"}
    assert filter_quests([rec]) == []


def test_coordinate_bounds():
    assert parse_lat(90) == 90 and parse_lat(90.1) is None
    assert parse_lng(-180) == -180 and parse_lng("abc") is None and parse_lng(None) is None
    assert parse_lat(float("nan")) is None
