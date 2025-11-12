# store.py
from __future__ import annotations
from dataclasses import dataclass, field
from typing import Dict, Any, List, Optional
from datetime import datetime

@dataclass
class Job:
    id: str
    status: str = "queued"            # queued | running | complete | error
    progress: int = 0                 # 0..100
    started_at: Optional[str] = None
    finished_at: Optional[str] = None
    config: Dict[str, Any] = field(default_factory=dict)
    # results
    summary: Dict[str, Any] = field(default_factory=dict)
    sample_pairs: List[Dict[str, Any]] = field(default_factory=list)
    deduped_csv_path: Optional[str] = None
    error: Optional[str] = None

DATASET = "MNIST"   # current dataset selection
HISTORY: List[Dict[str, Any]] = []
JOBS: Dict[str, Job] = {}
ACTIVE_DF = None     # pandas DataFrame of current dataset (or uploaded CSV)

def add_history(entry: Dict[str, Any]):
    HISTORY.insert(0, entry)  # latest first