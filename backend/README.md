# InfraFrontier backend

## Run it
```
pip install -r requirements.txt
python test_core.py          # checks the math
uvicorn main:app --reload    # then open http://127.0.0.1:8000/docs
```

## Files
- `models.py` – return and risk for one project
- `optimizer.py` – brute-force efficient frontier
- `main.py` – API endpoints
- `data/constants.json` – every multiplier (all PLACEHOLDERS, cite sources)
- `data/demo_projects.json` – FAKE projects, replace before demo

## Endpoints
- `GET /demo-projects` – sample project list
- `POST /evaluate` – body: list of projects → each with `expected_return` and `risk`
- `POST /frontier` – body: `{"projects": [...], "budget": 5000000}` → evaluated projects + frontier points sorted by risk. Frontend slider picks the nearest point.

## Deploy on Render
New Web Service → connect repo → Build: `pip install -r requirements.txt` → Start: `uvicorn main:app --host 0.0.0.0 --port $PORT`
