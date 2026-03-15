from fastapi import APIRouter

router = APIRouter(tags=["Statistics"])

MODEL_METRICS = {
    "accuracy": 0.9685,
    "balanced_accuracy": 0.9612,
    "macro_f1": 0.9643,
    "attack_recall": 0.9394,
    "attack_precision": 0.9648,
    "roc_auc": 0.9938,
    "cv_balanced_accuracy": 0.9288,
    "threshold": 0.35,
    "train_size": 2016638,
    "test_size": 504160,
    "total_samples": 2520798,
    "n_features": 78,
    "confusion_matrix": {
        "tn": 331244,
        "fp": 5725,
        "fn": 10137,
        "tp": 157054,
    },
    "class_report": {
        "benign": {"precision": 0.97, "recall": 0.98, "f1": 0.98, "support": 336969},
        "attack": {"precision": 0.96, "recall": 0.94, "f1": 0.95, "support": 167191},
    },
    "execution_time_seconds": 1313.98,
}

DATASET_INFO = {
    "name": "CIC-IDS 2017",
    "total_samples_raw": 2830743,
    "total_samples_cleaned": 2520798,
    "benign_count": 2095057,
    "attack_count": 425741,
    "benign_pct": 83.1,
    "attack_pct": 16.9,
    "n_features": 78,
    "files": [
        {"name": "Monday-WorkingHours",           "type": "Normal Traffic",    "records": 529918},
        {"name": "Tuesday-WorkingHours",           "type": "Brute Force + DoS", "records": 445909},
        {"name": "Wednesday-WorkingHours",         "type": "Heartbleed + DoS",  "records": 692703},
        {"name": "Thursday-Morning-WebAttacks",    "type": "Web Attacks",       "records": 170366},
        {"name": "Thursday-Afternoon-Infiltration","type": "Infiltration",      "records": 288602},
        {"name": "Friday-Morning",                 "type": "Web Attacks",       "records": 191033},
        {"name": "Friday-Afternoon-PortScan",      "type": "Port Scan",         "records": 286467},
        {"name": "Friday-Afternoon-DDoS",          "type": "DDoS",              "records": 225745},
    ],
}

MODEL_ARCHITECTURE = {
    "type": "Soft Voting Ensemble",
    "estimators": [
        {
            "name": "Logistic Regression",
            "key": "LR",
            "params": {"max_iter": 1000, "class_weight": "balanced"},
        },
        {
            "name": "Random Forest",
            "key": "RF",
            "params": {
                "n_estimators": 60, "max_depth": 12,
                "min_samples_leaf": 5, "class_weight": "balanced_subsample",
            },
        },
        {
            "name": "Extra Trees",
            "key": "ET",
            "params": {
                "n_estimators": 60, "max_depth": 12,
                "min_samples_leaf": 5, "class_weight": "balanced",
            },
        },
    ],
    "preprocessing": "StandardScaler",
    "voting": "soft",
    "cross_validation": "5-Fold",
}


@router.get("/stats")
def get_stats():
    return {
        "metrics": MODEL_METRICS,
        "dataset": DATASET_INFO,
        "architecture": MODEL_ARCHITECTURE,
    }

@router.get("/stats/metrics")
def get_metrics():
    return MODEL_METRICS

@router.get("/stats/dataset")
def get_dataset():
    return DATASET_INFO