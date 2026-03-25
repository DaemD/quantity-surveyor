import json
from pathlib import Path
from functools import lru_cache
from typing import Any

SCORING_PATH = Path(__file__).parent.parent / "config" / "scoring.json"


@lru_cache(maxsize=1)
def _load_config() -> dict[str, Any]:
    with open(SCORING_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def _num(val: Any, default: float = 0.0) -> float:
    try:
        return float(val)
    except (TypeError, ValueError):
        return default


def _factor_score(cfg: dict, key: str, answers: dict) -> tuple[int, int]:
    """Returns (points_earned, max_points) for a single factor."""
    factor = cfg.get(key, {})
    max_pts = factor.get("max", 0)
    value = str(answers.get(key, "")).lower().strip()
    points = factor.get("values", {}).get(value, 0)
    return points, max_pts


# ── Job Quality Score ──────────────────────────────────────────────────────────

def compute_job_quality(answers: dict[str, Any]) -> dict[str, Any]:
    cfg = _load_config()["job_quality"]
    factors_cfg = cfg["factors"]

    total_points = 0
    total_max = 0
    breakdown: dict[str, Any] = {}

    scored_factors = [
        "price_firmness", "payment_terms", "upfront_payment",
        "variations", "delay_damages", "programme_risk",
        "design_status", "provisional_sums", "material_supply",
        "weather_sensitive", "site_restrictions",
    ]

    for key in scored_factors:
        pts, mx = _factor_score(factors_cfg, key, answers)
        total_points += pts
        total_max += mx
        label = key.replace("_", " ").title()
        breakdown[key] = {"label": label, "value": answers.get(key), "points": pts, "max": mx}

    # Retention score (based on percentage)
    retention = _num(answers.get("retention", 5))
    ret_max = cfg["retention_max"]
    ret_thresholds = cfg["retention_thresholds"]
    if retention == 0:
        ret_pts = ret_max
    elif retention <= ret_thresholds["low"]:
        ret_pts = 4
    elif retention <= ret_thresholds["standard"]:
        ret_pts = 3
    else:
        ret_pts = 1
    total_points += ret_pts
    total_max += ret_max
    breakdown["retention"] = {"label": "Retention", "value": f"{retention}%", "points": ret_pts, "max": ret_max}

    # Margin score (computed from contract value and total cost)
    contract_value = _num(answers.get("contract_value", 0))
    total_cost = _num(answers.get("total_cost", 0))
    contingency = _num(answers.get("contingency", 0))

    if contract_value > 0:
        effective_cost = total_cost + contingency
        margin_pct = ((contract_value - effective_cost) / contract_value) * 100
    else:
        margin_pct = 0.0

    m_thresh = cfg["margin_thresholds"]
    m_max = cfg["margin_max"]
    if margin_pct >= m_thresh["excellent"]:
        m_pts = m_max
    elif margin_pct >= m_thresh["good"]:
        m_pts = 12
    elif margin_pct >= m_thresh["ok"]:
        m_pts = 9
    elif margin_pct >= m_thresh["low"]:
        m_pts = 6
    elif margin_pct >= m_thresh["poor"]:
        m_pts = 3
    else:
        m_pts = 0

    total_points += m_pts
    total_max += m_max
    breakdown["margin"] = {
        "label": "Profit Margin",
        "value": f"{round(margin_pct, 1)}%",
        "points": m_pts,
        "max": m_max,
    }

    normalized = round((total_points / total_max * 100) if total_max > 0 else 0)
    thresholds = cfg["thresholds"]

    if normalized >= thresholds["excellent"]:
        label = "excellent"
    elif normalized >= thresholds["good"]:
        label = "good"
    elif normalized >= thresholds["marginal"]:
        label = "marginal"
    else:
        label = "poor"

    return {
        "score": normalized,
        "raw_points": total_points,
        "max_points": total_max,
        "label": label,
        "margin_percent": round(margin_pct, 1),
        "contract_value": contract_value,
        "total_cost": total_cost,
        "expected_profit": round(contract_value - effective_cost if contract_value > 0 else 0, 2),
        "breakdown": breakdown,
    }


# ── Fit Score ─────────────────────────────────────────────────────────────────

def compute_fit(answers: dict[str, Any], profile: dict[str, Any]) -> dict[str, Any]:
    cfg = _load_config()["fit"]

    total_points = 0
    checks: dict[str, Any] = {}

    # Helper: get profile numbers with fallback
    avg_contract = _num(profile.get("avg_contract_size", 0)) or 50000
    target_margin = _num(profile.get("target_margin", 15))
    monthly_costs = _num(profile.get("monthly_fixed_costs", 0)) or 1
    cash_reserves = _num(profile.get("cash_reserves", 0))

    contract_value = _num(answers.get("contract_value", 0))
    total_cost = _num(answers.get("total_cost", 0))
    contingency = _num(answers.get("contingency", 0))
    duration_weeks = _num(answers.get("duration_weeks", 1)) or 1
    worst_overrun_cost = _num(answers.get("worst_case_overrun_cost", 0))
    worst_overrun_weeks = _num(answers.get("worst_case_overrun_weeks", 0))
    job_size_comparison = str(answers.get("job_size_comparison", "")).lower()

    effective_cost = total_cost + contingency

    # ── 1. Job Size (20 pts) ─────────────────────────────────────────────
    size_cfg = cfg["job_size"]
    size_map = {
        "smaller_than_usual": size_cfg["same_or_smaller"],
        "about_the_same": size_cfg["same_or_smaller"],
        "bigger_than_usual": size_cfg["slightly_bigger"],
        "much_bigger_than_usual": size_cfg["much_bigger"],
    }
    size_pts = size_map.get(job_size_comparison, size_cfg["slightly_bigger"])
    size_ratio = round(contract_value / avg_contract, 2) if avg_contract > 0 else 1.0
    total_points += size_pts
    checks["job_size"] = {
        "label": "Job Size Fit",
        "passed": size_pts >= size_cfg["slightly_bigger"],
        "points": size_pts,
        "max": size_cfg["same_or_smaller"],
        "detail": f"{size_ratio}x your average contract size",
    }

    # ── 2. Cashflow (25 pts) ─────────────────────────────────────────────
    weekly_burn = effective_cost / duration_weeks
    cash_needed = weekly_burn * cfg["cashflow_weeks_buffer"]
    partial_threshold = weekly_burn * cfg["cashflow"]["partial_weeks_min"]

    if cash_reserves >= cash_needed:
        cf_pts = cfg["cashflow"]["pass"]
        cf_passed = True
        cf_detail = f"Cash reserves ({_fmt_gbp(cash_reserves)}) cover {cfg['cashflow_weeks_buffer']} weeks burn"
    elif cash_reserves >= partial_threshold:
        cf_pts = cfg["cashflow"]["partial"]
        cf_passed = False
        cf_detail = f"Tight — reserves cover some but not full {cfg['cashflow_weeks_buffer']}-week buffer"
    else:
        cf_pts = cfg["cashflow"]["fail"]
        cf_passed = False
        cf_detail = f"Shortfall — need ~{_fmt_gbp(cash_needed)}, have {_fmt_gbp(cash_reserves)}"

    total_points += cf_pts
    checks["cashflow"] = {
        "label": "Cashflow Affordability",
        "passed": cf_passed,
        "points": cf_pts,
        "max": cfg["cashflow"]["pass"],
        "detail": cf_detail,
        "cash_needed": round(cash_needed, 2),
        "cash_reserves": cash_reserves,
        "weekly_burn": round(weekly_burn, 2),
    }

    # ── 3. Survival Buffer (20 pts) ──────────────────────────────────────
    months_buffer = cash_reserves / monthly_costs
    surv_cfg = cfg["survival"]
    if months_buffer >= surv_cfg["excellent_months"]:
        surv_pts = surv_cfg["points"]["excellent"]
    elif months_buffer >= surv_cfg["good_months"]:
        surv_pts = surv_cfg["points"]["good"]
    elif months_buffer >= surv_cfg["partial_months"]:
        surv_pts = surv_cfg["points"]["partial"]
    else:
        surv_pts = surv_cfg["points"]["fail"]

    total_points += surv_pts
    checks["survival"] = {
        "label": "Overhead Survival Buffer",
        "passed": months_buffer >= surv_cfg["good_months"],
        "points": surv_pts,
        "max": surv_cfg["points"]["excellent"],
        "detail": f"{round(months_buffer, 1)} months overhead cover",
        "months_buffer": round(months_buffer, 1),
    }

    # ── 4. Margin vs Target (15 pts) ─────────────────────────────────────
    if contract_value > 0:
        actual_margin = ((contract_value - effective_cost) / contract_value) * 100
    else:
        actual_margin = 0.0

    mv_cfg = cfg["margin_vs_target"]
    if actual_margin >= target_margin + mv_cfg["exceeds_by"]:
        mv_pts = mv_cfg["points"]["exceeds"]
    elif actual_margin >= target_margin:
        mv_pts = mv_cfg["points"]["meets"]
    elif actual_margin >= target_margin - mv_cfg["close_threshold"]:
        mv_pts = mv_cfg["points"]["close"]
    else:
        mv_pts = mv_cfg["points"]["below"]

    total_points += mv_pts
    checks["margin_vs_target"] = {
        "label": "Margin vs Your Target",
        "passed": actual_margin >= target_margin,
        "points": mv_pts,
        "max": mv_cfg["points"]["exceeds"],
        "detail": f"{round(actual_margin, 1)}% actual vs {target_margin}% target",
        "actual_margin": round(actual_margin, 1),
        "target_margin": target_margin,
    }

    # ── 5. Worst Case Survival (10 pts) ──────────────────────────────────
    worst_total_cost = effective_cost + worst_overrun_cost
    worst_margin = ((contract_value - worst_total_cost) / contract_value * 100) if contract_value > 0 else 0
    worst_burn = worst_total_cost / (duration_weeks + worst_overrun_weeks) if (duration_weeks + worst_overrun_weeks) > 0 else weekly_burn
    worst_cash_needed = worst_burn * cfg["cashflow_weeks_buffer"]

    wc_cfg = cfg["worst_case"]["points"]
    if worst_margin >= 0 and cash_reserves >= worst_cash_needed:
        wc_pts = wc_cfg["safe"]
        wc_passed = True
        wc_detail = f"Even in worst case, margin stays at {round(worst_margin, 1)}%"
    elif worst_margin >= 0:
        wc_pts = wc_cfg["tight"]
        wc_passed = False
        wc_detail = f"Worst-case margin {round(worst_margin, 1)}% — cashflow tight under overrun"
    else:
        wc_pts = wc_cfg["danger"]
        wc_passed = False
        wc_detail = f"Worst-case turns loss-making ({round(worst_margin, 1)}%)"

    total_points += wc_pts
    checks["worst_case"] = {
        "label": "Worst-Case Scenario",
        "passed": wc_passed,
        "points": wc_pts,
        "max": wc_cfg["safe"],
        "detail": wc_detail,
        "worst_margin_percent": round(worst_margin, 1),
    }

    # Normalize: max possible = 20+25+20+15+10 = 90
    max_possible = 90
    normalized = round((total_points / max_possible) * 100)
    normalized = min(normalized, 100)

    thresholds = cfg["thresholds"]
    if normalized >= thresholds["strong"]:
        fit_label = "strong"
    elif normalized >= thresholds["good"]:
        fit_label = "good"
    elif normalized >= thresholds["caution"]:
        fit_label = "caution"
    else:
        fit_label = "poor"

    return {
        "score": normalized,
        "raw_points": total_points,
        "max_points": max_possible,
        "label": fit_label,
        "checks": checks,
    }


# ── Combined Entry Point ───────────────────────────────────────────────────────

def compute_scores(answers: dict[str, Any], user_profile: dict[str, Any]) -> dict[str, Any]:
    job_quality = compute_job_quality(answers)
    fit = compute_fit(answers, user_profile)

    jq = job_quality["label"]
    ft = fit["label"]

    # Determine overall status and verdict
    if jq == "poor" or ft == "poor":
        status = "danger"
        verdict = "Decline or renegotiate — significant concerns with this job."
    elif jq == "marginal" and ft in ("caution", "poor"):
        status = "danger"
        verdict = "High risk on both commercial terms and company fit. Decline unless terms improve."
    elif jq in ("excellent", "good") and ft in ("strong", "good"):
        status = "excellent"
        verdict = "Proceed confidently — strong deal on good terms that suits your business."
    elif jq in ("excellent", "good") and ft == "caution":
        status = "good"
        verdict = "Good contract terms but watch your cashflow and capacity carefully."
    elif jq == "marginal" and ft in ("strong", "good"):
        status = "caution"
        verdict = "Your business can handle it, but the contract terms need attention."
    else:
        status = "caution"
        verdict = "Proceed with caution — review the flagged areas before signing."

    return {
        "status": status,
        "verdict": verdict,
        "job_quality": job_quality,
        "fit": fit,
        "commercial_score": job_quality["score"],
        "execution_score": fit["score"],
    }


def _fmt_gbp(v: float) -> str:
    return f"£{v:,.0f}"
