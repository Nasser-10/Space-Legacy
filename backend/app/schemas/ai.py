from pydantic import BaseModel, Field
from typing import List, Optional

class AIQuestionRequest(BaseModel):
    equipment_id: str = Field(..., description="ID of target equipment, or 'all'")
    question: str = Field(..., min_length=3, description="Student question")
    level: str = Field("explorer", description="Explanation level: 'kid', 'explorer', 'scientist'")

class SourceCitation(BaseModel):
    title: str
    author: Optional[str] = "NASA"
    year: Optional[str] = None
    url: str

class AIQuestionResponse(BaseModel):
    answer: str
    sources: List[SourceCitation] = []
    grounded: bool = True
    level_applied: str = "explorer"
