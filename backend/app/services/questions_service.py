import json
from pathlib import Path
from functools import lru_cache
from typing import Any

QUESTIONS_PATH = Path(__file__).parent.parent / "config" / "questions.json"


@lru_cache(maxsize=1)
def load_questions() -> dict[str, Any]:
    with open(QUESTIONS_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def get_questions() -> dict[str, Any]:
    return load_questions()
