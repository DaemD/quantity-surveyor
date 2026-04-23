"""add explanations jsonb to assessments

Revision ID: 003
Revises: 002
Create Date: 2026-04-23 00:00:00.000000
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects.postgresql import JSONB

revision: str = "003"
down_revision: Union[str, None] = "002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("assessments", sa.Column("explanations", JSONB(astext_type=sa.Text()), nullable=True))


def downgrade() -> None:
    op.drop_column("assessments", "explanations")
