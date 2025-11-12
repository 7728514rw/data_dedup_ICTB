# Federated Unlearning Dashboard

An interactive dashboard for experimenting with duplication attacks and GDPR-compliant unlearning. The frontend is built with **React + Vite + Tailwind**, while the backend (FastAPI) synthesises datasets, injects duplicates, and exposes progress/KPI endpoints.

## TL;DR Quickstart (classic view) 
If you prefer the original lightweight summary, here it is for reference:

**New features added (per feedback):**
- Dataset switcher:
  - MNIST, CIFAR-10, CIFAR-100
  - Phishing-URLs, Windows-EventLog, NSL-KDD sample
- Attack parameter selection (type, duplicate ratio, strategy, clients affected, target class)
- GDPR parameters (subject ID, unlearning mode, retention, DP on/off + epsilon, audit log)

```bash
npm install
npm run dev
```
Open the printed URL (e.g. http://localhost:5173).

Configure backend (optional):
```
VITE_API_URL=http://localhost:8000
```
The "Apply & Start Run" button posts the config to your backend (code is stubbed — uncomment to enable).

## Highlights
- **Dataset manager** – switch between MNIST/CIFAR/security datasets or upload your own CSV (with override toggle & remove button).
- **Attack configuration** – presets, strategy selector, sliders for clients affected & duplicate ratio, dataset-aware target classes, live impact estimate.
- **GDPR controls** – subject ID validation, retention chips, DP toggle with epsilon slider, audit-log switch, compliance summary text.
- **Realtime jobs** – SSE / polling based progress bar, history table, downloadable deduped CSV, fuzzy match samples.
- **Demo marketing content** – optional “Get More Info” modal that displays static educational pages (can be gated via UI button).

## Repo Layout
```
backend/        FastAPI service (datasets, dedupe, job runner)
backend/data/   Generated CSVs (phishing, Windows events, NSL-KDD sample, etc.)
backend/results/Job outputs (deduped CSVs)
src/            React app (FederatedUnlearningDashboard.jsx, App.jsx)
README.md       This file
```

## Requirements
- Node.js 18+ and npm
- Python 3.10+ (for FastAPI backend)

## Setup
1. **Install frontend deps**
   ```bash
   npm install
   ```
2. **Configure env (frontend → backend URL)**
   ```bash
   cp .env.local.example .env.local   # if example exists
   echo "VITE_API_URL=http://localhost:8000" >> .env.local
   ```
3. **Install backend deps & run API**
   ```bash
   cd backend
   python -m venv .venv && source .venv/bin/activate
   pip install -r requirements.txt
   uvicorn main:app --reload --port 8000
   ```
4. **Run frontend**
   ```bash
   npm run dev
   ```
   Open the printed URL (default http://localhost:5173).

## Synthetic Datasets
The backend ships with generators under `backend/dedupe.py` that create CSVs in `backend/data/`:
- `Phishing-URLs` – fake brand/phishing links with duplicates & fuzzy perturbations
- `Windows-EventLog` – synthetic log lines with host/user combos
- `NSL-KDD sample` – simplified flow records with attack labels

Selecting a dataset (via dropdown or `/api/datasets/select`) loads the corresponding CSV into memory and updates KPIs.

## Key API Endpoints
| Method | Endpoint | Purpose |
| ------ | -------- | ------- |
| GET    | `/api/health`   | Backend health metadata |
| GET    | `/api/kpis`     | Summary metrics (nodes, data points, accuracy, etc.) |
| GET    | `/api/nodes`    | Node list for front-end visualisation |
| POST   | `/api/datasets/select` | Switch demo dataset |
| POST   | `/api/upload`   | Accept user CSV (expects `data_subject_id` column) |
| POST   | `/api/run`      | Kick off dedupe job (attack/GDPR config included) |
| GET    | `/api/progress` | SSE/polling progress updates |
| GET    | `/api/results`  | Final summary, sample pairs, download link |

## Development Tips
- `src/FederatedUnlearningDashboard.jsx` is the main UI; most tweaks happen there.
- To adjust synthetic datasets, edit `backend/dedupe.py` (helpers `_inject_duplicates`, `load_*`).
- When adding frontend env vars, mirror the key in `vite.config.js` if necessary.
- For production builds, run `npm run build` and serve `dist/`.

## Testing / Linting
Front-end: `npm run build` (Vite checks).  
Back-end: use `pytest` if you add tests, currently manual verification via API calls.

## Contributing
1. Create a feature branch.
2. Update README/docs if behaviour changes.
3. Lint/format both frontend and backend code.
4. Open a PR describing dataset/UI/backend changes.

Enjoy experimenting with federated unlearning! If you discover issues or want to add new datasets/attack types, open an issue or PR.
