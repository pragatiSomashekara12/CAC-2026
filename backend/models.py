"""Return and risk calculations for one project.

Plain Python, no FastAPI, so you can test and explain it on its own.
Every multiplier comes from data/constants.json, never hard-coded here.
"""
import json
from pathlib import Path

DATA_DIR = Path(__file__).parent / "data"


def load_constants():
    with open(DATA_DIR / "constants.json") as f:
        return json.load(f)


def present_value_factor(rate, years):
    """$1/year for `years` years is worth this much today (annuity formula)."""
    if rate == 0:
        return years
    return (1 - (1 + rate) ** -years) / rate


def expected_return(project, c):
    """Expected benefit in today's dollars = time savings + property uplift + new tax revenue."""
    years = c["analysis_years"]
    pv = present_value_factor(c["discount_rate"], years)

    # 1. Driver time savings: trips/day * hours saved per trip * $/hour * 365, then discounted
    hours_saved_per_year = project["daily_traffic"] * project["minutes_saved_per_trip"] / 60 * 365
    time_savings = hours_saved_per_year * c["value_of_time_per_hour"] * pv

    # 2. One-time increase in nearby property values
    uplift_pct = c["property_uplift_pct"][project["type"]]
    property_gain = project["nearby_property_value"] * uplift_pct

    # 3. Extra property tax each year on that gain, discounted
    tax_gain = property_gain * project["tax_rate"] * pv

    total = time_savings + property_gain + tax_gain
    return {
        "time_savings": round(time_savings),
        "property_gain": round(property_gain),
        "tax_gain": round(tax_gain),
        "total": round(total),
    }


def risk(project, c):
    """Cost-overrun risk from reference class forecasting.

    Look up how far projects of this type usually run over (mean) and how much
    that varies (sd). Shrink both for small projects. Risk in dollars = cost * sd.
    """
    rc = c["reference_class"][project["type"]]
    mean_pct, sd_pct = rc["mean_overrun_pct"], rc["sd_overrun_pct"]

    if project["cost"] < c["small_project_threshold"]:
        mean_pct *= c["small_project_scale"]
        sd_pct *= c["small_project_scale"]

    cost = project["cost"]
    return {
        "mean_overrun_pct": round(mean_pct, 4),
        "sd_overrun_pct": round(sd_pct, 4),
        "expected_cost": round(cost * (1 + mean_pct)),   # what it will likely really cost
        "risk_dollars": round(cost * sd_pct),            # 1 standard deviation of overrun, in $
    }


def evaluate(project, c=None):
    c = c or load_constants()
    r = expected_return(project, c)
    k = risk(project, c)
    return {**project, "expected_return": r, "risk": k}
