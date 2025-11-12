# backend/make_demo_datasets.py
import os
import numpy as np
import pandas as pd

REGIONS = ["VIC", "NSW", "QLD", "NT", "WA"]

def gen_dataset(path: str, n_rows=6000, n_classes=10):
    rng = np.random.default_rng(42)
    X = rng.normal(size=(n_rows, 12))          # x0..x11
    y = rng.integers(0, n_classes, size=n_rows)
    regions = rng.choice(REGIONS, size=n_rows)
    ids = [f"subj-{i:06d}" for i in range(n_rows)]

    df = pd.DataFrame(X, columns=[f"x{i}" for i in range(X.shape[1])])
    df["label"] = y
    df["data_subject_id"] = ids
    df["region"] = regions

    # Add baseline duplicates (~5%)
    dup_idx = rng.choice(n_rows, size=int(n_rows * 0.05), replace=False)
    df = pd.concat([df, df.iloc[dup_idx]], ignore_index=True)

    os.makedirs(os.path.dirname(path), exist_ok=True)
    df.to_csv(path, index=False)

def generate_all(out_dir: str):
    os.makedirs(out_dir, exist_ok=True)
    gen_dataset(os.path.join(out_dir, "mnist.csv"),   n_rows=6000, n_classes=10)
    gen_dataset(os.path.join(out_dir, "cifar10.csv"), n_rows=6000, n_classes=10)
    gen_dataset(os.path.join(out_dir, "cifar100.csv"), n_rows=8000, n_classes=20)

if __name__ == "__main__":
    here = os.path.dirname(__file__)
    out = os.path.join(here, "data")
    generate_all(out)
    print("Generated demo datasets in:", out)