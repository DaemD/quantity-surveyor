from fastapi import APIRouter
from typing import Any

from app.services.questions_service import get_questions

router = APIRouter()


@router.get("/questions", response_model=dict[str, Any])
async def questions():
    return get_questions()
