import re
from pathlib import Path
from typing import Any, Dict, List, Tuple

from app.core.config import settings
from app.schemas.ai import AIQuestionRequest, AIQuestionResponse, SourceCitation


SOURCE_CATALOG = {
    "apollo_11_descent.md": {
        "equipment_id": "apollo_11_lm",
        "title": "Apollo 11 Mission Report (NASA SP-238)",
        "author": "NASA Manned Spacecraft Center",
        "year": "1969",
        "url": "https://history.nasa.gov/alsj/a11/A11_MissionReport.pdf",
    },
    "viking_1_lander.md": {
        "equipment_id": "viking_1",
        "title": "The Viking Mission to Mars (NASA SP-334)",
        "author": "NASA Scientific and Technical Information Office",
        "year": "1976",
        "url": "https://ntrs.nasa.gov/citations/19770008581",
    },
    "sojourner_pathfinder.md": {
        "equipment_id": "sojourner",
        "title": "Mars Pathfinder Microrover Operations",
        "author": "NASA Jet Propulsion Laboratory",
        "year": "1997",
        "url": "https://mars.nasa.gov/resources/pathfinder-status",
    },
    "planetary_protection_and_heritage.md": {
        "equipment_id": "all",
        "title": "NASA Planetary Protection",
        "author": "NASA Office of Safety and Mission Assurance",
        "year": "2024",
        "url": "https://sma.nasa.gov/sma-disciplines/planetary-protection/",
    },
}

SPACE_KEYWORDS = {
    "moon", "lunar", "mars", "martian", "apollo", "viking", "sojourner",
    "pathfinder", "rover", "lander", "spacecraft", "equipment", "hardware",
    "orbit", "engine", "nasa", "regolith", "crater", "rocket", "propulsion",
    "instrument", "battery", "solar", "apxs", "rtg", "space", "planet",
    "astronomy", "astronaut", "satellite", "survey", "opportunity",
}


