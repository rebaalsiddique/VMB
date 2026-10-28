// ============================================================
// LOX Field Blast Training & Reference Dataset
// Sourced from LOX_Blast_Raw_and_Assumed_Data.xlsx
// ============================================================

import type { LOXDatasetRecord } from '@/lib/types';

export const LOX_DATASET_RECORDS: LOXDatasetRecord[] = [
  {
    "caseId": "4",
    "dataType": "Raw + assumed fields",
    "depthM": 9.0,
    "ftM": 6.5,
    "numberOfHoles": 10,
    "oxygenKg": 520.0,
    "rockType": "Limestone (assumed)",
    "rockDensityTpm3": 2.5,
    "waterCondition": "Dry (assumed)",
    "weather": "Clear (assumed)",
    "windCondition": "Light wind (assumed)",
    "fragmentationObservation": "Medium fragmentation (assumed)",
    "dustObservation": "Moderate dust (assumed)",
    "groundVibrationObservation": "Not measured",
    "airblastObservation": "Not measured",
    "muckpileObservation": "Moderate pile (assumed)",
    "notes": "Only O\u2082/depth/F.T./holes are from the image; other fields are assumptions.",
    "source": "LOX_Blast_Raw_and_Assumed_Data.xlsx"
  },
  {
    "caseId": "5",
    "dataType": "Raw + assumed fields",
    "depthM": 9.0,
    "ftM": 6.5,
    "numberOfHoles": 13,
    "oxygenKg": 520.0,
    "rockType": "Limestone (assumed)",
    "rockDensityTpm3": 2.5,
    "waterCondition": "Slightly wet (assumed)",
    "weather": "Clear (assumed)",
    "windCondition": "Light wind (assumed)",
    "fragmentationObservation": "Fine-to-medium fragmentation (assumed)",
    "dustObservation": "Moderate dust (assumed)",
    "groundVibrationObservation": "Not measured",
    "airblastObservation": "Not measured",
    "muckpileObservation": "Larger pile (assumed)",
    "notes": "Only O\u2082/depth/F.T./holes are from the image; other fields are assumptions.",
    "source": "LOX_Blast_Raw_and_Assumed_Data.xlsx"
  },
  {
    "caseId": "6",
    "dataType": "Raw + assumed fields",
    "depthM": 9.0,
    "ftM": 6.5,
    "numberOfHoles": 4,
    "oxygenKg": 220.0,
    "rockType": "Limestone (assumed)",
    "rockDensityTpm3": 2.5,
    "waterCondition": "Dry (assumed)",
    "weather": "Partly cloudy (assumed)",
    "windCondition": "Light wind (assumed)",
    "fragmentationObservation": "Coarse fragmentation (assumed)",
    "dustObservation": "Low-to-moderate dust (assumed)",
    "groundVibrationObservation": "Not measured",
    "airblastObservation": "Not measured",
    "muckpileObservation": "Small pile (assumed)",
    "notes": "Only O\u2082/depth/F.T./holes are from the image; other fields are assumptions.",
    "source": "LOX_Blast_Raw_and_Assumed_Data.xlsx"
  }
];

export const LOX_PARAMETER_DICTIONARY = [
  {
    "parameter": "Depth",
    "unit": "m",
    "meaning": "Recorded depth from the field note."
  },
  {
    "parameter": "F.T.",
    "unit": "m",
    "meaning": "Field-note parameter; exact meaning should be confirmed from the site's terminology."
  },
  {
    "parameter": "No. of Holes",
    "unit": "count",
    "meaning": "Number of holes recorded for the case."
  },
  {
    "parameter": "O\u2082 / Oxygen",
    "unit": "kg",
    "meaning": "Oxygen quantity recorded in the field note."
  },
  {
    "parameter": "Rock Type",
    "unit": "-",
    "meaning": "Material/rock classification; values marked assumed are placeholders."
  },
  {
    "parameter": "Rock Density",
    "unit": "t/m\u00b3",
    "meaning": "Material density for analysis; assumed values must be replaced with measured data."
  },
  {
    "parameter": "Water Condition",
    "unit": "-",
    "meaning": "Dry/wet condition observed in holes or working area."
  },
  {
    "parameter": "Weather",
    "unit": "-",
    "meaning": "General weather at the time of observation."
  },
  {
    "parameter": "Wind Condition",
    "unit": "-",
    "meaning": "General wind condition; avoid using this as a safety/design calculation."
  },
  {
    "parameter": "Fragmentation Observation",
    "unit": "-",
    "meaning": "Qualitative post-event observation."
  },
  {
    "parameter": "Dust Observation",
    "unit": "-",
    "meaning": "Qualitative dust observation."
  },
  {
    "parameter": "Ground Vibration Observation",
    "unit": "-",
    "meaning": "Measured or observed result; use instrument readings when available."
  },
  {
    "parameter": "Airblast Observation",
    "unit": "-",
    "meaning": "Measured or observed result; use instrument readings when available."
  },
  {
    "parameter": "Muckpile Observation",
    "unit": "-",
    "meaning": "Qualitative post-event material/pile observation."
  }
];

export const DATASET_METADATA = {
  fileName: 'LOX_Blast_Raw_and_Assumed_Data.xlsx',
  trainingCasesCount: 3,
  isDemoWarning: true,
  warningMessage: 'Current dataset contains assumed/demo parameters. Predictions are for educational demonstration and should not be treated as validated field predictions.',
  fields: {
    measured: ['Depth (m)', 'F.T. (m)', 'No. of Holes', 'O₂ / Oxygen (kg)'],
    assumed: ['Rock Type', 'Rock Density (t/m³)', 'Water Condition', 'Weather', 'Wind Condition', 'Fragmentation Observation', 'Dust Observation', 'Muckpile Observation'],
    unmeasured: ['Ground Vibration', 'Airblast']
  }
};
