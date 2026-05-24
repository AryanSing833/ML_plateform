import uvicorn
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="MLOps Test API", version="0.1.0")

class PredictionRequest(BaseModel):
    features: list[float]

class PredictionResponse(BaseModel):
    prediction: int

@app.get("/")
def read_root():
    return {"message": "Welcome to the MLOps API"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.post("/predict", response_model=PredictionResponse)
def predict(request: PredictionRequest):
    return {"prediction": 1}

if __name__ == "__main__":
    uvicorn.run("src.inference:app", host="0.0.0.0", port=8000)