class RAGService:
    def __init__(self):
        self.chroma_client = None
        self.collection = None
        self._init_chroma()

    def _init_chroma(self):
        try:
            import chromadb
            from chromadb.utils import embedding_functions

            chroma_dir = Path(settings.CHROMA_PERSIST_DIR)
            if not chroma_dir.exists():
                return

            self.chroma_client = chromadb.PersistentClient(path=str(chroma_dir))
            embedding_fn = embedding_functions.SentenceTransformerEmbeddingFunction(
                model_name=settings.EMBEDDING_MODEL_NAME.split("/")[-1]
            )
            self.collection = self.chroma_client.get_collection(
                name="nasa_space_legacy",
                embedding_function=embedding_fn,
            )
        except Exception:
            # The document-based keyword retriever remains available if Chroma
            # is missing, empty, or has not been built yet.
            self.collection = None

    @staticmethod
    def _citation_for(source_file: str) -> SourceCitation:
        metadata = SOURCE_CATALOG.get(source_file, {})
        return SourceCitation(
            title=metadata.get("title", Path(source_file).stem.replace("_", " ").title()),
            author=metadata.get("author", "NASA"),
            year=metadata.get("year", "Historical archive"),
            url=metadata.get("url", "https://www.nasa.gov/"),
        )

    def _fallback_keyword_search(
        self, query: str, equipment_id: str, top_k: int = 3
    ) -> List[Dict[str, Any]]:
        docs_dir = Path(settings.DOCUMENTS_DIR)
        if not docs_dir.exists():
            return []

        stop_words = {
            "what", "when", "where", "which", "who", "why", "how", "does",
            "did", "was", "were", "the", "and", "for", "with", "from", "this",
            "that", "its", "their", "about", "tell", "explain", "can", "could",
        }
        words = {
            word for word in re.findall(r"\w+", query.lower())
            if len(word) > 2 and word not in stop_words
        }
        results = []

        for md_file in docs_dir.glob("*.md"):
            source = SOURCE_CATALOG.get(md_file.name, {})
            source_equipment_id = source.get("equipment_id", "all")
            if equipment_id != "all" and source_equipment_id not in {equipment_id, "all"}:
                continue

            content = md_file.read_text(encoding="utf-8")
            sections = re.split(r"\n(?=#{1,3}\s)", content)
            for section in sections:
                section_lower = section.lower()
                score = sum(1 for word in words if word in section_lower)
                if source_equipment_id == equipment_id and equipment_id != "all":
                    score += 2
                if score > 0:
                    results.append({
                        "document": section.strip(),
                        "score": score,
                        "metadata": {"source_file": md_file.name},
                    })

        results.sort(key=lambda item: item["score"], reverse=True)
        return results[:top_k]

    def retrieve_context(
        self, question: str, equipment_id: str
    ) -> Tuple[List[str], List[SourceCitation]]:
        retrieved_texts: List[str] = []
        citations: List[SourceCitation] = []
        seen_sources = set()

        if self.collection is not None:
            try:
                count = self.collection.count()
                if count:
                    where_filter = None
                    if equipment_id != "all":
                        where_filter = {"equipment_id": {"$in": [equipment_id, "all"]}}
                    results = self.collection.query(
                        query_texts=[question],
                        n_results=min(4, count),
                        where=where_filter,
                    )
                    documents = (results.get("documents") or [[]])[0]
                    metadatas = (results.get("metadatas") or [[]])[0]
                    for document, metadata in zip(documents, metadatas):
                        if not document:
                            continue
                        retrieved_texts.append(document)
                        source_file = (metadata or {}).get("source_file", "")
                        citation = self._citation_for(source_file)
                        if citation.url not in seen_sources:
                            citations.append(citation)
                            seen_sources.add(citation.url)
            except Exception:
                # Fall back to raw Markdown files on any index/query issue.
                retrieved_texts = []
                citations = []

        if not retrieved_texts:
            for result in self._fallback_keyword_search(question, equipment_id):
                retrieved_texts.append(result["document"])
                source_file = result["metadata"]["source_file"]
                citation = self._citation_for(source_file)
                if citation.url not in seen_sources:
                    citations.append(citation)
                    seen_sources.add(citation.url)

        return retrieved_texts, citations

    def ask(self, req: AIQuestionRequest) -> AIQuestionResponse:
        level = req.level if req.level in {"kid", "explorer", "scientist"} else "explorer"

        # For the global chat, reject clearly unrelated questions. In an
        # equipment-specific chat, short follow-ups such as "why was it left?"
        # are valid because the selected exhibit supplies the subject.
        query_words = set(re.findall(r"\w+", req.question.lower()))
        if req.equipment_id == "all" and not query_words.intersection(SPACE_KEYWORDS):
            return AIQuestionResponse(
                answer=(
                    "I am the AI Space Historian for this museum. I can help with "
                    "NASA missions, lunar and Martian equipment, mission history, "
                    "and the science behind these explorers."
                ),
                sources=[],
                grounded=False,
                level_applied=level,
            )

        context_chunks, citations = self.retrieve_context(req.question, req.equipment_id)
        if not context_chunks:
            return AIQuestionResponse(
                answer=(
                    "I could not find a relevant document in the current project archive "
                    "for this question. I do not want to guess. Try a more specific "
                    "question or choose an exhibit with available records."
                ),
                sources=[],
                grounded=False,
                level_applied=level,
            )

        persona_guide = {
            "kid": (
                "Explain in short, simple sentences suitable for a young learner. "
                "Use clear analogies only when they are supported by the context."
            ),
            "explorer": (
                "Give an engaging explanation for a middle-school or high-school learner, "
                "introducing technical terms in plain language."
            ),
            "scientist": (
                "Use precise engineering and scientific terminology. Distinguish facts "
                "stated in the documents from reasonable interpretation."
            ),
        }

        system_prompt = f"""You are the AI Space Historian for SPACE LEGACY, an educational museum.
Audience level: {level}. {persona_guide[level]}

Evidence rules:
1. Answer only from the supplied archive excerpts.
2. If the excerpts do not answer the question, say that the current archive does not contain enough information.
3. Never invent dates, measurements, mission outcomes, quotations, or source details.
4. Do not imply that an answer is independently verified beyond the cited excerpts.
5. Answer in the same language as the student's question.
6. Keep the explanation focused and age-appropriate.

ARCHIVE EXCERPTS:
{chr(10).join(context_chunks)}
"""

        if settings.GEMINI_API_KEY:
            try:
                from google import genai

                client = genai.Client(api_key=settings.GEMINI_API_KEY)
                response = client.models.generate_content(
                    model="gemini-2.5-flash",
                    contents=f"{system_prompt}\n\nStudent question: {req.question}",
                )
                if response and response.text:
                    return AIQuestionResponse(
                        answer=response.text.strip(),
                        sources=citations[:3],
                        grounded=True,
                        level_applied=level,
                    )
            except Exception:
                # A transparent excerpt-based fallback is safer than a
                # fabricated mission-specific answer.
                pass

        excerpt = context_chunks[0].strip()
        if len(excerpt) > 900:
            excerpt = excerpt[:900].rsplit(" ", 1)[0] + "…"
        return AIQuestionResponse(
            answer=(
                "I found a relevant passage in the project archive, but the AI "
                "explanation service is unavailable right now. Here is the retrieved "
                f"record excerpt:\n\n{excerpt}"
            ),
            sources=citations[:3],
            grounded=True,
            level_applied=level,
        )


rag_service = RAGService()
