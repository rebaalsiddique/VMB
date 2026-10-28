# Virtual Mining Blast ML Model Evaluation Report
**Dataset**: `Virtual_Mining_Blast_ML_Dataset.xlsx`
**Total Blasts Analyzed**: 220 (Observed: 20 | Synthetic: 200)
**Observed Blast Date Range**: 2026-08-10 to 2026-09-25

## 1. Feature Distribution: Observed vs. Synthetic
| Feature | Observed Mean (±std) | Synthetic Mean (±std) | Unit |
|---|---|---|---|
| `No_of_Holes` | 7.55 (±3.19) | 7.54 (±3.03) | holes |
| `Depth_m` | 8.38 (±1.34) | 8.38 (±1.39) | m |
| `Tube_Length_m_imputed` | 5.81 (±1.25) | 5.80 (±1.22) | m |
| `Oxygen_kg` | 380.50 (±195.08) | 392.38 (±188.65) | kg |
| `Total_Depth_calc_m` | 64.22 (±32.18) | 64.47 (±31.55) | m |
| `Tube_to_Depth_Ratio` | 0.69 (±0.07) | 0.69 (±0.07) | ratio |

## 2. 5-Fold Cross-Validation Performance Benchmarks
### Partition A: Observed Data Only (N=20)
| Model Architecture | CV R² Score | CV MAE (kg) | CV RMSE (kg) | Status |
|---|---|---|---|---|
| **Linear Regression** | -2.527 ± 6.27 | 210.7 kg | 248.3 kg | Overfit / High Variance |
| **Ridge Regression** | 0.609 ± 0.27 | 68.5 kg | 95.4 kg | Moderate |
| **Random Forest** | 0.791 ± 0.16 | 55.3 kg | 78.7 kg | Robust |
| **Gradient Boosting** | 0.756 ± 0.16 | 51.0 kg | 82.6 kg | Robust |

### Partition B: Synthetic Data Only (N=200)
| Model Architecture | CV R² Score | CV MAE (kg) | CV RMSE (kg) |
|---|---|---|---|
| **Linear Regression** | 0.796 ± 0.04 | 62.8 kg | 83.3 kg |
| **Ridge Regression** | 0.796 ± 0.04 | 63.5 kg | 83.3 kg |
| **Random Forest** | 0.852 ± 0.06 | 46.7 kg | 69.0 kg |
| **Gradient Boosting** | 0.839 ± 0.06 | 48.7 kg | 72.2 kg |

### Partition C: Combined All Data (N=220)
| Model Architecture | CV R² Score | CV MAE (kg) | CV RMSE (kg) |
|---|---|---|---|
| **Linear Regression** | 0.802 ± 0.03 | 61.9 kg | 82.1 kg |
| **Ridge Regression** | 0.804 ± 0.03 | 61.7 kg | 81.7 kg |
| **Random Forest** | 0.864 ± 0.04 | 44.9 kg | 67.5 kg |
| **Gradient Boosting** | 0.861 ± 0.03 | 46.3 kg | 68.7 kg |

## 3. Generalization & Domain Transfer (Synthetic-Trained -> Real-Observed Tested)
| Model Architecture | Generalization R² | Field MAE (kg) | Field RMSE (kg) | Physical Generalization |
|---|---|---|---|---|
| **Linear Regression** | 0.8668 | 49.73 kg | 69.40 kg | Good (>0.85) |
| **Ridge Regression** | 0.8681 | 49.98 kg | 69.05 kg | Good (>0.85) |
| **Random Forest** | 0.9633 | 23.22 kg | 36.44 kg | Excellent (>0.95) |
| **Gradient Boosting** | 0.9674 | 24.65 kg | 34.33 kg | Excellent (>0.95) |

## 4. Feature Importance Rankings (Tree Ensemble)
| Rank | Feature Name | Importance Weight | Physical Significance |
|---|---|---|---|
| 1 | `Holes_x_Tube` | 49.53% | Total aggregate explosive column length across all blast holes |
| 2 | `Total_Depth_calc_m` | 40.22% | Total meters drilled (Burden/Bench volume proxy) |
| 3 | `No_of_Holes` | 7.32% | Array hole count influencing energy distribution |
| 4 | `Tube_to_Depth_Ratio` | 1.18% | Charge column ratio relative to stemming height |
| 5 | `Depth_m` | 1.09% | Individual hole depth |
| 6 | `Stemming_Est_m` | 0.63% | Estimated inert stemming collar length |
| 7 | `Tube_Length_m_imputed` | 0.04% | Charge tube length |