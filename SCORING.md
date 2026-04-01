# QS Ai — Scoring System Reference

Every assessment produces two independent scores, each out of 100.
This document explains exactly how both are calculated, including all thresholds, point values, and a fully worked example.

---

## Dummy Data Used Throughout This Document

### Company Profile (registered once at sign-up)

| Field | Value |
|---|---|
| Average contract size | £80,000 |
| Target profit margin | 15% |
| Monthly fixed costs (overheads) | £8,000 |
| Cash reserves | £35,000 |

### Job Form (filled per assessment) — "Office Fit-Out, Leeds"

| Field | Value |
|---|---|
| Contract value | £120,000 |
| Total cost (labour + materials) | £98,000 |
| Contingency | £4,000 |
| Duration | 10 weeks |
| Worst-case overrun cost | £8,000 |
| Worst-case extra time | 3 weeks |
| Retention | 3% |
| Deposit | 0% |
| Price firmness | Reasonably firm |
| Payment terms | Stage payments |
| Upfront payment | No |
| Variations | Written before work |
| LAD damages | No |
| Programme risk | Shared |
| Design status | Mostly defined |
| Provisional sums | Minor (<10%) |
| Material supply | Contractor supplies all |
| Weather sensitive | No |
| Site restrictions | No |

---

## Score 1 — Job Quality Score

> **Question answered: "Is this a good contract on paper?"**
> Uses only the job form answers. Your company profile plays no part.

### How it is calculated

13 factors are scored. 11 are select fields looked up in a table. 2 are computed from the numbers you enter.

Raw points are summed, divided by the total possible, and multiplied by 100:

```
score = round( (raw_points / total_max) × 100 )
```

### Factor point table

| Factor | Max pts | Options → Points |
|---|---|---|
| Price Firmness | 10 | Very firm = 10, Reasonably firm = 7, Early estimate = 3, Very rough = 0 |
| Payment Terms | 10 | Weekly/monthly = 10, Dayworks/cost-plus = 8, Stage payments = 7, End of job = 3 |
| Upfront Payment | 5 | Yes = 5, Unsure = 3, No = 0 |
| Variations | 10 | Written before work = 10, Written after = 7, Verbal = 3, No process = 0 |
| LAD Damages | 5 | No LADs = 5, Unsure = 3, Yes LADs = 0 |
| Programme Risk | 5 | Client carries = 5, Shared = 3, Unsure = 2, Contractor = 1 |
| Design Status | 10 | Fully defined = 10, Mostly defined = 7, Gaps = 3, Largely undefined = 0 |
| Provisional Sums | 5 | None = 5, Minor = 3, Unsure = 2, Significant = 0 |
| Material Supply | 5 | Client supplied = 5, Split = 3, Unsure = 2, Contractor supplies = 1 |
| Weather Sensitive | 3 | No = 3, Yes = 0 |
| Site Restrictions | 3 | No = 3, Unsure = 1, Yes = 0 |
| **Retention** | **5** | Computed — see below |
| **Profit Margin** | **15** | Computed — see below |
| **Total** | **91** | |

### Retention scoring

```
retention % entered → band → points
```

| Retention entered | Points |
|---|---|
| 0% | 5 |
| > 0% and ≤ 3% | 4 |
| > 3% and ≤ 5% | 3 |
| > 5% | 1 |

### Margin scoring

```
effective_cost = total_cost + contingency
margin_pct     = (contract_value − effective_cost) / contract_value × 100
```

| Margin % | Points |
|---|---|
| ≥ 25% | 15 |
| ≥ 20% | 12 |
| ≥ 15% | 9 |
| ≥ 10% | 6 |
| ≥ 5% | 3 |
| < 5% | 0 |

### Label thresholds

| Normalised score | Label |
|---|---|
| ≥ 75 | Excellent Deal |
| ≥ 55 | Good Deal |
| ≥ 35 | Marginal Deal |
| < 35 | Poor Deal |

---

