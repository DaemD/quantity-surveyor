import json
from pathlib import Path
from functools import lru_cache
from typing import Any

SCORING_PATH = Path(__file__).parent.parent / "config" / "scoring.json"


@lru_cache(maxsize=1)
def _load_scoring_config() -> dict[str, Any]:
    with open(SCORING_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def compute_scores(answers: dict[str, Any]) -> dict[str, Any]:
    config = _load_scoring_config()
    exec_cfg = config["execution"]
    weights = exec_cfg["weights"]
    overall_cfg = config["overall"]

    # ── Commercial Score ──────────────────────────────────────────────────────
    commercial_score = 0
    commercial_breakdown: list[dict] = []
    commercial_answers = answers.get("commercial", {})

    for question_id, value in commercial_answers.items():
        try:
            score = int(value)
        except (TypeError, ValueError):
            score = 0
        commercial_score += score
        commercial_breakdown.append({"id": question_id, "value": score})

    # ── Execution Score ───────────────────────────────────────────────────────
    execution_answers = answers.get("execution", {})

    def get_num(key: str, default: float = 0.0) -> float:
        try:
            return float(execution_answers.get(key, default))
        except (TypeError, ValueError):
            return default

    contract_value = get_num("contractValue")
    total_cost = get_num("totalCost")
    duration_weeks = get_num("durationWeeks", 1)
    target_margin = get_num("targetMargin", 15)
    cash_reserves = get_num("cashReserves")
    monthly_fixed_costs = get_num("monthlyFixedCosts", 1)
    avg_contract_size = get_num("avgContractSize", 1)
    worst_case_overrun_cost = get_num("worstCaseOverrunCost")
    worst_case_overrun_time = get_num("worstCaseOverrunTime")

    # Guard against division by zero
    if duration_weeks <= 0:
        duration_weeks = 1
    if monthly_fixed_costs <= 0:
        monthly_fixed_costs = 1
    if avg_contract_size <= 0:
        avg_contract_size = 1
    if contract_value <= 0:
        contract_value = 1

    # Profit check
    expected_profit = contract_value - total_cost
    margin = (expected_profit / contract_value) * 100
    meets_target = margin >= target_margin

    # Cashflow check
    weekly_burn = total_cost / duration_weeks
    cash_required = weekly_burn * exec_cfg["cashflow_weeks_buffer"]
    can_afford = cash_reserves >= cash_required

    # Survival buffer check
    months_buffer = cash_reserves / monthly_fixed_costs
    can_survive = months_buffer >= exec_cfg["survival_months_min"]

    # Job size check
    ratio = contract_value / avg_contract_size
    is_too_big = ratio > exec_cfg["jobsize_ratio_max"]

    # Worst-case affordability
    worst_case_total_cost = total_cost + worst_case_overrun_cost
    worst_case_duration = duration_weeks + worst_case_overrun_time
    worst_case_margin = ((contract_value - worst_case_total_cost) / contract_value) * 100

    # Execution score
    execution_score = 0
    execution_score += weights["profit_pass"] if meets_target else weights["profit_fail"]
    execution_score += weights["cashflow_pass"] if can_afford else weights["cashflow_fail"]
    execution_score += weights["survival_pass"] if can_survive else weights["survival_fail"]
    execution_score += weights["jobsize_pass"] if not is_too_big else weights["jobsize_fail"]

    # ── Recommendation ────────────────────────────────────────────────────────
    if not can_afford and not can_survive:
        recommendation = "DANGER: High risk of insolvency. Decline or renegotiate terms."
    elif not can_afford:
        recommendation = "CAUTION: Cashflow is extremely tight. Ensure upfront payment."
    elif not can_survive:
        recommendation = "CAUTION: Low buffer in worst-case scenario. Manage carefully."
    elif is_too_big:
        recommendation = "Proceed with caution: Job size is large relative to normal operations."
    elif not meets_target:
        recommendation = "Sub-optimal margin, but financially viable to execute."
    else:
        recommendation = "Proceed confidently."

    # ── Overall Status ────────────────────────────────────────────────────────
    if "DANGER" in recommendation:
        status = "danger"
    elif "CAUTION" in recommendation:
        status = "caution"
    elif (
        commercial_score > overall_cfg["excellent_commercial_min"]
        and execution_score > overall_cfg["excellent_execution_min"]
    ):
        status = "excellent"
    else:
        status = "good"

    return {
        "commercial_score": commercial_score,
        "execution_score": execution_score,
        "status": status,
        "recommendation": recommendation,
        "commercial": {
            "score": commercial_score,
            "breakdown": commercial_breakdown,
        },
        "execution": {
            "score": execution_score,
            "contract_value": contract_value,
            "total_cost": total_cost,
            "expected_profit": round(expected_profit, 2),
            "margin_percent": round(margin, 2),
            "meets_target": meets_target,
            "target_margin": target_margin,
            "weekly_burn": round(weekly_burn, 2),
            "cash_required": round(cash_required, 2),
            "cash_reserves": cash_reserves,
            "can_afford": can_afford,
            "months_buffer": round(months_buffer, 2),
            "can_survive": can_survive,
            "job_size_ratio": round(ratio, 2),
            "is_too_big": is_too_big,
            "worst_case_total_cost": round(worst_case_total_cost, 2),
            "worst_case_duration_weeks": worst_case_duration,
            "worst_case_margin_percent": round(worst_case_margin, 2),
        },
    }
