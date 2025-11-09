# ICT30018 (CYBER) — P10 Backend (AU Regions)
Run:
```
python -m venv .venv
# Windows: .venv\Scripts\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
uvicorn app:app --reload --port 8000
```
Endpoints:
- POST /run — accepts `{ dataset, attack, gdpr, defense, train }`
- GET /nodes — AU-region nodes (VIC/NSW/QLD/SA/WA/TAS/ACT/NT)
- GET /metrics — summary metrics
Notes:
- Uses your `dataset_prep.py` if present; otherwise stubs.
- `defense.flshield` is a placeholder flag that nudges modelAccuracy slightly for demo.
