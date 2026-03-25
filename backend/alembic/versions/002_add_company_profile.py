"""add company profile fields to users

Revision ID: 002
Revises: 001
Create Date: 2026-03-25 00:00:00.000000
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "002"
down_revision: Union[str, None] = "001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("users", sa.Column("primary_trade", sa.String(), nullable=True))
    op.add_column("users", sa.Column("phone", sa.String(), nullable=True))
    op.add_column("users", sa.Column("avg_contract_size", sa.Numeric(15, 2), nullable=True))
    op.add_column("users", sa.Column("target_margin", sa.Numeric(5, 2), nullable=True))
    op.add_column("users", sa.Column("monthly_fixed_costs", sa.Numeric(15, 2), nullable=True))
    op.add_column("users", sa.Column("labour_model", sa.String(), nullable=True))
    op.add_column("users", sa.Column("cash_reserves", sa.Numeric(15, 2), nullable=True))
    op.add_column("users", sa.Column("years_trading", sa.Numeric(5, 1), nullable=True))
    op.add_column("users", sa.Column("growth_goal", sa.String(), nullable=True))
    op.add_column("users", sa.Column("main_constraint", sa.String(), nullable=True))


def downgrade() -> None:
    op.drop_column("users", "main_constraint")
    op.drop_column("users", "growth_goal")
    op.drop_column("users", "years_trading")
    op.drop_column("users", "cash_reserves")
    op.drop_column("users", "labour_model")
    op.drop_column("users", "monthly_fixed_costs")
    op.drop_column("users", "target_margin")
    op.drop_column("users", "avg_contract_size")
    op.drop_column("users", "phone")
    op.drop_column("users", "primary_trade")
