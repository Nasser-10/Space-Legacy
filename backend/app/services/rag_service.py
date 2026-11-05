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
        "title": "Mars Pathfinder Mission Archive",
        "author": "NASA / Jet Propulsion Laboratory",
        "year": "1997",
        "url": "https://science.nasa.gov/mission/mars-pathfinder/",
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
ARABIC_QUERY_EXPANSIONS = {
    "القمر": {"moon", "lunar"}, "قمري": {"lunar"}, "المريخ": {"mars", "martian"},
    "مريخي": {"martian"}, "ابولو": {"apollo"}, "أبولو": {"apollo"},
    "فيكنج": {"viking"}, "فايكنج": {"viking"}, "سوجورنر": {"sojourner"},
    "باثفايندر": {"pathfinder"}, "روفر": {"rover"}, "مركبة": {"spacecraft"},
    "المركبة": {"spacecraft"}, "مسبار": {"spacecraft", "lander"},
    "ناسا": {"nasa"}, "صاروخ": {"rocket"}, "مدار": {"orbit"},
    "محرك": {"engine"}, "بطارية": {"battery"},
}
STOP_WORDS = {
    "what", "when", "where", "which", "who", "why", "how", "does", "did",
    "was", "were", "the", "and", "for", "with", "from", "this", "that",
    "its", "their", "about", "tell", "explain", "can", "could", "please",
    "هل", "ما", "ماذا", "متى", "أين", "اين", "كيف", "لماذا", "هو", "هي",
    "من", "عن", "في", "على", "إلى", "الى", "كان", "كانت", "مع", "هذا", "هذه",
}


def _tokens(text: str) -> set[str]:
    tokens = {
        token for token in re.findall(r"[\\w]+", text.casefold(), flags=re.UNICODE)
        if len(token) > 2 and token not in STOP_WORDS
    }
    expanded = set(tokens)
    for token in tokens:
        expanded.update(ARABIC_QUERY_EXPANSIONS.get(token, set()))
    return expanded


