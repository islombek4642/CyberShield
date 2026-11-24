import pandas as pd
import numpy as np
from typing import List, Dict, Any, Optional

class DatasetDetector:
    CIC_IDS_SIGNATURE = {"destination port", "flow duration", "total fwd packets", "label"}
    UNSW_SIGNATURE = {"dur", "proto", "service", "sbytes", "dbytes", "label"}

    @classmethod
    def detect_schema(cls, columns: List[str]) -> str:
        """Ustunlar ro'yxatiga qarab dataset turini aniqlaydi."""
        normalized_cols = {col.strip().lower() for col in columns}
        
        # Check CIC-IDS2017 signature
        if cls.CIC_IDS_SIGNATURE.issubset(normalized_cols) or any("flow duration" in c for c in normalized_cols):
            return "CIC-IDS2017"
            
        # Check UNSW-NB15 signature
        if cls.UNSW_SIGNATURE.issubset(normalized_cols) or "attack_cat" in normalized_cols:
            return "UNSW-NB15"
            
        raise ValueError(f"Noma'lum dataset formati. Tizim CIC-IDS2017 yoki UNSW-NB15 datasetlarini qo'llab-quvvatlaydi.")

class DatasetCleaner:
    @classmethod
    def clean_flow_dataframe(cls, df: pd.DataFrame, schema_type: str) -> pd.DataFrame:
        """
        Tarmoq oqimlari jadvalidagi cheksiz (inf), bo'sh (nan) va
        noto'g'ri qiymatlarni tozalaydi.
        """
        cleaned = df.copy()
        
        # Ustun nomlaridagi ortiqcha bo'shliqlarni tozalash
        cleaned.columns = [c.strip() for c in cleaned.columns]
        
        # Raqamli ustunlardagi inf / -inf larni aniqlash va almashtirish
        numeric_cols = cleaned.select_dtypes(include=[np.number]).columns
        
        for col in numeric_cols:
            # Cheksiz qiymatlarni NaN ga aylantirish
            cleaned[col] = cleaned[col].replace([np.inf, -np.inf], np.nan)
            
            # Agar NaN bo'lsa, median yoki 0 bilan to'ldirish
            if cleaned[col].isna().any():
                median_val = cleaned[col].median()
                if pd.isna(median_val):
                    median_val = 0.0
                cleaned[col] = cleaned[col].fillna(median_val)
                
        # Matnli ustunlardagi bo'sh qiymatlarni 'Unknown' bilan to'ldirish
        object_cols = cleaned.select_dtypes(include=['object', 'string']).columns
        for col in object_cols:
            cleaned[col] = cleaned[col].fillna("Unknown")
            
        return cleaned

    @classmethod
    def get_feature_columns(cls, schema_type: str) -> List[str]:
        """Tegishli dataset uchun eng informativ xususiyatlar ro'yxatini qaytaradi."""
        if schema_type == "CIC-IDS2017":
            return [
                "Destination Port", "Flow Duration", "Total Fwd Packets",
                "Total Backward Packets", "Total Length of Fwd Packets",
                "Flow Bytes/s", "Flow Packets/s", "Flow IAT Mean",
                "Fwd Packet Length Max", "Fwd Packet Length Min"
            ]
        elif schema_type == "UNSW-NB15":
            return [
                "dur", "spkts", "dpkts", "sbytes", "dbytes",
                "sttl", "dttl", "sload", "dload", "sloss"
            ]
        return []
