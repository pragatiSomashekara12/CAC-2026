"""Efficient frontier by brute force.

Projects are all-or-nothing, so instead of stock-portfolio math with fractional
weights, we try every combination. With 20 projects that's ~1 million subsets,
which runs in a few seconds. It's simple and provably finds the true frontier.
"""
from itertools import combinations
import math

MAX_PROJECTS = 20  # 2^20 ≈ 1M combos; beyond this brute force gets slow


def portfolio_stats(projects):
    cost = sum(p["cost"] for p in projects)
    ret = sum(p["expected_return"]["total"] for p in projects)
    # Assume projects' overruns are independent: variances add, so risk = sqrt(sum of risk^2)
    risk = math.sqrt(sum(p["risk"]["risk_dollars"] ** 2 for p in projects))
    return cost, ret, risk


def efficient_frontier(evaluated, budget):
    if len(evaluated) > MAX_PROJECTS:
        raise ValueError(f"Brute force supports up to {MAX_PROJECTS} projects")

    # Step 1: score every combination that fits the budget
    candidates = []
    for size in range(1, len(evaluated) + 1):
        for combo in combinations(evaluated, size):
            cost, ret, risk = portfolio_stats(combo)
            if cost <= budget:
                candidates.append({
                    "project_ids": [p["id"] for p in combo],
                    "total_cost": cost,
                    "total_return": ret,
                    "risk": round(risk),
                })

    # Step 2: keep only combos where nothing else has lower-or-equal risk AND higher return.
    # Sort by risk; walk upward and keep a combo only if it beats the best return seen so far.
    candidates.sort(key=lambda x: (x["risk"], -x["total_return"]))
    frontier, best_return = [], -1
    for c in candidates:
        if c["total_return"] > best_return:
            frontier.append(c)
            best_return = c["total_return"]
    return frontier
