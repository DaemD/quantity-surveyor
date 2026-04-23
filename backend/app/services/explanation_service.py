import json
import logging
import os
from typing import Any

import httpx

logger = logging.getLogger(__name__)

OPENAI_CHAT_URL = "https://api.openai.com/v1/chat/completions"
PROMPT_VERSION = "v1"

SYSTEM_PROMPT = """You are a helpful assistant for UK construction contractors reviewing a pre-contract risk assessment.

Rules (must follow):
- You only EXPLAIN the data provided. Do NOT recalculate scores, do NOT invent new scores, and do NOT contradict the numbers or labels in assessment_report.
- Use plain English. Short paragraphs and bullet points are fine.
- Ground every claim in assessment_report or company_profile. If something is missing, say it is not provided.
- This is decision-support, not legal or financial advice. Avoid definitive words like "must" for legal outcomes; prefer "consider", "worth checking", "you may want to".

Output: valid JSON only, with exactly these keys:
- "job_quality_plain": string — easy explanation of job_quality (contract terms / commercial side) for a non-lawyer reader.
- "fit_plain": string — easy explanation of fit (whether the job suits this company's finances/capacity) using company_profile context where relevant.
"""


async def generate_explanations_llm(
    user_profile: dict[str, Any],
    assessment_report: dict[str, Any],
) -> dict[str, Any]:
    """Call OpenAI chat completions; return dict with job_quality_plain, fit_plain, model, prompt_version."""
    api_key = (os.getenv("OPENAI_API_KEY") or "").strip()
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY is not set")

    model = (os.getenv("OPENAI_MODEL") or "gpt-4o-mini").strip()
    user_payload = {
        "company_profile": user_profile,
        "assessment_report": assessment_report,
    }
    body = {
        "model": model,
        "temperature": 0.35,
        "response_format": {"type": "json_object"},
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {
                "role": "user",
                "content": json.dumps(user_payload, ensure_ascii=False),
            },
        ],
    }

    async with httpx.AsyncClient(timeout=httpx.Timeout(60.0, connect=15.0)) as client:
        resp = await client.post(
            OPENAI_CHAT_URL,
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            json=body,
        )
        try:
            resp.raise_for_status()
        except httpx.HTTPStatusError as e:
            logger.warning("OpenAI HTTP error: %s %s", e.response.status_code, e.response.text[:500])
            raise

    data = resp.json()
    try:
        content = data["choices"][0]["message"]["content"]
    except (KeyError, IndexError, TypeError) as e:
        logger.warning("Unexpected OpenAI response shape: %s", data)
        raise RuntimeError("Invalid response from language model") from e

    parsed = json.loads(content)
    jq = (parsed.get("job_quality_plain") or "").strip()
    ft = (parsed.get("fit_plain") or "").strip()
    if not jq or not ft:
        raise RuntimeError("Model returned empty explanation fields")

    return {
        "job_quality_plain": jq,
        "fit_plain": ft,
        "model": model,
        "prompt_version": PROMPT_VERSION,
    }


async def persist_explanations(assessment_id: str, user_profile: dict[str, Any], results: dict[str, Any]) -> None:
    """Load assessment by id, generate LLM explanations, save (or save error payload)."""
    from sqlalchemy import select

    from app.core.database import AsyncSessionLocal
    from app.models.assessment import Assessment

    try:
        expl = await generate_explanations_llm(user_profile, results)
    except Exception:
        logger.exception("Explanation generation failed for assessment %s", assessment_id)
        expl = {
            "error": "Could not generate plain-English summary. Try again later.",
            "prompt_version": PROMPT_VERSION,
            "status": "failed",
        }

    async with AsyncSessionLocal() as session:
        res = await session.execute(select(Assessment).where(Assessment.id == assessment_id))
        row = res.scalar_one_or_none()
        if row is None:
            return
        row.explanations = expl
        await session.commit()
