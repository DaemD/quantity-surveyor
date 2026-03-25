from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.assessment import Assessment
from app.schemas.assessment import AssessmentCreate, AssessmentListItem, AssessmentOut
from app.services.scoring_service import compute_scores

router = APIRouter()


def _user_profile(user: User) -> dict:
    return {
        "avg_contract_size": float(user.avg_contract_size) if user.avg_contract_size else 0,
        "target_margin": float(user.target_margin) if user.target_margin else 15,
        "monthly_fixed_costs": float(user.monthly_fixed_costs) if user.monthly_fixed_costs else 0,
        "cash_reserves": float(user.cash_reserves) if user.cash_reserves else 0,
        "labour_model": user.labour_model,
        "growth_goal": user.growth_goal,
        "main_constraint": user.main_constraint,
        "years_trading": float(user.years_trading) if user.years_trading else 0,
    }


@router.post("", response_model=AssessmentOut, status_code=status.HTTP_201_CREATED)
async def create_assessment(
    body: AssessmentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    results = compute_scores(body.answers, _user_profile(current_user))

    assessment = Assessment(
        user_id=current_user.id,
        title=body.title,
        status=results["status"],
        contract_value=results["job_quality"].get("contract_value"),
        commercial_score=results["commercial_score"],
        execution_score=results["execution_score"],
        answers=body.answers,
        results=results,
    )
    db.add(assessment)
    await db.flush()
    await db.refresh(assessment)
    return AssessmentOut.model_validate(assessment)


@router.get("", response_model=list[AssessmentListItem])
async def list_assessments(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Assessment)
        .where(Assessment.user_id == current_user.id)
        .order_by(desc(Assessment.created_at))
    )
    return [AssessmentListItem.model_validate(a) for a in result.scalars().all()]


@router.get("/{assessment_id}", response_model=AssessmentOut)
async def get_assessment(
    assessment_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Assessment).where(
            Assessment.id == assessment_id,
            Assessment.user_id == current_user.id,
        )
    )
    assessment = result.scalar_one_or_none()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
    return AssessmentOut.model_validate(assessment)
