import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, Integer, Numeric, String
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Assessment(Base):
    __tablename__ = "assessments"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    status: Mapped[str] = mapped_column(String, nullable=False, default="good")
    contract_value: Mapped[float | None] = mapped_column(Numeric(15, 2), nullable=True)
    commercial_score: Mapped[int | None] = mapped_column(Integer, nullable=True)
    execution_score: Mapped[int | None] = mapped_column(Integer, nullable=True)
    answers: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    results: Mapped[dict | None] = mapped_column(JSONB, nullable=True)

    user: Mapped["User"] = relationship("User", back_populates="assessments")
