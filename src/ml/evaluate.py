"""
Evaluation and Analysis Report Generator for Virtual Mining Blast ML Dataset.
Compares Observed vs Synthetic data distributions and benchmarks model inference errors.
"""

import json
import os
from pathlib import Path

import numpy as np
import pandas as pd

try:
    from .dataset_loader import get_ml_datasets
except ImportError:  # pragma: no cover - supports direct script execution
    from dataset_loader import get_ml_datasets

ARTIFACTS_DIR = (Path(__file__).resolve().parent / "artifacts").resolve()

def generate_report():
    data = get_ml_datasets()
    df_obs = data["df_obs"]
    df_syn = data["df_syn"]
    df_all = data["df_all"]

    meta_file = os.path.join(ARTIFACTS_DIR, "model_metadata.json")
    with open(meta_file, "r", encoding="utf-8") as f:
        meta = json.load(f)

    report_lines = []
    report_lines.append("# Virtual Mining Blast ML Model Evaluation Report")
    report_lines.append(f"**Dataset**: `{meta['metadata']['dataset']}`")
    report_lines.append(f"**Total Blasts Analyzed**: {meta['metadata']['total_records']} (Observed: {meta['metadata']['observed_records']} | Synthetic: {meta['metadata']['synthetic_records']})")
    report_lines.append(f"**Observed Blast Date Range**: {meta['metadata']['observed_date_min']} to {meta['metadata']['observed_date_max']}")
    report_lines.append("")

    report_lines.append("## 1. Feature Distribution: Observed vs. Synthetic")
    report_lines.append("| Feature | Observed Mean (±std) | Synthetic Mean (±std) | Unit |")
    report_lines.append("|---|---|---|---|")

    features_to_compare = [
        ("No_of_Holes", "holes"),
        ("Depth_m", "m"),
        ("Tube_Length_m_imputed", "m"),
        ("Oxygen_kg", "kg"),
        ("Total_Depth_calc_m", "m"),
        ("Tube_to_Depth_Ratio", "ratio")
    ]

    for col, unit in features_to_compare:
        obs_m, obs_s = df_obs[col].mean(), df_obs[col].std()
        syn_m, syn_s = df_syn[col].mean(), df_syn[col].std()
        report_lines.append(f"| `{col}` | {obs_m:.2f} (±{obs_s:.2f}) | {syn_m:.2f} (±{syn_s:.2f}) | {unit} |")

    report_lines.append("")
    report_lines.append("## 2. 5-Fold Cross-Validation Performance Benchmarks")
    report_lines.append("### Partition A: Observed Data Only (N=20)")
    report_lines.append("| Model Architecture | CV R² Score | CV MAE (kg) | CV RMSE (kg) | Status |")
    report_lines.append("|---|---|---|---|---|")
    for model_name, m in meta["benchmarks"]["observed_only"].items():
        status = "Robust" if m["r2_mean"] > 0.7 else "Overfit / High Variance" if m["r2_mean"] < 0 else "Moderate"
        report_lines.append(f"| **{model_name}** | {m['r2_mean']:.3f} ± {m['r2_std']:.2f} | {m['mae_mean']:.1f} kg | {m['rmse_mean']:.1f} kg | {status} |")

    report_lines.append("")
    report_lines.append("### Partition B: Synthetic Data Only (N=200)")
    report_lines.append("| Model Architecture | CV R² Score | CV MAE (kg) | CV RMSE (kg) |")
    report_lines.append("|---|---|---|---|")
    for model_name, m in meta["benchmarks"]["synthetic_only"].items():
        report_lines.append(f"| **{model_name}** | {m['r2_mean']:.3f} ± {m['r2_std']:.2f} | {m['mae_mean']:.1f} kg | {m['rmse_mean']:.1f} kg |")

    report_lines.append("")
    report_lines.append("### Partition C: Combined All Data (N=220)")
    report_lines.append("| Model Architecture | CV R² Score | CV MAE (kg) | CV RMSE (kg) |")
    report_lines.append("|---|---|---|---|")
    for model_name, m in meta["benchmarks"]["all_data"].items():
        report_lines.append(f"| **{model_name}** | {m['r2_mean']:.3f} ± {m['r2_std']:.2f} | {m['mae_mean']:.1f} kg | {m['rmse_mean']:.1f} kg |")

    report_lines.append("")
    report_lines.append("## 3. Generalization & Domain Transfer (Synthetic-Trained -> Real-Observed Tested)")
    report_lines.append("| Model Architecture | Generalization R² | Field MAE (kg) | Field RMSE (kg) | Physical Generalization |")
    report_lines.append("|---|---|---|---|---|")
    for model_name, m in meta["domain_transfer"].items():
        status = "Excellent (>0.95)" if m["r2"] > 0.95 else "Good (>0.85)" if m["r2"] > 0.85 else "Fair"
        report_lines.append(f"| **{model_name}** | {m['r2']:.4f} | {m['mae']:.2f} kg | {m['rmse']:.2f} kg | {status} |")

    report_lines.append("")
    report_lines.append("## 4. Feature Importance Rankings (Tree Ensemble)")
    report_lines.append("| Rank | Feature Name | Importance Weight | Physical Significance |")
    report_lines.append("|---|---|---|---|")
    sorted_fi = sorted(meta["best_model"]["random_forest_feature_importance"].items(), key=lambda x: x[1], reverse=True)
    descriptions = {
        "Holes_x_Tube": "Total aggregate explosive column length across all blast holes",
        "Total_Depth_calc_m": "Total meters drilled (Burden/Bench volume proxy)",
        "No_of_Holes": "Array hole count influencing energy distribution",
        "Tube_to_Depth_Ratio": "Charge column ratio relative to stemming height",
        "Depth_m": "Individual hole depth",
        "Stemming_Est_m": "Estimated inert stemming collar length",
        "Tube_Length_m_imputed": "Charge tube length"
    }
    for rank, (feat, imp) in enumerate(sorted_fi, 1):
        desc = descriptions.get(feat, "Blast parameter")
        report_lines.append(f"| {rank} | `{feat}` | {imp*100:.2f}% | {desc} |")

    report_text = "\n".join(report_lines)
    out_path = os.path.join(ARTIFACTS_DIR, "evaluation_report.md")
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(report_text)

    print(f"Generated evaluation report at: {out_path}")
    print("\n" + report_text)

if __name__ == "__main__":
    generate_report()
