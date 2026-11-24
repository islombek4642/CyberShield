import os
import joblib
import pandas as pd
import numpy as np
from typing import Dict, Any, Optional, List
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix
from app.services.dataset_service import DatasetCleaner

MODEL_DIR = "c:/CyberShield/backend/app/ml/saved_models"

class MLService:
    _models: Dict[str, Any] = {}
    _features: Dict[str, List[str]] = {}
    _metrics: Dict[str, Dict[str, Any]] = {}

    @classmethod
    def _get_model_path(cls, dataset_type: str) -> str:
        os.makedirs(MODEL_DIR, exist_ok=True)
        safe_name = dataset_type.lower().replace("-", "_")
        return os.path.join(MODEL_DIR, f"{safe_name}_rf_model.joblib")

    @classmethod
    def train_model(cls, dataset_path: str, dataset_type: str = "CIC-IDS2017", n_estimators: int = 40) -> Dict[str, Any]:
        """
        Tarmoq trafigi datasetini tozalaydi, modelni o'qitadi,
        metrikalarni hisoblaydi va saqlaydi.
        """
        df = pd.read_csv(dataset_path)
        cleaned_df = DatasetCleaner.clean_flow_dataframe(df, dataset_type)
        
        feature_cols = DatasetCleaner.get_feature_columns(dataset_type)
        # Agar barcha featurelar bo'lmasa, mavjud raqamli ustunlarni tanlaymiz
        valid_features = [col for col in feature_cols if col in cleaned_df.columns]
        if not valid_features:
            valid_features = list(cleaned_df.select_dtypes(include=[np.number]).columns)
            if "label" in valid_features:
                valid_features.remove("label")
                
        # Target column
        label_col = "Label" if "Label" in cleaned_df.columns else "attack_cat" if "attack_cat" in cleaned_df.columns else "label"
        
        X = cleaned_df[valid_features]
        y = cleaned_df[label_col].astype(str)
        
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y if len(y.unique()) > 1 else None
        )
        
        # O'qitish: nomutanosib sinflar uchun balanced weight
        clf = RandomForestClassifier(
            n_estimators=n_estimators,
            max_depth=12,
            class_weight="balanced",
            random_state=42,
            n_jobs=-1
        )
        clf.fit(X_train, y_train)
        
        y_pred = clf.predict(X_test)
        
        # Metrikalarni hisoblash
        acc = float(accuracy_score(y_test, y_pred))
        prec = float(precision_score(y_test, y_pred, average="weighted", zero_division=0))
        rec = float(recall_score(y_test, y_pred, average="weighted", zero_division=0))
        f1 = float(f1_score(y_test, y_pred, average="weighted", zero_division=0))
        
        labels_list = sorted(list(y.unique()))
        cm = confusion_matrix(y_test, y_pred, labels=labels_list)
        
        # Feature importance
        importances = [
            {"feature": col, "importance": round(float(imp), 4)}
            for col, imp in zip(valid_features, clf.feature_importances_)
        ]
        importances = sorted(importances, key=lambda x: x["importance"], reverse=True)
        
        metrics = {
            "dataset_type": dataset_type,
            "accuracy": round(acc, 4),
            "precision": round(prec, 4),
            "recall": round(rec, 4),
            "f1_score": round(f1, 4),
            "confusion_matrix": {
                "labels": labels_list,
                "matrix": cm.tolist()
            },
            "feature_importance": importances,
            "total_samples": len(df),
            "features_used": valid_features
        }
        
        # Saqlash
        model_path = cls._get_model_path(dataset_type)
        joblib.dump({"model": clf, "features": valid_features, "metrics": metrics}, model_path)
        
        cls._models[dataset_type] = clf
        cls._features[dataset_type] = valid_features
        cls._metrics[dataset_type] = metrics
        
        return metrics

    @classmethod
    def ensure_model_loaded(cls, dataset_type: str = "CIC-IDS2017"):
        if dataset_type in cls._models:
            return
            
        model_path = cls._get_model_path(dataset_type)
        if os.path.exists(model_path):
            data = joblib.load(model_path)
            cls._models[dataset_type] = data["model"]
            cls._features[dataset_type] = data["features"]
            cls._metrics[dataset_type] = data.get("metrics", {})
        else:
            # Namuna datasetdan avtomatik o'qitish
            sample_file = "cic_ids2017_sample.csv" if dataset_type == "CIC-IDS2017" else "unsw_nb15_sample.csv"
            sample_path = os.path.join("c:/CyberShield/datasets/samples", sample_file)
            if os.path.exists(sample_path):
                cls.train_model(sample_path, dataset_type=dataset_type, n_estimators=25)
            else:
                raise FileNotFoundError(f"Model yoki namuna dataset topilmadi: {sample_path}")

    @classmethod
    def predict_flow(cls, flow_data: Dict[str, Any], dataset_type: str = "CIC-IDS2017") -> Dict[str, Any]:
        cls.ensure_model_loaded(dataset_type)
        
        clf = cls._models[dataset_type]
        features = cls._features[dataset_type]
        
        # Input vektorni shakllantirish
        row_vals = []
        for feat in features:
            val = flow_data.get(feat, 0.0)
            try:
                row_vals.append(float(val))
            except (ValueError, TypeError):
                row_vals.append(0.0)
                
        X_input = pd.DataFrame([row_vals], columns=features)
        
        # Prediction
        pred_label = str(clf.predict(X_input)[0])
        probas = clf.predict_proba(X_input)[0]
        confidence = float(np.max(probas))
        
        # Normal yoki hujum ekanligini ajratish
        is_attack = pred_label.upper() not in ["BENIGN", "NORMAL", "0"]
        
        # Severity calculation
        if not is_attack:
            severity = "LOW"
        elif pred_label in ["DDoS", "Infiltration", "Botnet", "Exploits", "Backdoors"]:
            severity = "CRITICAL" if confidence > 0.85 else "HIGH"
        elif pred_label in ["PortScan", "Brute Force", "DoS", "Fuzzers"]:
            severity = "HIGH" if confidence > 0.80 else "MEDIUM"
        else:
            severity = "MEDIUM"
            
        return {
            "is_attack": is_attack,
            "attack_type": pred_label,
            "confidence": round(confidence, 4),
            "severity": severity,
            "features_analyzed": len(features)
        }

    @classmethod
    def get_metrics(cls, dataset_type: str = "CIC-IDS2017") -> Dict[str, Any]:
        cls.ensure_model_loaded(dataset_type)
        return cls._metrics.get(dataset_type, {})
