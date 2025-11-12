import os
from datetime import datetime
from typing import List, Optional
import random

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi import UploadFile, File, Form, HTTPException
import dedupe
from pathlib import Path
import shutil
import pandas as pd

from models import RunConfig, KPIs, Node, SystemHealth, UnlearningRequest
import store

load_dotenv()

# ✅ define app FIRST
app = FastAPI(title="Federated Unlearning Demo Backend")

# ✅ then add CORS
origins = [
    os.getenv("FRONTEND_ORIGIN", "http://localhost:5173"),
    "http://127.0.0.1:5173",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
BASE_DIR      = Path(__file__).parent
DATA_DIR      = BASE_DIR / "data"
DATASETS_DIR  = DATA_DIR / "datasets"
DATA_DIR.mkdir(parents=True, exist_ok=True)
DATASETS_DIR.mkdir(parents=True, exist_ok=True)

# Map UI names to CSV files
DATASET_NAME_TO_FILE = {
    "MNIST":     "mnist.csv",
    "CIFAR-10":  "cifar10.csv",
    "CIFAR-100": "cifar100.csv",
}

# -------------------- Utilities --------------------

def _recompute_kpis_from_config(run_cfg: RunConfig) -> KPIs:
    """
    Lightweight, deterministic KPI simulation based on the chosen parameters.
    """
    base = store.read_state()
    # Start from the same total nodes & data points, adjust slightly
    total_nodes = len(base["nodes"])
    data_points = sum(n["data_points"] for n in base["nodes"])

    # Model accuracy: small negative impact with higher duplicate ratio & clients_affected.
    penalty = 0.05 * run_cfg.attack.duplicate_ratio + 0.03 * run_cfg.attack.clients_affected
    penalty /= 10.0  # scale down
    acc = max(80.0, 96.0 - penalty)

    # Privacy score: higher if DP is enabled and audit log kept; small boost for "Certified".
    privacy = 92.0
    if run_cfg.gdpr.enable_dp:
        privacy += 3.0
    if run_cfg.gdpr.keep_audit_log:
        privacy += 2.0
    if run_cfg.gdpr.unlearning_mode == "Certified":
        privacy += 1.5
    privacy = min(99.5, privacy)

    return KPIs(
        total_nodes=total_nodes,
        data_points=data_points,
        model_accuracy=round(acc, 1),
        privacy_score=round(privacy, 1),
    )

# -------------------- Endpoints --------------------

@app.get("/api/health")
def health():
    return {"status": "ok"}

@app.post("/api/config/apply", response_model=KPIs)
def apply_config(run: RunConfig):
    """
    Save current configuration and simulate a run affecting the KPIs.
    Matches the dashboard 'Apply & Start Run' button.
    """
    state = store.read_state()
    state["run_config"] = run.model_dump()
    # Simulate slight node changes (e.g., a node toggles syncing randomly)
    for n in state["nodes"]:
        if random.random() < 0.15:
            n["status"] = "syncing"
        else:
            n["status"] = "active"
    # Recompute KPIs
    kpis = _recompute_kpis_from_config(run)
    state["kpis"] = kpis.model_dump()
    store.write_state(state)
    return kpis

@app.get("/api/kpis", response_model=KPIs)
def get_kpis():
    state = store.read_state()
    return KPIs(**state["kpis"])

@app.get("/api/nodes", response_model=List[Node])
def get_nodes():
    state = store.read_state()
    return [Node(**n) for n in state["nodes"]]

@app.get("/api/health/metrics", response_model=SystemHealth)
def get_health_metrics():
    state = store.read_state()
    return SystemHealth(**state["health"])

@app.post("/api/unlearning/start", response_model=UnlearningRequest)
def start_unlearning():
    """
    Simulate a new unlearning job and append to history.
    """
    state = store.read_state()
    req_id = str(random.randint(1850, 9999))
    removed = random.randint(500, 2500)
    entry = {
        "request_id": req_id,
        "removed_points": removed,
        "status": "processing",
        "created_at": datetime.utcnow().isoformat() + "Z",
    }
    state["unlearning"].insert(0, entry)
    # keep last 10
    state["unlearning"] = state["unlearning"][:10]
    store.write_state(state)
    return UnlearningRequest(**entry)

@app.get("/api/unlearning/requests", response_model=List[UnlearningRequest])
def get_unlearning_requests():
    state = store.read_state()
    # Occasionally mark the oldest "processing" as "completed" for demo effect
    for r in state["unlearning"]:
        if r["status"] == "processing" and random.random() < 0.4:
            r["status"] = "completed"
    store.write_state(state)
    return [UnlearningRequest(**r) for r in state["unlearning"]]

@app.post("/api/data/upload")
async def upload_data(file: UploadFile = File(...)):
    """
    Upload a dataset (CSV or JSON). Stored under data/input.csv or data/input.json.
    """
    content = await file.read()
    dedupe.DATA_DIR.mkdir(parents=True, exist_ok=True)

    suffix = (file.filename or "").lower()
    if suffix.endswith(".csv"):
        path = dedupe.INPUT_CSV
    elif suffix.endswith(".json"):
        path = dedupe.INPUT_JSON
    else:
        raise HTTPException(status_code=400, detail="Only .csv or .json files are supported.")

    path.write_bytes(content)
    # Small validation
    try:
        df, _ = dedupe.load_dataframe()
        head_cols = list(df.columns)[:6]
        head_rows = min(5, len(df))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse file: {e}")

    return {
        "message": "Uploaded successfully.",
        "stored_as": str(path.name),
        "columns": head_cols,
        "preview_rows": head_rows
    }

@app.get("/api/dedupe/preview")
def preview_dedupe(cols: Optional[str] = None, sample_rows: int = 1000):
    """
    Preview exact duplicates on a sample. cols is a comma-separated list of column names, or omitted for all columns.
    """
    cols_list: Optional[List[str]] = [c.strip() for c in cols.split(",")] if cols else None
    try:
        out = dedupe.preview_duplicates(cols_list, sample_rows=sample_rows)
        return out
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="No dataset found. Upload via /api/data/upload first.")

