# backend/dedupe.py
from typing import List, Dict
from pathlib import Path
import random
import pandas as pd
import numpy as np
from faker import Faker
from rapidfuzz import fuzz

DATA_DIR = Path(__file__).parent / "data"
DATA_DIR.mkdir(exist_ok=True)

fake = Faker()

def _inject_duplicates(
    df: pd.DataFrame,
    *,
    text_col: str = "text",
    dup_pct: float = 0.08,
    fuzzy_pct: float = 0.02,
    subject_col: str = "data_subject_id",
):
    """Add exact and fuzzy duplicates into the dataframe for demo purposes."""
    n = len(df)
    # Exact dups: append copies of random rows
    exact_k = max(1, int(n * dup_pct))
    exact_rows = df.sample(min(exact_k, n), replace=True, random_state=42)
    df_exact = pd.concat([df, exact_rows], ignore_index=True)

    # Fuzzy dups: copy rows, tweak their free-text
    fuzzy_k = max(1, int(n * fuzzy_pct))
    fuzz_rows = df.sample(min(fuzzy_k, n), replace=True, random_state=7).copy()
    if text_col in fuzz_rows.columns:
        def perturb(s):
            s = str(s)
            if len(s) < 4:
                return s
            ops = [
                lambda x: x.capitalize(),
                lambda x: x[:-1] if len(x) > 6 else x,
                lambda x: x + "?utm_source=mail",
                lambda x: x.replace(" ", "  "),
            ]
            return random.choice(ops)(s)
        fuzz_rows[text_col] = fuzz_rows[text_col].map(perturb)

    # Keep subject ids to make dedupe hits obvious
    df_all = pd.concat([df_exact, fuzz_rows], ignore_index=True)
    return df_all

REGIONS = [
    "Victoria",
    "New South Wales",
    "Queensland",
    "Tasmania",
    "South Australia",
    "Western Australia",
    "Northern Territory",
    "ACT",
]

def load_phishing_urls(n=8000, dup_pct=0.10, fuzzy_pct=0.03):
    """Synthetic phishing URL dataset with duplicates."""
    brands = ["Microsoft", "Apple", "PayPal", "NAB", "ANZ", "Amazon", "Facebook"]
    rows = []
    for i in range(n):
        brand = random.choice(brands)
        domain = fake.domain_name()
        path = "/".join(fake.words(nb=random.randint(1, 3)))
        if random.random() < 0.25:
            domain = "secure-" + domain
        url = f"https://{domain}/{path}"
        email = fake.ascii_email()
        rows.append({
            "id": i + 1,
            "data_subject_id": email,
            "url": url,
            "brand": brand,
            "label": "phish" if random.random() < 0.55 else "benign",
            "text": f"{brand} login at {url} for {email}",
        })
    df = pd.DataFrame(rows)
    df = _inject_duplicates(df, text_col="text", dup_pct=dup_pct, fuzzy_pct=fuzzy_pct)
    out = DATA_DIR / "phishing_urls.csv"
    df.to_csv(out, index=False)
    return df

def load_windows_eventlog(n=15000, dup_pct=0.06, fuzzy_pct=0.02):
    """Synthetic Windows Security EventLog style messages with duplicates."""
    event_templates = [
        "An account was successfully logged on. User: {user} from {host}",
        "A logon attempt was made using explicit credentials. User: {user}",
        "An account was locked out. User: {user}",
        "Scheduled task created. Name: {task} by {user}",
        "A service was installed in the system. Service: {svc} by {user}",
        "Malware alert from Defender. Detection: {d} on {host}",
    ]
    rows = []
    for i in range(n):
        user = f"user{random.randint(1000, 1999)}"
        host = f"PC-{random.randint(100, 999)}"
        msg = random.choice(event_templates).format(
            user=user,
            host=host,
            task=fake.word(),
            svc=fake.word(),
            d=random.choice(["Trojan:Win32", "PUA:Win32", "Worm:Win32"]),
        )
        rows.append({
            "id": i + 1,
            "data_subject_id": user,
            "host": host,
            "event_id": random.choice([4624, 4625, 4698, 4697, 7045, 1116]),
            "text": msg,
        })
    df = pd.DataFrame(rows)
    df = _inject_duplicates(df, text_col="text", dup_pct=dup_pct, fuzzy_pct=fuzzy_pct)
    out = DATA_DIR / "windows_eventlog.csv"
    df.to_csv(out, index=False)
    return df

