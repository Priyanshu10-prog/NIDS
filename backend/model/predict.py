import joblib
import numpy as np
import os

MODEL_PATH = os.path.join(os.path.dirname(__file__), "pipeline.pkl")

pipeline = joblib.load(MODEL_PATH)

ATTACK_LABELS = {
    0: "BENIGN",
    1: "DDoS",
    2: "PortScan",
    3: "Web Attack",
    4: "Brute Force",
    5: "Infiltration",
    6: "DoS",
    7: "Heartbleed",
    8: "Bot"
}

def predict_single(features: list) -> dict:
    arr = np.array(features).reshape(1, -1)
    pred = int(pipeline.predict(arr)[0])
    proba = pipeline.predict_proba(arr)[0]
    confidence = float(np.max(proba))
    label = ATTACK_LABELS.get(pred, f"Class_{pred}")
    return {
        "prediction": pred,
        "label": label,
        "is_attack": pred != 0,
        "confidence": confidence
    }

def predict_batch(samples: list) -> list:
    return [predict_single(s) for s in samples]