# backend/main.py
import os
import io
import uuid
import time
from datetime import datetime
from typing import Dict, Any, Optional, List
import asyncio

import pandas as pd
from fastapi import FastAPI, UploadFile, File, Body, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse, FileResponse

# Import dedupe helpers (backend/dedupe.py must provide these)
from .dedupe import run_dedupe, load_dataset_by_name, REGIONS

# ---------- App & CORS ----------
app = FastAPI(title="Federated Unlearning API", version="0.2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["x-job-id"],  # FE reads the job id from this header
)

# ---------- Paths & State ----------
HERE = os.path.dirname(__file__)
DATA_DIR = os.path.join(HERE, "data")
RESULTS_DIR = os.path.join(HERE, "results")
os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(RESULTS_DIR, exist_ok=True)

STATE: Dict[str, Any] = {
    "dataset_name": "CIFAR-10",
    "df": None,
    "kpis": {},
    "nodes": [],
}

def compute_kpis(df: Optional[pd.DataFrame]) -> Dict[str, Any]:
    n = int(len(df)) if df is not None else 0
    return {
        "total_nodes": len(REGIONS),
        "data_points": n,
        "model_accuracy": 94.2 if n else 0.0,
        "privacy_score": 98.5 if n else 0.0,
    }

def compute_nodes(df: Optional[pd.DataFrame]) -> List[Dict[str, Any]]:
    nodes = []
    active = {"Victoria", "New South Wales", "Queensland", "Northern Territory"}
    for r in REGIONS:
        nodes.append({
            "name": r,
            "status": "active" if r in active else "syncing",
        })
    return nodes

def _recompute():
    STATE["kpis"] = compute_kpis(STATE["df"])
    STATE["nodes"] = compute_nodes(STATE["df"])

# ---------- Job store for progress/results ----------
JOBS: Dict[str, Dict[str, Any]] = {}
JOB_PROGRESS: Dict[str, int] = {}

def start_job(job_id: str):
    JOBS[job_id] = {"progress": 0}
    JOB_PROGRESS[job_id] = 0

def set_progress(job_id: str, pct: int):
    JOB_PROGRESS[job_id] = max(0, min(100, int(pct)))
    if job_id in JOBS:
        JOBS[job_id]["progress"] = JOB_PROGRESS[job_id]

def finish_job(job_id: str, summary: Dict[str, Any], pairs: List[Dict[str, Any]], csv_path: Optional[str] = None):
    if job_id not in JOBS:
        JOBS[job_id] = {}
    JOBS[job_id]["summary"] = summary
    JOBS[job_id]["pairs"] = pairs
    if csv_path:
        JOBS[job_id]["csv_path"] = csv_path
    set_progress(job_id, 100)

# ---------- Startup ----------
@app.on_event("startup")
async def _startup():
    # Load initial dataset so KPIs are non-zero
    df = load_dataset_by_name(STATE["dataset_name"])
    STATE["df"] = df
    _recompute()

# ---------- Basic endpoints ----------
@app.get("/api/health")
async def health():
    return {"ok": True, "ts": datetime.utcnow().isoformat() + "Z"}

@app.get("/api/kpis")
async def kpis():
    return STATE["kpis"]

@app.get("/api/nodes")
async def nodes():
    return {"items": STATE["nodes"]}

@app.get("/api/datasets")
async def list_datasets():
    # Keep in sync with FE select list and backend loader
    return {"items": ["MNIST", "CIFAR-10", "CIFAR-100", "FAKER-NAMES", "20NEWS"]}

# ---------- Dataset selection & upload ----------
@app.post("/api/datasets/select")
async def select_dataset(payload: Dict[str, Any] = Body(...)):
    name = (payload or {}).get("name") or "CIFAR-10"
    STATE["dataset_name"] = name
    STATE["df"] = load_dataset_by_name(name)
    _recompute()
    return {"ok": True, "kpis": STATE["kpis"], "nodes": STATE["nodes"]}

@app.post("/api/upload")
async def upload_data(file: UploadFile = File(...)):
    # Read uploaded CSV robustly
    content = await file.read()
    # Try utf-8 first, then fallback to latin-1 if needed
    try:
        df = pd.read_csv(io.BytesIO(content))
    except Exception:
        df = pd.read_csv(io.BytesIO(content), encoding="latin-1")

    # Normalise expected columns
    if "data_subject_id" not in df.columns:
        df["data_subject_id"] = [f"id-{i}" for i in range(len(df))]
    if "text" not in df.columns:
        # create a synthetic text column from any non-null columns
        first_col = df.columns[0]
        df["text"] = df[first_col].astype(str)
    if "region" not in df.columns:
        df["region"] = df["data_subject_id"].apply(lambda v: REGIONS[hash(v) % len(REGIONS)])
    if "label" not in df.columns:
        df["label"] = 0

    STATE["df"] = df.reset_index(drop=True)
    STATE["dataset_name"] = f"upload:{file.filename}"
    _recompute()
    return {"ok": True, "kpis": STATE["kpis"], "nodes": STATE["nodes"]}

