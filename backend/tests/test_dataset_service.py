import os
import pytest
import pandas as pd
import numpy as np
from app.services.dataset_service import DatasetDetector, DatasetCleaner

def test_detect_cic_ids_schema():
    cols = ["Destination Port", "Flow Duration", "Total Fwd Packets", "Label"]
    assert DatasetDetector.detect_schema(cols) == "CIC-IDS2017"

def test_detect_unsw_schema():
    cols = ["dur", "proto", "service", "sbytes", "dbytes", "attack_cat", "label"]
    assert DatasetDetector.detect_schema(cols) == "UNSW-NB15"

def test_detect_unknown_schema():
    cols = ["col1", "col2", "col3"]
    with pytest.raises(ValueError):
        DatasetDetector.detect_schema(cols)

def test_clean_flow_dataframe_handles_inf_and_nan():
    raw_data = {
        "Destination Port": [80, 443, 22],
        "Flow Duration": [1000, np.inf, 500],
        "Total Fwd Packets": [2, np.nan, 10],
        "Label": ["BENIGN", "DDoS", "BENIGN"]
    }
    df = pd.DataFrame(raw_data)
    cleaned_df = DatasetCleaner.clean_flow_dataframe(df, "CIC-IDS2017")
    assert not cleaned_df.isin([np.inf, -np.inf]).any().any()
    assert not cleaned_df.isna().any().any()
    assert len(cleaned_df) == 3

def test_real_sample_files_detection_and_cleaning():
    cic_path = "c:/CyberShield/datasets/samples/cic_ids2017_sample.csv"
    unsw_path = "c:/CyberShield/datasets/samples/unsw_nb15_sample.csv"
    
    assert os.path.exists(cic_path)
    assert os.path.exists(unsw_path)
    
    cic_df = pd.read_csv(cic_path)
    assert DatasetDetector.detect_schema(list(cic_df.columns)) == "CIC-IDS2017"
    cleaned_cic = DatasetCleaner.clean_flow_dataframe(cic_df, "CIC-IDS2017")
    assert len(cleaned_cic) == 10000
    
    unsw_df = pd.read_csv(unsw_path)
    assert DatasetDetector.detect_schema(list(unsw_df.columns)) == "UNSW-NB15"
    cleaned_unsw = DatasetCleaner.clean_flow_dataframe(unsw_df, "UNSW-NB15")
    assert len(cleaned_unsw) == 10000
