import uuid
from datetime import datetime, timezone
from decimal import Decimal

from sqlalchemy import DateTime, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String, nullable=False)
    email: Mapped[str] = mapped_column(String, unique=True, nullable=False, index=True)
    hashed_password: Mapped[str] = mapped_column(String, nullable=False)
    company_name: Mapped[str] = mapped_column(String, nullable=False)
    registration_number: Mapped[str | None] = mapped_column(String, nullable=True)
    address: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    # Company profile fields
    primary_trade: Mapped[str | None] = mapped_column(String, nullable=True)
    phone: Mapped[str | None] = mapped_column(String, nullable=True)
    avg_contract_size: Mapped[Decimal | None] = mapped_column(Numeric(15, 2), nullable=True)
    target_margin: Mapped[Decimal | None] = mapped_column(Numeric(5, 2), nullable=True)
    monthly_fixed_costs: Mapped[Decimal | None] = mapped_column(Numeric(15, 2), nullable=True)
    labour_model: Mapped[str | None] = mapped_column(String, nullable=True)
    cash_reserves: Mapped[Decimal | None] = mapped_column(Numeric(15, 2), nullable=True)
    years_trading: Mapped[Decimal | None] = mapped_column(Numeric(5, 1), nullable=True)
    growth_goal: Mapped[str | None] = mapped_column(String, nullable=True)
    main_constraint: Mapped[str | None] = mapped_column(String, nullable=True)

    assessments: Mapped[list["Assessment"]] = relationship("Assessment", back_populates="user", lazy="select")
