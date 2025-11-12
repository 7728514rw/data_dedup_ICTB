# backend/scripts/make_demo_datasets.py
from pathlib import Path
from datetime import datetime, timedelta
import numpy as np, pandas as pd, random, string

rng = np.random.default_rng(123)

def make_dataset(name, n_base=15000, pct_exact=0.08, pct_near=0.08, labels=10):
    states = ["VIC","NSW","QLD","NT","SA","WA","ACT","TAS"]
    def typo(s):
        if len(s) < 3: return s
        i = random.randrange(len(s)); s = list(s)
        s[i] = random.choice(string.ascii_lowercase)
        return "".join(s)

    rows = []
    start = datetime(2024,1,1)
    for i in range(n_base):
        label = int(rng.integers(0, labels))
        rows.append({
            "data_subject_id": f"{name[:3].upper()}{i:06d}",
            "dataset": name,
            "label": label,
            "node": random.choice(states),
            "record_text": f"{name} sample record {label}",
            "created_at": (start + timedelta(days=int(rng.integers(0,365)))).date().isoformat(),
            "value": float(np.round(rng.normal(0.0, 1.0), 4)),
            "owner_email": f"user{int(rng.integers(1,40000))}@example.com",
        })

    df = pd.DataFrame(rows)
    exact = df.sample(int(pct_exact*len(df)), replace=True, random_state=1)
    near  = df.sample(int(pct_near *len(df)), replace=True, random_state=2).copy()
    for col in ["record_text","owner_email"]:
        mask = rng.random(len(near)) < 0.6
        near.loc[mask, col] = near.loc[mask, col].apply(typo)

    out = pd.concat([df, exact, near], ignore_index=True).sample(frac=1.0, random_state=3)
    return out

base = Path(__file__).resolve().parents[1] / "data" / "datasets"
base.mkdir(parents=True, exist_ok=True)

make_dataset("mnist",   labels=10).to_csv(base / "mnist.csv",   index=False)
make_dataset("cifar10", labels=10).to_csv(base / "cifar10.csv", index=False)
make_dataset("cifar100",labels=100).to_csv(base / "cifar100.csv",index=False)

print("Generated:", list(p.name for p in base.glob("*.csv")))