"""Sanity checks for the math. Run: python test_core.py"""
import json
from models import evaluate, load_constants, DATA_DIR
from optimizer import efficient_frontier

c = load_constants()
projects = json.load(open(DATA_DIR / "demo_projects.json"))["projects"]
ev = [evaluate(p, c) for p in projects]
total_cost = sum(p["cost"] for p in projects)

print("Per-project:")
for p in ev:
    print(f'  {p["id"]} {p["type"]:6} cost ${p["cost"]:>10,.0f}  '
          f'return ${p["expected_return"]["total"]:>12,}  risk ${p["risk"]["risk_dollars"]:>9,}')


def check(budget):
    f = efficient_frontier(ev, budget)
    # budget respected
    assert all(x["total_cost"] <= budget for x in f)
    # frontier is monotonic: more risk always buys more return
    for a, b in zip(f, f[1:]):
        assert b["risk"] >= a["risk"] and b["total_return"] > a["total_return"]
    return f


f = check(5_000_000)
print(f"\nBudget $5M -> {len(f)} frontier points")
for x in f:
    print(f'  risk ${x["risk"]:>9,}  return ${x["total_return"]:>12,}  cost ${x["total_cost"]:>10,}  {x["project_ids"]}')

assert check(100_000) == []                     # tiny budget: nothing fits, no crash
big = check(total_cost * 10)                    # huge budget: top point funds everything
assert len(big[-1]["project_ids"]) == len(projects)
print("\nAll checks passed.")