def _answer_has_evidence(answer: str, chunks: List[str]) -> bool:
    """Conservative lexical support check; not a substitute for human fact-checking."""
    evidence = _tokens(" ".join(chunks))
    claims = [
        sentence.strip() for sentence in re.split(r"(?<=[.!?؟])\s+|\n+", answer)
        if len(_tokens(sentence)) >= 4
    ]
    if not evidence or not claims:
        return False
    return all(
        len(_tokens(claim) & evidence) / max(1, len(_tokens(claim))) >= 0.35
        for claim in claims
    )


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
                model_name=settings.EMBEDDING_MODEL_NAME
            )
            self.collection = self.chroma_client.get_collection(
                name="nasa_space_legacy", embedding_function=embedding_fn
            )
        except Exception:
            self.collection = None

    @staticmethod
    def _citation_for(source_file: str, metadata: Dict[str, Any] | None = None):
        catalog = SOURCE_CATALOG.get(source_file)
        metadata = metadata or {}
        # Unknown sources are deliberately not turned into generic NASA citations.
        if not catalog:
            return None
        return SourceCitation(
            title=str(metadata.get("document_title") or catalog["title"]),
            author=str(metadata.get("source_author") or catalog["author"]),
            year=str(metadata.get("source_year") or catalog["year"]),
            url=str(metadata.get("source_url") or catalog["url"]),
        )

    def _fallback_keyword_search(
        self, query: str, equipment_id: str, top_k: int = 3
    ) -> List[Dict[str, Any]]:
        docs_dir = Path(settings.DOCUMENTS_DIR)
        if not docs_dir.exists():
            return []
        query_tokens = _tokens(query)
        if not query_tokens:
            return []
        results = []
        for md_file in docs_dir.glob("*.md"):
            source = SOURCE_CATALOG.get(md_file.name)
            if not source:
                continue
            source_equipment_id = source["equipment_id"]
            if equipment_id != "all" and source_equipment_id not in {equipment_id, "all"}:
                continue
            content = md_file.read_text(encoding="utf-8")
            sections = re.split(r"\n(?=#{1,3}\s)", content)
            for section in sections:
                section_tokens = _tokens(section)
                overlap = query_tokens & section_tokens
                if not overlap:
                    continue
                # Relevance must come from actual query/document overlap. Exhibit
                # selection is a filter, never an artificial score bonus.
                score = len(overlap) / (len(query_tokens) ** 0.5)
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
        candidates: List[Tuple[str, Dict[str, Any], float]] = []
        if self.collection is not None:
            try:
                count = self.collection.count()
                if count:
                    where_filter = None
                    if equipment_id != "all":
                        where_filter = {"equipment_id": {"$in": [equipment_id, "all"]}}
                    result = self.collection.query(
                        query_texts=[question],
                        n_results=min(6, count),
                        where=where_filter,
                        include=["documents", "metadatas", "distances"],
                    )
                    docs = (result.get("documents") or [[]])[0]
                    metas = (result.get("metadatas") or [[]])[0]
                    distances = (result.get("distances") or [[]])[0]
                    max_distance = float(settings.RAG_MAX_DISTANCE)
                    for doc, meta, distance in zip(docs, metas, distances):
                        if doc and distance is not None and float(distance) <= max_distance:
                            candidates.append((doc, meta or {}, float(distance)))
            except Exception:
                candidates = []

        if candidates:
            candidates.sort(key=lambda item: item[2])
            selected = candidates[:4]
        else:
            fallback = self._fallback_keyword_search(question, equipment_id)
            selected = [
                (item["document"], item["metadata"], 0.0)
                for item in fallback
            ]

        texts, citations, seen = [], [], set()
        for document, metadata, _ in selected:
            source_file = str(metadata.get("source_file") or "")
            citation = self._citation_for(source_file, metadata)
            # Do not return unsupported excerpts or fabricate a homepage citation.
            if not citation:
                continue
            texts.append(document)
            if citation.url not in seen:
                citations.append(citation)
                seen.add(citation.url)
        return texts, citations

    def ask(self, req: AIQuestionRequest) -> AIQuestionResponse:
        level = req.level if req.level in {"kid", "explorer", "scientist"} else "explorer"
        query_words = _tokens(req.question)
        if req.equipment_id == "all" and not query_words.intersection(SPACE_KEYWORDS):
            return AIQuestionResponse(
                answer=(
                    "I am the AI Space Historian for this museum. I can help with "
                    "NASA missions, lunar and Martian equipment, mission history, "
                    "and the science behind these explorers."
                ),
                sources=[], grounded=False, level_applied=level,
            )

        context_chunks, citations = self.retrieve_context(req.question, req.equipment_id)
        if not context_chunks:
            return AIQuestionResponse(
                answer=(
                    "I could not find a sufficiently relevant passage in the current "
                    "project archive. I do not want to guess. Try a more specific "
                    "question or choose an exhibit with available records."
                ),
                sources=[], grounded=False, level_applied=level,
            )

        persona = {
            "kid": "Use short, simple sentences and explain technical terms.",
            "explorer": "Give a clear educational explanation and define technical terms.",
            "scientist": "Use precise scientific language and distinguish source facts from interpretation.",
        }[level]
        system_prompt = f"""You are the AI Space Historian for an educational museum.
{persona}
Answer only using the archive excerpts below. If they do not answer the question,
say the archive does not contain enough information. Do not add outside facts,
dates, measurements, or inferred mission details. Answer in the question's language.
Keep claims close to the wording and facts in the excerpts.

ARCHIVE EXCERPTS:
{chr(10).join(context_chunks)}
"""
        if settings.GEMINI_API_KEY:
            try:
                from google import genai
                client = genai.Client(api_key=settings.GEMINI_API_KEY)
                response = client.models.generate_content(
                    model=settings.GEMINI_MODEL,
                    contents=f"{system_prompt}\n\nStudent question: {req.question}",
                )
                answer = response.text.strip() if response and response.text else ""
                if answer and _answer_has_evidence(answer, context_chunks):
                    return AIQuestionResponse(
                        answer=answer, sources=citations[:3],
                        grounded=True, level_applied=level,
                    )
            except Exception:
                pass

        excerpt = context_chunks[0].strip()
        if len(excerpt) > 900:
            excerpt = excerpt[:900].rsplit(" ", 1)[0] + "…"
        return AIQuestionResponse(
            answer=(
                "I found a relevant archive passage, but I could not verify a generated "
                "explanation against the retrieved evidence. Here is the source excerpt "
                "instead:\n\n" + excerpt
            ),
            sources=citations[:3], grounded=False, level_applied=level,
        )


rag_service = RAGService()
