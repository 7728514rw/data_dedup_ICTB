from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Literal, Optional
import random, time
import numpy as np

# Import real helpers if available; otherwise fall back to stubs
try:
    from dataset_prep import load_dataset, create_non_iid_partitions, inject_duplications
except Exception:
    def load_dataset(name):
        n = 60000 if name == "MNIST" else 50000
        return list(range(n))
    def create_non_iid_partitions(dataset, num_clients=5, alpha=0.5):
        n = len(dataset); size = n // num_clients
        return [dataset[i*size:(i+1)*size] for i in range(num_clients)]
    def inject_duplications(partition, duplication_rate=0.1):
        dup_count = int(len(partition) * duplication_rate)
        return partition + partition[:dup_count]

app = FastAPI(title="ICT30018 P10 — Deduplication & Unlearning API", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AttackConfig(BaseModel):
    type: Literal["duplication","label_poison","backdoor"] = "duplication"
    duplicateRatio: int = 10
    strategy: Literal["random","class_skewed","client_skewed"] = "random"
    targetClass: str = "auto"
    clientsAffected: int = 50

class GdprConfig(BaseModel):
    subjectId: str = ""
    unlearningMode: Literal["certified","hard_delete"] = "certified"
    dpEnabled: bool = False
    epsilon: float = 8.0
    retentionDays: int = 30
    auditLog: bool = True

class DefenseConfig(BaseModel):
    flshield: bool = False

class TrainConfig(BaseModel):
    numClients: int = 5
    rounds: int = 5

class RunRequest(BaseModel):
    dataset: Literal["MNIST","CIFAR-10","CIFAR-100"] = "CIFAR-10"
    attack: AttackConfig
    gdpr: GdprConfig
    defense: Optional[DefenseConfig] = DefenseConfig()
    train: Optional[TrainConfig] = TrainConfig()

AU_REGIONS = [
    "VIC - Melbourne","VIC - Regional","NSW - Sydney","NSW - Regional","QLD - Brisbane","QLD - Regional",
    "SA - Adelaide","WA - Perth","TAS - Hobart","ACT - Canberra","NT - Darwin",
]

STATE = {
    "nodes": [],
    "metrics": {
        "totalNodes": 0,
        "activeNodes": 0,
        "totalDataPoints": 0,
        "unlearningRequests": 0,
        "modelAccuracy": 0.0,
        "privacyScore": 0.0
    },
    "last_config": None
}

def _estimate_privacy_score(cfg: GdprConfig) -> float:
    score = 90.0
    if cfg.dpEnabled: score += max(0, 5 - min(5, cfg.epsilon / 2))
    if cfg.auditLog: score += 2
    if cfg.unlearningMode == "hard_delete": score += 2
    return float(min(99.9, round(score, 1)))

def _make_nodes(partitions, affected_ids, duplicate_ratio):
    nodes = []
    for idx, part in enumerate(partitions):
        size = len(part)
        dup = (duplicate_ratio/100.0) if idx in affected_ids else 0.0
        region = random.choice(AU_REGIONS)
        nodes.append({
            "id": idx,
            "name": f"Node {idx+1}",
            "status": "active",
            "dataPoints": int(size * (1 + dup)),
            "duplicateRatio": round(dup, 3),
            "region": region
        })
    return nodes

@app.get("/health")
def health():
    return {"ok": True, "ts": time.time()}

@app.get("/nodes")
def nodes():
    return {"nodes": STATE["nodes"]}

@app.get("/metrics")
def metrics():
    return {"metrics": STATE["metrics"]}

@app.post("/run")
def run(cfg: RunRequest):
    ds_name = "MNIST" if cfg.dataset == "MNIST" else "CIFAR-10"
    dataset = load_dataset(ds_name)

    num_clients = max(2, min(50, cfg.train.numClients if cfg.train else 5))
    parts = create_non_iid_partitions(dataset, num_clients=num_clients, alpha=0.5)

    affected_pct = max(1, min(100, cfg.attack.clientsAffected))
    k_aff = max(1, int(num_clients * affected_pct / 100))
    affected_ids = set(np.random.choice(range(num_clients), size=k_aff, replace=False))

    injected = []
    for i, p in enumerate(parts):
        if cfg.attack.type == "duplication" and i in affected_ids:
            injected.append(inject_duplications(p, duplication_rate=cfg.attack.duplicateRatio/100.0))
        else:
            injected.append(p)

    nodes = _make_nodes(injected, affected_ids, cfg.attack.duplicateRatio)

    total_points = sum(n["dataPoints"] for n in nodes)
    active_nodes = sum(1 for n in nodes if n["status"] == "active")
    avg_dup = np.mean([n["duplicateRatio"] for n in nodes]) if nodes else 0.0
    # toy accuracy: degradation with duplication; improvement if defense enabled (tiny)
    model_acc = float(round(max(70.0, 93.0 - 12 * avg_dup + (0.5 if (cfg.defense and cfg.defense.flshield) else 0.0)), 1))
    privacy_score = _estimate_privacy_score(cfg.gdpr)

    STATE["nodes"] = nodes
    STATE["metrics"] = {
        "totalNodes": len(nodes),
        "activeNodes": active_nodes,
        "totalDataPoints": int(total_points),
        "unlearningRequests": STATE["metrics"]["unlearningRequests"] + 1,
        "modelAccuracy": model_acc,
        "privacyScore": privacy_score,
    }
    STATE["last_config"] = cfg.model_dump()

    return {"nodes": nodes, "metrics": STATE["metrics"], "configEcho": STATE["last_config"]}