### Worked example — Job Quality

**Select factor scores:**

| Factor | Answer | Points | Max |
|---|---|---|---|
| Price Firmness | Reasonably firm | 7 | 10 |
| Payment Terms | Stage payments | 7 | 10 |
| Upfront Payment | No | 0 | 5 |
| Variations | Written before work | 10 | 10 |
| LAD Damages | No | 5 | 5 |
| Programme Risk | Shared | 3 | 5 |
| Design Status | Mostly defined | 7 | 10 |
| Provisional Sums | Minor | 3 | 5 |
| Material Supply | Contractor supplies | 1 | 5 |
| Weather Sensitive | No | 3 | 3 |
| Site Restrictions | No | 3 | 3 |
| **Subtotal** | | **49** | **71** |

**Computed: Retention**

```
3% retention → low band (> 0 and ≤ 3%) → 4 pts
```

**Computed: Margin**

```
effective_cost = £98,000 + £4,000 = £102,000
margin_pct     = (£120,000 − £102,000) / £120,000 × 100
             = £18,000 / £120,000 × 100
             = 15.0%

15.0% is ≥ 15% ("ok" band) → 9 pts
```

**Total:**

```
raw_points = 49 + 4 + 9 = 62
total_max  = 71 + 5 + 15 = 91

score = round(62 / 91 × 100) = round(68.1) = 68 / 100
```

**Result: 68/100 — GOOD DEAL**

> Expected profit: £120,000 − £102,000 = **£18,000**

---

## Score 2 — Fit Score

> **Question answered: "Can your business handle this specific job?"**
> Uses both the job form answers AND your company profile.

### How it is calculated

Five checks are run. Each produces a points value. All five are summed and normalised:

```
score = round( (raw_points / 90) × 100 )
```

The total possible is 90 (20 + 25 + 20 + 15 + 10).

### Check 1 — Job Size Fit (max 20 pts)

```
ratio = contract_value / avg_contract_size
```

| Ratio | Label | Points |
|---|---|---|
| ≤ 1.1× | Same or smaller | 20 |
| ≤ 1.75× | Slightly bigger | 15 |
| ≤ 3.0× | Significantly bigger | 8 |
| > 3.0× | Much bigger | 0 |

**Example:**
```
£120,000 / £80,000 = 1.5×
1.5 is ≤ 1.75 → "slightly bigger" → 15 pts
```

---

### Check 2 — Cashflow Affordability (max 25 pts)

```
weekly_burn   = (total_cost + contingency) / duration_weeks
weeks_covered = cash_reserves / weekly_burn
```

| Weeks covered | Points |
|---|---|
| ≥ 4 weeks | 25 |
| ≥ 3 weeks | 20 |
| ≥ 2 weeks | 12 |
| ≥ 1 week | 6 |
| < 1 week | 0 |

**Example:**
```
weekly_burn   = £102,000 / 10 = £10,200 / week
weeks_covered = £35,000 / £10,200 = 3.43 weeks

3.43 is ≥ 3 and < 4 → 20 pts
```

---

### Check 3 — Overhead Survival Buffer (max 20 pts)

> This check is based entirely on your company profile. It measures financial resilience independent of any specific job.

```
months_buffer = cash_reserves / monthly_fixed_costs
```

| Months covered | Points |
|---|---|
| ≥ 6 months | 20 |
| ≥ 3 months | 15 |
| ≥ 1 month | 8 |
| < 1 month | 0 |

**Example:**
```
months_buffer = £35,000 / £8,000 = 4.375 months

4.375 is ≥ 3 and < 6 → 15 pts
```

---

### Check 4 — Margin vs Your Target (max 15 pts)

```
actual_margin = (contract_value − effective_cost) / contract_value × 100
```

| Condition | Points |
|---|---|
| actual_margin ≥ target + 5% | 15 |
| actual_margin ≥ target | 12 |
| actual_margin ≥ target − 5% | 8 |
| actual_margin < target − 5% | 0 |

