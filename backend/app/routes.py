from fastapi import APIRouter, UploadFile, File
from app.gemini import analyze_image

router = APIRouter()

@router.post("/predict")
async def predict(file: UploadFile = File(...)):
    result = await analyze_image(file)
    return result