@app.post("/api/dedupe/run")
def run_dedupe(cols: Optional[str] = Form(default=None), near_threshold: int = Form(default=90)):
    """
    Run dedup (exact + near-duplicate on sample) and save deduped output (exact-only) to data/deduped.csv/json.
    Form fields:
      - cols: optional comma-separated column names to dedupe on (default: all columns)
      - near_threshold: token similarity threshold (0-100, default 90)
    """
    cols_list: Optional[List[str]] = [c.strip() for c in cols.split(",")] if cols else None
    try:
        summary = dedupe.run_dedupe(cols_list, near_threshold=near_threshold)
        return {
            "rows_before": summary.rows_before,
            "rows_after": summary.rows_after,
            "exact_duplicate_count": summary.exact_dup_count,
            "near_duplicate_pairs_sampled": summary.near_dup_pairs,
            "sampled_for_near_dups": summary.sampled,
            "top_clusters": summary.top_clusters,
            "output_files": {
                "csv": str(dedupe.DEDUPED_CSV.name) if dedupe.DEDUPED_CSV.exists() else None,
                "json": str(dedupe.DEDUPED_JSON.name) if dedupe.DEDUPED_JSON.exists() else None,
            }
        }
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="No dataset found. Upload via /api/data/upload first.")

@app.post("/api/unlearning/delete_subject")
def delete_subject(
    subject_id: str = Form(...),
    subject_column: str = Form("data_subject_id"),
):
    """
    Remove rows where <subject_column> == subject_id from the current input dataset and resave it.
    """
    import pandas as pd
    try:
        df, which = dedupe.load_dataframe()
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="No dataset found. Upload via /api/data/upload first.")

    if subject_column not in df.columns:
        raise HTTPException(status_code=400, detail=f"Column '{subject_column}' not found in dataset.")

    before = len(df)
    df2 = df[df[subject_column].astype(str) != str(subject_id)].copy()
    removed = int(before - len(df2))

    if which == "csv":
        df2.to_csv(dedupe.INPUT_CSV, index=False)
    else:
        df2.to_json(dedupe.INPUT_JSON, orient="records")

    return {"removed": removed, "rows_remaining": int(len(df2))}
@app.get("/api/datasets")
def list_datasets():
    items = []
    for ui_name, fname in DATASET_NAME_TO_FILE.items():
        p = DATASETS_DIR / fname
        if p.exists():
            items.append({"name": ui_name, "rows": sum(1 for _ in open(p)) - 1})
    state = store.read_state()
    return {"items": items, "active": state.get("active_dataset", "MNIST")}

@app.post("/api/datasets/select")
def select_dataset(payload: dict):
    name = payload.get("name")
    if name not in DATASET_NAME_TO_FILE:
        raise HTTPException(status_code=400, detail="Unsupported dataset")

    src = DATASETS_DIR / DATASET_NAME_TO_FILE[name]
    if not src.exists():
        raise HTTPException(status_code=404, detail=f"Dataset file missing: {src.name}")

    # Copy into dedupe's expected INPUT path so /api/dedupe/* works unchanged
    dedupe.DATA_DIR.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(src, dedupe.INPUT_CSV)

    # Read to compute row count and resize nodes
    df = pd.read_csv(dedupe.INPUT_CSV)
    rows = len(df)

    # Update persistent state
    state = store.read_state()
    state["active_dataset"] = name

    # choose node count per dataset for a nice visual variety
    nodes_by_ds = {"MNIST": 5, "CIFAR-10": 6, "CIFAR-100": 8}
    node_count = nodes_by_ds.get(name, 5)
    AU_NODES = [
        "Victoria","New South Wales","Queensland","Northern Territory",
        "South Australia","Western Australia","Australian Capital Territory","Tasmania"
    ][:node_count]

    per_node = rows // node_count if node_count else 0
    state["nodes"] = [
        {"name": n, "status": "active", "data_points": per_node} for n in AU_NODES
    ]

    # refresh KPIs’ totals (accuracy/privacy still recomputed by /api/config/apply)
    k = state.get("kpis", {})
    k["total_nodes"] = node_count
    k["data_points"] = rows
    state["kpis"] = k

    store.write_state(state)
    return {"ok": True, "active": name, "rows": rows, "nodes": node_count}