**Example:**
```
actual_margin = 15.0%
target_margin = 15%

15.0% ≥ 15% (meets target, not exceeding by 5%+) → 12 pts
```

---

### Check 5 — Worst-Case Scenario (max 10 pts)

```
worst_total_cost    = effective_cost + worst_case_overrun_cost
worst_margin        = (contract_value − worst_total_cost) / contract_value × 100
total_worst_weeks   = duration_weeks + worst_case_overrun_weeks
worst_burn          = worst_total_cost / total_worst_weeks
worst_weeks_covered = cash_reserves / worst_burn
```

| Condition | Points |
|---|---|
| worst_margin ≥ 0% AND worst_weeks_covered ≥ 4 | 10 |
| worst_margin ≥ 0% AND worst_weeks_covered ≥ 2 | 5 |
| worst_margin ≥ 0% AND worst_weeks_covered < 2 | 5 |
| worst_margin < 0% (loss-making) | 0 |

**Example:**
```
worst_total_cost    = £102,000 + £8,000 = £110,000
worst_margin        = (£120,000 − £110,000) / £120,000 × 100 = 8.3%
total_worst_weeks   = 10 + 3 = 13 weeks
worst_burn          = £110,000 / 13 = £8,461 / week
worst_weeks_covered = £35,000 / £8,461 = 4.14 weeks

worst_margin (8.3%) ≥ 0% AND worst_weeks_covered (4.14) ≥ 4 → 10 pts
```

---

### Fit Score label thresholds

| Normalised score | Label |
|---|---|
| ≥ 75 | Strong Fit |
| ≥ 55 | Good Fit |
| ≥ 35 | Caution |
| < 35 | Poor Fit |

---

### Worked example — Fit Score total

| Check | Points | Max |
|---|---|---|
| Job Size Fit | 15 | 20 |
| Cashflow Affordability | 20 | 25 |
| Overhead Survival Buffer | 15 | 20 |
| Margin vs Your Target | 12 | 15 |
| Worst-Case Scenario | 10 | 10 |
| **Total** | **72** | **90** |

```
score = round(72 / 90 × 100) = round(80.0) = 80 / 100
```

**Result: 80/100 — STRONG FIT**

---

## Overall Status

The two labels are combined to produce one verdict:

| Job Quality label | Fit label | Overall status | Verdict |
|---|---|---|---|
| Excellent / Good | Strong / Good | **EXCELLENT** | Proceed confidently |
| Excellent / Good | Caution | **GOOD** | Good terms but watch cashflow |
| Marginal | Strong / Good | **CAUTION** | Business can handle it but terms need attention |
| Marginal | Caution / Poor | **DANGER** | High risk — decline unless terms improve |
| Poor (either score) | Any | **DANGER** | Decline or renegotiate |

**Dummy example result:**

```
Job Quality = 68 → "good"
Fit Score   = 80 → "strong"

good + strong → EXCELLENT
Verdict: "Proceed confidently — strong deal on good terms that suits your business."
```

---

## Maximum Possible Scores

### Job Quality — max 100/100
All select fields at best option + 0% retention + margin ≥ 25%.

### Fit Score — max 100/100
Requires all five checks at maximum simultaneously:

| Check | Condition for max |
|---|---|
| Job Size | contract_value ≤ 1.1× your average |
| Cashflow | cash_reserves cover ≥ 4 weeks of burn |
| Survival | cash_reserves ≥ 6 months of overheads |
| Margin | actual margin ≥ target + 5% |
| Worst Case | worst-case margin ≥ 0% AND reserves still cover ≥ 4 weeks |

> Note: Survival buffer is driven entirely by your company profile (cash reserves and monthly costs). A company with thin reserves is genuinely capped on fit score regardless of how good the job is.

---

## Configuration

All point values and thresholds are stored in `backend/app/config/scoring.json`.
No code changes are needed to adjust weights — edit the JSON file and redeploy the backend.