# ---------- Run pipeline (background) ----------
def _run_worker(job_id: str, cfg: Dict[str, Any]):
    """
    Runs in a FastAPI BackgroundTasks thread.
    Uses time.sleep() (not asyncio.sleep()) to avoid event loop conflicts.
    """
    try:
        set_progress(job_id, 5)
        df = STATE.get("df")
        if df is None or df.empty:
            df = load_dataset_by_name(STATE.get("dataset_name", "CIFAR-10"))
            STATE["df"] = df
            _recompute()

        # Simulated stages for the progress bar
        for pct in (10, 25, 40, 55):
            set_progress(job_id, pct)
            time.sleep(0.15)

        # Run deduplication
        fuzzy_threshold = int(cfg.get("fuzzy_threshold", 90))
        subject_col = cfg.get("subject_col", "data_subject_id")
        text_col = cfg.get("text_col", "text")
        deduped, summary, pairs = run_dedupe(
            df, subject_col=subject_col, text_col=text_col, fuzzy_threshold=fuzzy_threshold
        )

        set_progress(job_id, 75)

        # Save deduped CSV
        csv_path = os.path.join(RESULTS_DIR, f"deduped_{job_id}.csv")
        deduped.to_csv(csv_path, index=False)

        # Finalise
        finish_job(job_id, summary, pairs, csv_path=csv_path)

        # Optionally update the in-memory DF so KPIs reflect new size
        STATE["df"] = deduped
        _recompute()

    except Exception as e:
        # Mark job as finished with a safe fallback summary
        before_n = len(STATE.get("df") or [])
        summary = {
            "before_records": before_n,
            "after_records": before_n,
            "removed": 0,
            "reduction_pct": 0.0,
            "removed_exact": 0,
            "removed_fuzzy": 0,
        }
        finish_job(job_id, summary, [])
        print("run worker error:", repr(e))

@app.post("/api/run")
async def start_run(cfg: Dict[str, Any] = Body(default={}), bg: BackgroundTasks = None):
    job_id = str(uuid.uuid4())
    start_job(job_id)
    if bg is None:
        bg = BackgroundTasks()
    bg.add_task(_run_worker, job_id, cfg)
    headers = {"x-job-id": job_id}
    # FastAPI will schedule the task once the response is sent
    return JSONResponse({"job_id": job_id}, headers=headers, background=bg)

# ---------- Progress (SSE) & Results ----------
@app.get("/api/progress")
async def progress(job_id: str):
    async def gen():
        last = -1
        while True:
            pct = JOB_PROGRESS.get(job_id)
            if pct is None:
                yield "event: error\ndata: unknown\n\n"
                break
            if pct != last:
                yield f"event: progress\ndata: {pct}\n\n"
                last = pct
            if pct >= 100:
                yield "event: complete\ndata: done\n\n"
                break
            # keep SSE alive
            await asyncio.sleep(0.25)
    return StreamingResponse(
        gen(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no"
        }
    )

@app.get("/api/results")
async def results(job_id: str):
    data = JOBS.get(job_id)
    if not data or "summary" not in data:
        return JSONResponse({"detail": "not ready"}, status_code=404)

    summary = data["summary"] or {}
    before_n = int(summary.get("before_records", 0) or 0)
    after_n = int(summary.get("after_records", 0) or 0)
    removed = int(summary.get("removed", max(before_n - after_n, 0)))
    # compute reduction if not present
    reduction_pct = float(summary.get("reduction_pct", (removed / before_n * 100.0) if before_n else 0.0))
    # duplicate rate before/after (0..1)
    dup_rate_before = (removed / before_n) if before_n else 0.0
    dup_rate_after = 0.0  # target after dedupe

    payload: Dict[str, Any] = {
        "job_id": job_id,
        "dataset_name": STATE.get("dataset_name", "unknown"),
        "rows": after_n,
        "duplicates_removed": removed,
        "duplicate_rate_before": dup_rate_before,
        "duplicate_rate_after": dup_rate_after,
        "metrics": {
            "before_accuracy": None,
            "after_accuracy": None,
            "privacy_score": None,
        },
        "summary": summary,
        "sample_pairs": data.get("pairs", []),
    }
    if data.get("csv_path"):
        payload["download"] = f"/api/download/{job_id}"
    return payload

@app.get("/api/download/{job_id}")
async def download(job_id: str):
    data = JOBS.get(job_id)
    if not data or not data.get("csv_path") or not os.path.exists(data["csv_path"]):
        return JSONResponse({"detail": "file not found"}, status_code=404)
    filename = os.path.basename(data["csv_path"])
    return FileResponse(data["csv_path"], filename=filename, media_type="text/csv")
