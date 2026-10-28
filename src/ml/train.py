"""
Model Training and Cross-Validation Pipeline for Virtual Mining Blast ML Dataset.
Trains Linear Regression, Ridge, Random Forest, and Gradient Boosting models
with strict partitioning of Observed vs Synthetic blast cases.
Exports model metadata, weights, and evaluation metrics to src/ml/artifacts/model_metadata.json.
"""

import json
import os
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingRegressor, RandomForestRegressor
from sklearn.linear_model import LinearRegression, Ridge
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import KFold, cross_validate
from sklearn.preprocessing import StandardScaler

try:
    from .dataset_loader import FEATURE_COLUMNS, TARGET_COLUMN, get_ml_datasets
except ImportError:  # pragma: no cover - supports direct script execution
    from dataset_loader import FEATURE_COLUMNS, TARGET_COLUMN, get_ml_datasets

ARTIFACTS_DIR = (Path(__file__).resolve().parent / "artifacts").resolve()
os.makedirs(ARTIFACTS_DIR, exist_ok=True)

def train_and_evaluate():
    data_bundle = get_ml_datasets()
    df_obs = data_bundle["df_obs"]
    df_syn = data_bundle["df_syn"]
    df_all = data_bundle["df_all"]
    imputer_ratio = data_bundle["imputer_ratio"]
    feature_cols = FEATURE_COLUMNS
    target_col = TARGET_COLUMN

    X_obs = df_obs[feature_cols].values
    y_obs = df_obs[target_col].values

    X_syn = df_syn[feature_cols].values
    y_syn = df_syn[target_col].values

    X_all = df_all[feature_cols].values
    y_all = df_all[target_col].values

    # Model definition dictionary
    models = {
        "Linear Regression": LinearRegression(),
        "Ridge Regression": Ridge(alpha=1.0),
        "Random Forest": RandomForestRegressor(n_estimators=100, max_depth=6, random_state=42),
        "Gradient Boosting": GradientBoostingRegressor(n_estimators=80, max_depth=3, learning_rate=0.08, random_state=42)
    }

    results = {
        "metadata": {
            "dataset": "Virtual_Mining_Blast_ML_Dataset.xlsx",
            "observed_records": len(df_obs),
            "synthetic_records": len(df_syn),
            "total_records": len(df_all),
            "imputer_tube_to_depth_ratio": imputer_ratio,
            "feature_columns": feature_cols,
            "target_column": target_col,
            "observed_date_min": str(df_obs["Date"].dropna().min()) if not df_obs["Date"].dropna().empty else None,
            "observed_date_max": str(df_obs["Date"].dropna().max()) if not df_obs["Date"].dropna().empty else None,
        },
        "benchmarks": {},
        "domain_transfer": {},
        "best_model": {}
    }

    # Helper for cross-validation metrics
    def evaluate_cv(model, X, y, n_splits=5):
        kf = KFold(n_splits=min(n_splits, len(X)), shuffle=True, random_state=42)
        r2_scores = []
        mae_scores = []
        rmse_scores = []
        
        for train_idx, val_idx in kf.split(X):
            X_tr, X_val = X[train_idx], X[val_idx]
            y_tr, y_val = y[train_idx], y[val_idx]
            
            m = model.__class__(**model.get_params())
            m.fit(X_tr, y_tr)
            preds = m.predict(X_val)
            
            r2_scores.append(r2_score(y_val, preds))
            mae_scores.append(mean_absolute_error(y_val, preds))
            rmse_scores.append(np.sqrt(mean_squared_error(y_val, preds)))
            
        return {
            "r2_mean": float(np.mean(r2_scores)),
            "r2_std": float(np.std(r2_scores)),
            "mae_mean": float(np.mean(mae_scores)),
            "mae_std": float(np.std(mae_scores)),
            "rmse_mean": float(np.mean(rmse_scores)),
            "rmse_std": float(np.std(rmse_scores))
        }

    print("=" * 65)
    print("TRAINING & BENCHMARKING MODELS ACROSS PARTITIONS")
    print("=" * 65)

    # 1. EVALUATE PARTITION: OBSERVED ONLY (N=20)
    print("\n[PARTITION 1] Observed Data Only (N=20)")
    results["benchmarks"]["observed_only"] = {}
    for name, model in models.items():
        metrics = evaluate_cv(model, X_obs, y_obs, n_splits=5)
        results["benchmarks"]["observed_only"][name] = metrics
        print(f"  {name:<20} | R²: {metrics['r2_mean']:.4f} ± {metrics['r2_std']:.3f} | MAE: {metrics['mae_mean']:.2f} kg | RMSE: {metrics['rmse_mean']:.2f} kg")

    # 2. EVALUATE PARTITION: SYNTHETIC ONLY (N=200)
    print("\n[PARTITION 2] Synthetic Data Only (N=200)")
    results["benchmarks"]["synthetic_only"] = {}
    for name, model in models.items():
        metrics = evaluate_cv(model, X_syn, y_syn, n_splits=5)
        results["benchmarks"]["synthetic_only"][name] = metrics
        print(f"  {name:<20} | R²: {metrics['r2_mean']:.4f} ± {metrics['r2_std']:.3f} | MAE: {metrics['mae_mean']:.2f} kg | RMSE: {metrics['rmse_mean']:.2f} kg")

    # 3. EVALUATE PARTITION: ALL DATA (N=220)
    print("\n[PARTITION 3] Combined All Data (N=220)")
    results["benchmarks"]["all_data"] = {}
    for name, model in models.items():
        metrics = evaluate_cv(model, X_all, y_all, n_splits=5)
        results["benchmarks"]["all_data"][name] = metrics
        print(f"  {name:<20} | R²: {metrics['r2_mean']:.4f} ± {metrics['r2_std']:.3f} | MAE: {metrics['mae_mean']:.2f} kg | RMSE: {metrics['rmse_mean']:.2f} kg")

    # 4. DOMAIN TRANSFER: Train on Synthetic (200), Test on Observed (20)
    print("\n[DOMAIN TRANSFER] Trained on Synthetic (200) -> Tested on Real Observed (20)")
    for name, model in models.items():
        m = model.__class__(**model.get_params())
        m.fit(X_syn, y_syn)
        preds_obs = m.predict(X_obs)
        r2 = float(r2_score(y_obs, preds_obs))
        mae = float(mean_absolute_error(y_obs, preds_obs))
        rmse = float(np.sqrt(mean_squared_error(y_obs, preds_obs)))
        results["domain_transfer"][name] = {
            "trained_on": "synthetic_200",
            "tested_on": "observed_20",
            "r2": r2,
            "mae": mae,
            "rmse": rmse
        }
        print(f"  {name:<20} | Generalization R²: {r2:.4f} | MAE: {mae:.2f} kg | RMSE: {rmse:.2f} kg")

    # 5. FIT PRODUCTION MODELS & EXTRACT WEIGHTS
    # Scaler fit on observed for physical stability
    scaler = StandardScaler()
    scaler.fit(X_obs)

    # Train final production Ridge & Linear models on observed and all data
    final_linear = LinearRegression()
    final_linear.fit(X_obs, y_obs)

    final_ridge = Ridge(alpha=1.0)
    final_ridge.fit(X_obs, y_obs)

    final_rf = RandomForestRegressor(n_estimators=100, max_depth=6, random_state=42)
    final_rf.fit(X_obs, y_obs)

    # Feature importances
    rf_importances = {feat: float(imp) for feat, imp in zip(feature_cols, final_rf.feature_importances_)}
    linear_coefficients = {feat: float(coef) for feat, coef in zip(feature_cols, final_linear.coef_)}
    ridge_coefficients = {feat: float(coef) for feat, coef in zip(feature_cols, final_ridge.coef_)}

    results["best_model"] = {
        "model_type": "Linear / Ridge Regression (Interpretable Physical Formulation)",
        "intercept": float(final_linear.intercept_),
        "coefficients": linear_coefficients,
        "ridge_intercept": float(final_ridge.intercept_),
        "ridge_coefficients": ridge_coefficients,
        "random_forest_feature_importance": rf_importances,
        "scaler_mean": {feat: float(m) for feat, m in zip(feature_cols, scaler.mean_)},
        "scaler_scale": {feat: float(s) for feat, s in zip(feature_cols, scaler.scale_)},
        "summary": "LOX blast oxygen requirement correlates primarily with Total_Depth_calc_m (No_of_Holes x Depth) and charge column tube length."
    }

    # Save joblib models
    joblib.dump(final_linear, os.path.join(ARTIFACTS_DIR, "linear_regression_obs.joblib"))
    joblib.dump(final_rf, os.path.join(ARTIFACTS_DIR, "random_forest_obs.joblib"))
    joblib.dump(scaler, os.path.join(ARTIFACTS_DIR, "scaler.joblib"))

    # Save metadata JSON
    meta_path = os.path.join(ARTIFACTS_DIR, "model_metadata.json")
    with open(meta_path, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2)
    print(f"\nSaved model artifacts and metadata to: {meta_path}")

    return results

if __name__ == "__main__":
    train_and_evaluate()
