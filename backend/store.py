import json
from pathlib import Path
from typing import Any, Dict

DATA_DIR = Path(__file__).parent / "data"
STATE_FILE = DATA_DIR / "state.json"

DEFAULT_STATE: Dict[str, Any] = {
    "run_config": {
        "dataset": {"name": "CIFAR-10"},
        "attack": {
            "type": "Duplication",
            "duplicate_ratio": 10,
            "clients_affected": 50,
            "strategy": "Random",
            "target_class": "Auto",
        },
        "gdpr": {
            "data_subject_id": None,
            "unlearning_mode": "Certified",
            "retention_days": 30,
            "enable_dp": False,
            "epsilon": 8.0,
            "keep_audit_log": True,
        },
    },
    "kpis": {
        "total_nodes": 5,
        "data_points": 69820,
        "model_accuracy": 94.2,
        "privacy_score": 98.5,
    },
    "nodes": [
        {"name": "Node Alpha", "status": "active",  "data_points": 15420, "duplication": 8,  "region": "VIC"},
        {"name": "Node Bravo", "status": "active",  "data_points": 12850, "duplication": 12, "region": "NSW"},
        {"name": "Node Golf",  "status": "syncing", "data_points": 18200, "duplication": 5,  "region": "ACT"},
        {"name": "Node Delta", "status": "active",  "data_points": 9750,  "duplication": 10, "region": "WA"},
        {"name": "Node Echo",  "status": "active",  "data_points": 13600, "duplication": 7,  "region": "QLD"},
    ],
    "health": {
        "network_latency_ms": 42,
        "synchronisation": 92,
        "privacy_compliance": 98,
    },
    "unlearning": [
        {"request_id": "1847", "removed_points": 2340, "status": "completed",  "created_at": "2025-11-11T10:15:00Z"},
        {"request_id": "1846", "removed_points": 1120, "status": "completed",  "created_at": "2025-11-11T05:08:00Z"},
        {"request_id": "1845", "removed_points": 860,  "status": "processing", "created_at": "2025-11-10T23:41:00Z"},
    ],
}

def _ensure():
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    if not STATE_FILE.exists():
        STATE_FILE.write_text(json.dumps(DEFAULT_STATE, indent=2))

def read_state() -> Dict[str, Any]:
    _ensure()
    return json.loads(STATE_FILE.read_text())

def write_state(state: Dict[str, Any]) -> None:
    _ensure()
    STATE_FILE.write_text(json.dumps(state, indent=2))