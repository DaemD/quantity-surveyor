from datetime import datetime
from typing import Any
from pydantic import BaseModel


class AssessmentCreate(BaseModel):
    title: str
    answers: dict[str, Any]


class AssessmentListItem(BaseModel):
    id: str
    title: str
    created_at: datetime
    status: str
    contract_value: float | None = None
    commercial_score: int | None = None
    execution_score: int | None = None

    model_config = {"from_attributes": True}


class AssessmentOut(BaseModel):
    id: str
    user_id: str
    title: str
    created_at: datetime
    status: str
    contract_value: float | None = None
    commercial_score: int | None = None
    execution_score: int | None = None
    answers: dict[str, Any] | None = None
    results: dict[str, Any] | None = None

    model_config = {"from_attributes": True}
