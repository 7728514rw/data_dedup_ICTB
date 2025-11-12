from typing import List, Optional, Literal
from pydantic import BaseModel, Field

# ----- Configs sent from the Dashboard -----

class DatasetConfig(BaseModel):
    name: Literal["CIFAR-10", "CIFAR-100", "MNIST"] = "CIFAR-10"

class AttackConfig(BaseModel):
    type: Literal["Duplication"] = "Duplication"
    duplicate_ratio: int = Field(10, ge=0, le=100)          # %
    clients_affected: int = Field(50, ge=0, le=100)         # %
    strategy: Literal["Random", "Targeted"] = "Random"
    target_class: Optional[str] = "Auto"                    # e.g., "Auto" or "0..9"

class GDPRConfig(BaseModel):
    data_subject_id: Optional[str] = None
    unlearning_mode: Literal["Certified", "Approximate"] = "Certified"
    retention_days: int = Field(30, ge=0, le=365)
    enable_dp: bool = False
    epsilon: Optional[float] = 8.0
    keep_audit_log: bool = True

class RunConfig(BaseModel):
    dataset: DatasetConfig
    attack: AttackConfig
    gdpr: GDPRConfig

# ----- Dashboard tiles -----

class KPIs(BaseModel):
    total_nodes: int
    data_points: int
    model_accuracy: float         # %
    privacy_score: float          # %

# ----- Nodes & Health -----

class Node(BaseModel):
    name: str
    status: Literal["active", "syncing", "idle"]
    data_points: int
    duplication: int              # %
    region: Literal["VIC", "NSW", "QLD", "ACT", "WA", "SA", "TAS", "NT"]

class SystemHealth(BaseModel):
    network_latency_ms: int
    synchronisation: int          # %
    privacy_compliance: int       # %

# ----- Unlearning -----

class UnlearningRequest(BaseModel):
    request_id: str
    removed_points: int
    status: Literal["completed", "processing", "failed"]
    created_at: str