def load_nsl_kdd_sample(n=10000, dup_pct=0.05, fuzzy_pct=0.02):
    """Small, offline-friendly NSL-KDD-like flows with duplicates (synthetic)."""
    protos = ["tcp", "udp", "icmp"]
    services = ["http", "smtp", "ftp", "dns", "ssh", "ssl", "other"]
    flags = ["SF", "S0", "REJ", "RSTO", "RSTR", "S1"]

    rows = []
    for i in range(n):
        proto = random.choice(protos)
        svc = random.choice(services)
        flag = random.choice(flags)
        src_b = abs(int(np.random.normal(600, 500)))
        dst_b = abs(int(np.random.normal(700, 600)))
        label = "attack" if random.random() < 0.2 else "normal"
        rows.append({
            "id": i + 1,
            "data_subject_id": f"flow-{i:06d}",
            "proto": proto,
            "service": svc,
            "flag": flag,
            "src_bytes": src_b,
            "dst_bytes": dst_b,
            "text": f"{proto} {svc} {flag} {src_b}->{dst_b} {label}",
            "label": label,
        })
    df = pd.DataFrame(rows)
    df = _inject_duplicates(df, text_col="text", dup_pct=dup_pct, fuzzy_pct=fuzzy_pct)
    out = DATA_DIR / "nsl_kdd_sample.csv"
    df.to_csv(out, index=False)
    return df

SECURITY_DATASETS = {
    "Phishing-URLs": load_phishing_urls,
    "Windows-EventLog": load_windows_eventlog,
    "NSL-KDD sample": load_nsl_kdd_sample,
}

def load_dataset_by_name(name: str) -> pd.DataFrame:
    """Load demo dataset by name or synthesize one if files are missing."""
    if not name:
        name = "CIFAR-10"

    if name in SECURITY_DATASETS:
        return SECURITY_DATASETS[name]()

    key = name.upper()
    mapping = {
        "MNIST": "mnist.csv",
        "CIFAR-10": "cifar10.csv",
        "CIFAR-100": "cifar100.csv",
    }
    path = DATA_DIR / mapping.get(key, "cifar10.csv")

    if path.exists():
        df = pd.read_csv(path)
    else:
        rows = [
            {"data_subject_id": "vic-001", "text": "Ryan Walsh", "region": "Victoria", "label": 0},
            {"data_subject_id": "vic-001", "text": "Ryan Walsh", "region": "Victoria", "label": 0},  # exact dup
            {"data_subject_id": "nsw-002", "text": "Anwar Miesso", "region": "New South Wales", "label": 1},
            {"data_subject_id": "qld-003", "text": "Grace Alesci", "region": "Queensland", "label": 2},
            {"data_subject_id": "qld-003", "text": "Grace Alesci-Pettitt", "region": "Queensland", "label": 2},  # fuzzy dup
        ]
        df = pd.DataFrame(rows)

    if "data_subject_id" not in df.columns:
        df["data_subject_id"] = [f"id-{i}" for i in range(len(df))]
    if "region" not in df.columns:
        df["region"] = np.random.choice(REGIONS, size=len(df))
    if "label" not in df.columns:
        df["label"] = np.random.randint(0, 10, size=len(df))
    if "text" not in df.columns:
        df["text"] = df["data_subject_id"].astype(str) + " " + df["label"].astype(str)

    return df

def run_dedupe(
    df: pd.DataFrame,
    subject_col: str = "data_subject_id",
    text_col: str = "text",
    fuzzy_threshold: int = 90,
):
    """
    Two-pass dedupe:
      1) Exact dupes on (subject_col, text_col)
      2) Fuzzy dupes within each subject using token_set_ratio >= threshold
    Returns: (deduped_df, summary_dict, sample_pairs)
    """
    before = len(df)
    work = df.copy()

    # exact
    exact_mask = work.duplicated(subset=[subject_col, text_col], keep="first")
    removed_exact = int(exact_mask.sum())
    work = work[~exact_mask].reset_index(drop=True)

    # fuzzy (within each subject)
    removed_fuzzy = 0
    to_drop = set()
    sample_pairs: List[Dict] = []

    for sid, g in work.groupby(subject_col, sort=False):
        texts = g[text_col].astype(str).tolist()
        idxs = g.index.tolist()
        n = len(texts)
        for i in range(n):
            if idxs[i] in to_drop:
                continue
            for j in range(i + 1, n):
                if idxs[j] in to_drop:
                    continue
                sim = fuzz.token_set_ratio(texts[i], texts[j])
                if sim >= fuzzy_threshold:
                    to_drop.add(idxs[j])
                    removed_fuzzy += 1
                    if len(sample_pairs) < 25:
                        sample_pairs.append({
                            "i_text": texts[i],
                            "j_text": texts[j],
                            "similarity": round(float(sim), 1),
                        })

    deduped = work.drop(index=list(to_drop)).reset_index(drop=True)
    after = len(deduped)
    removed = before - after
    if removed != (removed_exact + removed_fuzzy):
        removed = removed_exact + removed_fuzzy
        after = before - removed

    summary = {
        "before_records": int(before),
        "after_records": int(after),
        "removed": int(removed),
        "reduction_pct": round(100.0 * removed / before, 2) if before else 0.0,
        "removed_exact": int(removed_exact),
        "removed_fuzzy": int(removed_fuzzy),
    }
    return deduped, summary, sample_pairs
