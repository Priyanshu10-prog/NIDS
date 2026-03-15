from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from model.predict import predict_single, predict_batch

router = APIRouter(tags=["Prediction"])


class SingleInput(BaseModel):
    features: List[float]


class BatchInput(BaseModel):
    samples: List[List[float]]


@router.post("/predict")
def predict_one(body: SingleInput):
    if len(body.features) != 78:
        raise HTTPException(
            status_code=400,
            detail=f"Expected 78 features, got {len(body.features)}"
        )
    try:
        return predict_single(body.features)
    except FileNotFoundError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/predict/batch")
def predict_many(body: BatchInput):
    if not body.samples:
        raise HTTPException(status_code=400, detail="No samples provided")
    try:
        results = predict_batch(body.samples)
        attack_count = sum(1 for r in results if r["is_attack"])
        return {
            "total": len(results),
            "attacks": attack_count,
            "benign": len(results) - attack_count,
            "results": results,
        }
    except FileNotFoundError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))