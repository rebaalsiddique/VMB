"""
Dataset Loader for Virtual Mining Blast ML Dataset.
Loads and preprocesses data non-destructively from the project-local Excel files.
"""

import os
from pathlib import Path

import numpy as np
import pandas as pd

PROJECT_ROOT = Path(__file__).resolve().parents[2]
DATA_DIR = PROJECT_ROOT / "src" / "data"
DATASET_CANDIDATES = [
    DATA_DIR / "Virtual_Mining_Blast_ML_Dataset.xlsx",
    DATA_DIR / "LOX_Blast_Raw_and_Assumed_Data.xlsx",
    PROJECT_ROOT / "Virtual_Mining_Blast_ML_Dataset.xlsx",
    PROJECT_ROOT / "LOX_Blast_Raw_and_Assumed_Data.xlsx",
]


def resolve_dataset_path(filepath: str | None = None) -> str:
    """Resolve the dataset path relative to the repo instead of a machine-specific drive."""
    if filepath is not None:
        candidate = Path(filepath).expanduser()
        if candidate.is_absolute():
            return str(candidate)
        return str((PROJECT_ROOT / candidate).resolve())

    for candidate in DATASET_CANDIDATES:
        if candidate.exists():
            return str(candidate)
    return str(DATASET_CANDIDATES[0])


DATASET_PATH = resolve_dataset_path()

FEATURE_COLUMNS = [
    "No_of_Holes",
    "Depth_m",
    "Tube_Length_m_imputed",
    "Total_Depth_calc_m",
    "Tube_to_Depth_Ratio",
    "Stemming_Est_m",
    "Holes_x_Tube",
]

TARGET_COLUMN = "Oxygen_kg"


def load_raw_sheets(filepath: str = DATASET_PATH) -> dict[str, pd.DataFrame]:
    """
    Loads all 5 sheets non-destructively from the Excel file without modifying it.
    """
    resolved_path = resolve_dataset_path(filepath)
    if not os.path.exists(resolved_path):
        raise FileNotFoundError(f"Dataset not found at {resolved_path}")

    xl = pd.ExcelFile(resolved_path)
    sheets = {
        "observed": xl.parse("Observed_Data"),
        "synthetic": xl.parse("Synthetic_Data"),
        "all": xl.parse("All_Data"),
        "data_dictionary": xl.parse("Data_Dictionary"),
        "readme": xl.parse("README"),
    }
    return sheets


def preprocess_data(df: pd.DataFrame, fit_imputer_ratio: float | None = None) -> tuple[pd.DataFrame, float]:
    """
    Preprocesses blast dataset:
    - Imputes missing Tube_Length_m based on Depth_m ratio
    - Computes domain features: Total_Depth_calc_m, Tube_to_Depth_Ratio, Stemming_Est_m, Holes_x_Tube
    - Retains Data_Source indicator
    """
    data = df.copy()

    # Calculate depth to tube length ratio from valid observed non-nulls
    if fit_imputer_ratio is None:
        valid_tube = data.dropna(subset=["Tube_Length_m", "Depth_m"])
        ratio = float((valid_tube["Tube_Length_m"] / valid_tube["Depth_m"]).median())
    else:
        ratio = fit_imputer_ratio

    # Impute missing tube length
    data["Tube_Length_m_imputed"] = data["Tube_Length_m"].fillna(data["Depth_m"] * ratio)
    data["was_tube_length_imputed"] = data["Tube_Length_m"].isna().astype(int)

    # Domain feature engineering
    data["Total_Depth_calc_m"] = data["No_of_Holes"] * data["Depth_m"]
    data["Tube_to_Depth_Ratio"] = data["Tube_Length_m_imputed"] / data["Depth_m"]
    data["Stemming_Est_m"] = (data["Depth_m"] - data["Tube_Length_m_imputed"]).clip(lower=0.0)
    data["Holes_x_Tube"] = data["No_of_Holes"] * data["Tube_Length_m_imputed"]

    # Flag observed vs synthetic clearly
    data["is_synthetic"] = (data["Data_Source"].astype(str).str.lower() == "synthetic").astype(int)

    return data, ratio


def get_ml_datasets(filepath: str = DATASET_PATH):
    """
    Loads and splits data into strictly distinguished observed, synthetic, and combined splits.
    """
    resolved_path = resolve_dataset_path(filepath)
    sheets = load_raw_sheets(resolved_path)

    # Impute using observed ratio for physical consistency
    df_obs_raw = sheets["observed"]
    _, observed_ratio = preprocess_data(df_obs_raw)

    df_obs, _ = preprocess_data(sheets["observed"], fit_imputer_ratio=observed_ratio)
    df_syn, _ = preprocess_data(sheets["synthetic"], fit_imputer_ratio=observed_ratio)
    df_all, _ = preprocess_data(sheets["all"], fit_imputer_ratio=observed_ratio)

    return {
        "sheets": sheets,
        "df_obs": df_obs,
        "df_syn": df_syn,
        "df_all": df_all,
        "imputer_ratio": observed_ratio,
        "feature_cols": FEATURE_COLUMNS,
        "target_col": TARGET_COLUMN,
    }


if __name__ == "__main__":
    datasets = get_ml_datasets()
    print("Dataset loader initialized successfully.")
    print(f"Observed count: {len(datasets['df_obs'])} (must be 20)")
    print(f"Synthetic count: {len(datasets['df_syn'])} (must be 200)")
    print(f"All count: {len(datasets['df_all'])} (must be 220)")
    print(f"Imputer Ratio (Tube/Depth): {datasets['imputer_ratio']:.4f}")
    print("Features:", datasets["feature_cols"])
