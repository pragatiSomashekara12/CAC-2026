"""FastAPI app. Thin layer: all math lives in models.py and optimizer.py.

Run locally:  uvicorn main:app --reload
Interactive docs: http://127.0.0.1:8000/docs
"""
import json
from typing import List
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from models import evaluate, load_constants, DATA_DIR
from optimizer import efficient_frontier

app = FastAPI(title="InfraFrontier API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # TODO: replace with your Vercel URL before submitting
    allow_methods=["*"],
    allow_headers=["*"],
)


class Project(BaseModel):
    id: str
    name: str
    type: str = Field(description="road, bridge, or water")
    location: str
    cost: float = Field(gt=0)
    daily_traffic: float = 0
    minutes_saved_per_trip: float = 0
    nearby_property_value: float = 0
    tax_rate: float = 0


class FrontierRequest(BaseModel):
    projects: List[Project]
    budget: float = Field(gt=0)


def _evaluate_all(projects):
    c = load_constants()
    bad = [p.type for p in projects if p.type not in c["reference_class"]]
    if bad:
        raise HTTPException(400, f"Unsupported project type(s): {bad}")
    return [evaluate(p.model_dump(), c) for p in projects]


@app.get("/")
def health():
    return {"status": "ok"}


@app.get("/demo-projects")
def demo_projects():
    """Sample projects so the frontend has something to load."""
    with open(DATA_DIR / "demo_projects.json") as f:
        return json.load(f)["projects"]


@app.post("/evaluate")
def evaluate_projects(projects: List[Project]):
    return _evaluate_all(projects)


@app.post("/frontier")
def frontier(req: FrontierRequest):
    if len(req.projects) > 20:
        raise HTTPException(400, "Max 20 projects")
    evaluated = _evaluate_all(req.projects)
    return {
        "projects": evaluated,
        "frontier": efficient_frontier(evaluated, req.budget),
    }
