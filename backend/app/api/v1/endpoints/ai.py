from fastapi import APIRouter
from app.schemas.ai import AIQuestionRequest, AIQuestionResponse
from app.services.rag_service import rag_service

router = APIRouter()

@router.post("/ask", response_model=AIQuestionResponse)
def ask_ai_historian(req: AIQuestionRequest):
    """
    Query the AI Space Historian with Retrieval-Augmented Generation (RAG).
    Supports 3 explanation levels: 'kid', 'explorer', 'scientist'.
    Returns grounded educational answer with official NASA source citations.
    """
    return rag_service.ask(req)
