from fastapi import APIRouter
from app.api.v1.endpoints import equipment, timeline, quiz, ai

api_router = APIRouter()

api_router.include_router(equipment.router, prefix="/equipment", tags=["Equipment"])
api_router.include_router(timeline.router, prefix="/equipment", tags=["Timeline"])
api_router.include_router(quiz.router, prefix="/quiz", tags=["Quiz"])
api_router.include_router(ai.router, prefix="/ai", tags=["AI Space Historian"])
