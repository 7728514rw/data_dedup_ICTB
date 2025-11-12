from __future__ import annotations
from dataclasses import dataclass
from typing import List, Dict, Any, Tuple, Optional
from pathlib import Path
import hashlib
import pandas as pd
from rapidfuzz import fuzz

DATA_DIR = Path(__file__).parent / "data"
INPUT_CSV = DATA_DIR / "input.csv"
INPUT_JSON = DATA_DIR / "input.json"
DEDUPED_CSV = DATA_DIR / "deduped.csv"
DEDUPED_JSON = DATA_DIR / "deduped.json"

DATA_DIR.mkdir(parents=True, exist_ok=True)

@dataclass
class DedupeSummary:
    rows_before: int
    rows_after: int
    exact_dup_count: int
    near_dup_pairs: int
    sampled: int
    top_clusters: List[Dict[str, Any]]

def _normalize_row_str(row: pd.Series, cols: Optional[List[str]]) -> str:
    if cols is None or len(cols) == 0:
        s = "|".join(row.astype(str).tolist())
    else:
        s = "|".join(row[c].astype(str) if c in row else "" for c in cols)
    return " ".join(s.lower().split())

def _row_hash(row: pd.Series, cols: Optional[List[str]]) -> str:
    norm = _normalize_row_str(row, cols)
    return hashlib.sha1(norm.encode("utf-8")).hexdigest()

def load_dataframe() -> Tuple[pd.DataFrame, str]:
    if INPUT_CSV.exists():
        return pd.read_csv(INPUT_CSV), "csv"
    if INPUT_JSON.exists():
        return pd.read_json(INPUT_JSON), "json"
    raise FileNotFoundError("No input dataset found. Upload CSV or JSON first.")

def preview_duplicates(cols: Optional[List[str]] = None, sample_rows: int = 1000) -> Dict[str, Any]:
    df, _ = load_dataframe()
    df = df.head(sample_rows).copy()

    hashes = df.apply(lambda r: _row_hash(r, cols), axis=1)
    dup_mask = hashes.duplicated(keep="first")
    exact_count = int(dup_mask.sum())

    return {
        "preview_rows": int(len(df)),
        "exact_duplicate_count": exact_count,
        "note": "This is a sample-based preview (exact dup only). Run full dedupe to compute near-duplicates."
    }

def _pairwise_near_dups(df: pd.DataFrame, cols: Optional[List[str]], threshold: int = 90, cap: int = 2000) -> List[Tuple[int,int,int]]:
    # limit size for speed (demo)
    df = df.head(cap).copy()
    texts = df.apply(lambda r: _normalize_row_str(r, cols), axis=1).tolist()
    pairs: List[Tuple[int,int,int]] = []
    n = len(texts)
    # O(n^2) demo — cap keeps it reasonable
    for i in range(n):
        ti = texts[i]
        for j in range(i+1, n):
            tj = texts[j]
            score = fuzz.token_set_ratio(ti, tj)
            if score >= threshold:
                pairs.append((i, j, int(score)))
    return pairs

def run_dedupe(cols: Optional[List[str]] = None, near_threshold: int = 90) -> DedupeSummary:
    df, which = load_dataframe()
    before = len(df)

    # Exact dedup by hash
    df["_hash"] = df.apply(lambda r: _row_hash(r, cols), axis=1)
    exact_dup_count = int(df["_hash"].duplicated(keep="first").sum())
    df_exact = df.drop_duplicates(subset=["_hash"]).drop(columns=["_hash"])

    # Near-duplicate detection on sampled rows of the exact-deduped set
    pairs = _pairwise_near_dups(df_exact, cols, threshold=near_threshold, cap=2000)
    near_pairs = len(pairs)

    # Build naive clusters from pairs (union-find-ish, simple pass)
    parent = list(range(len(df_exact)))
    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x
    def union(a,b):
        ra, rb = find(a), find(b)
        if ra != rb:
            parent[rb] = ra

    for i, j, _ in pairs:
        union(i, j)

    clusters: Dict[int, List[int]] = {}
    for idx in range(len(df_exact)):
        r = find(idx)
        clusters.setdefault(r, []).append(idx)

    # Sort by size and build sample view of top clusters
    cluster_list = sorted(
        [v for v in clusters.values() if len(v) > 1],
        key=lambda g: len(g),
        reverse=True
    )[:5]

    top_clusters = []
    for g in cluster_list:
        sample_rows = df_exact.iloc[g].head(2).to_dict(orient="records")
        top_clusters.append({
            "size": len(g),
            "sample": sample_rows
        })

    # Save deduped output (exact-only to preserve speed)
    if which == "csv":
        df_exact.to_csv(DEDUPED_CSV, index=False)
    else:
        df_exact.to_json(DEDUPED_JSON, orient="records")

    after = int(len(df_exact))
    return DedupeSummary(
        rows_before=int(before),
        rows_after=after,
        exact_dup_count=int(exact_dup_count),
        near_dup_pairs=int(near_pairs),
        sampled=min(2000, after),
        top_clusters=top_clusters
    )