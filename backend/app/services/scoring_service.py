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

    # ── 1. Job Size (20 pts) — scored from actual contract/avg ratio ─────
    size_cfg = cfg["job_size"]
    size_pts_map = size_cfg["points"]
    size_thresh = size_cfg["thresholds"]
    size_ratio = round(contract_value / avg_contract, 2) if avg_contract > 0 else 1.0

    if size_ratio <= size_thresh["same_or_smaller"]:
        size_pts = size_pts_map["same_or_smaller"]
        size_label = "same or smaller than your average"
    elif size_ratio <= size_thresh["slightly_bigger"]:
        size_pts = size_pts_map["slightly_bigger"]
        size_label = "slightly bigger than your average"
    elif size_ratio <= size_thresh["bigger"]:
        size_pts = size_pts_map["bigger"]
        size_label = "significantly bigger than your average"
    else:
        size_pts = size_pts_map["much_bigger"]
        size_label = "much bigger than your average — high stretch risk"

    total_points += size_pts
    checks["job_size"] = {
        "label": "Job Size Fit",
        "passed": size_pts >= size_pts_map["slightly_bigger"],
        "points": size_pts,
        "max": size_pts_map["same_or_smaller"],
        "detail": f"{size_ratio}x your average — {size_label}",
    }

    # ── 2. Cashflow (25 pts) — graded by weeks of burn covered ──────────
    weekly_burn = effective_cost / duration_weeks
    weeks_covered = cash_reserves / weekly_burn if weekly_burn > 0 else 99

    cf_cfg = cfg["cashflow"]
    if weeks_covered >= 4:
        cf_pts = cf_cfg["weeks_4"]
        cf_passed = True
        cf_detail = f"Reserves cover {weeks_covered:.1f} weeks burn — healthy buffer"
    elif weeks_covered >= 3:
        cf_pts = cf_cfg["weeks_3"]
        cf_passed = True
        cf_detail = f"Reserves cover {weeks_covered:.1f} weeks — adequate but tight"
    elif weeks_covered >= 2:
        cf_pts = cf_cfg["weeks_2"]
        cf_passed = False
        cf_detail = f"Reserves cover {weeks_covered:.1f} weeks — below recommended 4-week buffer"
    elif weeks_covered >= 1:
        cf_pts = cf_cfg["weeks_1"]
        cf_passed = False
        cf_detail = f"Reserves cover only {weeks_covered:.1f} week — serious cashflow risk"
    else:
        cf_pts = cf_cfg["fail"]
        cf_passed = False
        cf_detail = f"Reserves cover less than 1 week of burn — cashflow danger"

    cash_needed_4wk = weekly_burn * 4
    total_points += cf_pts
    checks["cashflow"] = {
        "label": "Cashflow Affordability",
        "passed": cf_passed,
        "points": cf_pts,
        "max": cf_cfg["weeks_4"],
        "detail": cf_detail,
        "cash_needed": round(cash_needed_4wk, 2),
        "cash_reserves": cash_reserves,
        "weekly_burn": round(weekly_burn, 2),
        "weeks_covered": round(weeks_covered, 1),
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
    total_worst_weeks = duration_weeks + worst_overrun_weeks
    worst_burn = worst_total_cost / total_worst_weeks if total_worst_weeks > 0 else weekly_burn
    worst_weeks_covered = cash_reserves / worst_burn if worst_burn > 0 else 99

    wc_cfg = cfg["worst_case"]["points"]
    if worst_margin >= 0 and worst_weeks_covered >= 4:
        wc_pts = wc_cfg["safe"]
        wc_passed = True
        wc_detail = f"Even in worst case, margin stays at {round(worst_margin, 1)}% with cashflow intact"
    elif worst_margin >= 0 and worst_weeks_covered >= 2:
        wc_pts = wc_cfg["tight"]
        wc_passed = False
        wc_detail = f"Worst-case margin {round(worst_margin, 1)}% — cashflow gets tight under overrun"
    elif worst_margin >= 0:
        wc_pts = wc_cfg["tight"]
        wc_passed = False
        wc_detail = f"Worst-case margin {round(worst_margin, 1)}% — but cashflow under serious pressure"
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
        "worst_weeks_covered": round(worst_weeks_covered, 1),
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
