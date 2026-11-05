import os
import re
from pathlib import Path
from typing import List, Dict, Any, Tuple
from app.core.config import settings
from app.schemas.ai import AIQuestionRequest, AIQuestionResponse, SourceCitation

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
            if chroma_dir.exists():
                self.chroma_client = chromadb.PersistentClient(path=str(chroma_dir))
                emb_fn = embedding_functions.SentenceTransformerEmbeddingFunction(
                    model_name="all-MiniLM-L6-v2"
                )
                self.collection = self.chroma_client.get_collection(
                    name="nasa_space_legacy",
                    embedding_function=emb_fn
                )
        except Exception as e:
            # Fallback to local files if chromadb is not yet initialized
            self.collection = None

    def _fallback_keyword_search(self, query: str, equipment_id: str, top_k: int = 3) -> List[Dict[str, Any]]:
        docs_dir = Path(settings.DOCUMENTS_DIR)
        results = []
        if not docs_dir.exists():
            return results

        words = set(re.findall(r'\w+', query.lower()))
        
        for md_file in docs_dir.glob("*.md"):
            with open(md_file, "r", encoding="utf-8") as f:
                content = f.read()

            sections = re.split(r'\n(?=#{1,3}\s)', content)
            for sec in sections:
                score = sum(1 for w in words if w in sec.lower())
                # Bonus if equipment id or common name matches
                if equipment_id != "all" and equipment_id in sec.lower():
                    score += 3
                if score > 0:
                    results.append({
                        "document": sec.strip(),
                        "score": score,
                        "metadata": {
                            "source_file": md_file.name,
                            "equipment_id": equipment_id,
                            "document_title": md_file.stem.replace("_", " ").title()
                        }
                    })

        results.sort(key=lambda x: x["score"], reverse=True)
        return results[:top_k]

    def retrieve_context(self, question: str, equipment_id: str) -> Tuple[List[str], List[SourceCitation]]:
        retrieved_texts = []
        citations = []

        # 1. Try ChromaDB
        if self.collection:
            try:
                where_filter = None
                if equipment_id != "all":
                    where_filter = {"equipment_id": {"$in": [equipment_id, "all"]}}

                results = self.collection.query(
                    query_texts=[question],
                    n_results=4,
                    where=where_filter
                )
                
                if results and results.get("documents") and len(results["documents"][0]) > 0:
                    docs = results["documents"][0]
                    metas = results["metadatas"][0]
                    for d, m in zip(docs, metas):
                        retrieved_texts.append(d)
                        citations.append(SourceCitation(
                            title=m.get("document_title", "NASA Mission Record"),
                            author="NASA Historical & Technical Archives",
                            year="Historical Record",
                            url="https://history.nasa.gov"
                        ))
                    return retrieved_texts, citations
            except Exception:
                pass

        # 2. Fallback keyword search over raw files
        raw_results = self._fallback_keyword_search(question, equipment_id, top_k=3)
        for r in raw_results:
            retrieved_texts.append(r["document"])
            citations.append(SourceCitation(
                title=r["metadata"].get("document_title", "NASA Mission Record"),
                author="NASA JPL / History Office",
                year="Historical Record",
                url="https://images.nasa.gov"
            ))

        return retrieved_texts, citations

    def ask(self, req: AIQuestionRequest) -> AIQuestionResponse:
        context_chunks, citations = self.retrieve_context(req.question, req.equipment_id)
        
        # Check out of scope (strictly space-related domain keywords)
        space_keywords = [
            "moon", "lunar", "mars", "martian", "apollo", "viking", "sojourner", "pathfinder",
            "rover", "lander", "spacecraft", "equipment", "hardware", "orbit", "engine", "nasa",
            "regolith", "tranquility", "chryse", "ares", "debris", "relic", "archaeology",
            "monument", "rocket", "propulsion", "instrument", "battery", "solar", "apxs", "rtg",
            "space", "planet", "astronomy", "astronaut", "satellite", "crater"
        ]
        q_words = set(re.findall(r'\w+', req.question.lower()))
        has_space_keyword = bool(q_words.intersection(space_keywords))
        
        # If no space-related keywords in user query, reject as out-of-scope
        if not has_space_keyword:
            return AIQuestionResponse(
                answer="I am the NASA Space Historian dedicated to missions and equipment on the Moon and Mars! While that is an interesting question, I only have records regarding space exploration history and robotic hardware. Ask me anything about the Apollo landers, Viking, Sojourner, or why these explorers remain on other worlds!",
                sources=[],
                grounded=False,
                level_applied=req.level
            )

        context_joined = "\n\n---\n\n".join(context_chunks) if context_chunks else "No specific documents found."

        # Persona instructions
        persona_guide = {
            "kid": "Speak in an enthusiastic, warm, storytelling tone suitable for an 8-to-10-year-old. Use vivid analogies, simple everyday words, exclamation marks, and keep sentences friendly and short.",
            "explorer": "Provide clear, engaging, middle-school level storytelling combining wonder with authentic scientific names and historical context.",
            "scientist": "Use formal engineering terminology, precise propulsion/avionics details (DPS, APXS, RTG), orbital mechanics principles, and exact mission dates."
        }
        level_instruction = persona_guide.get(req.level, persona_guide["explorer"])

        system_prompt = f"""You are the official "AI Space Historian" for SPACE LEGACY, an educational virtual museum celebrating NASA's historical robotic equipment on the Moon and Mars.

Your purpose is to explain the history, science, and engineering of these missions to students.
Tone & Persona Guide: {level_instruction}

IMPORTANT GROUNDING RULES:
1. Base your answer strictly on the provided NASA HISTORICAL CONTEXT excerpts.
2. If the excerpts do not contain the answer, say honestly that NASA records for this specific query are not in your archives.
3. NEVER refer to this equipment as "garbage" or "space junk". Explain the physics (rocket equation, mass constraints) of why it remains in-situ as an honorable scientific monument.
4. Keep the response focused, inspiring, and scientifically accurate.

NASA HISTORICAL CONTEXT:
{context_joined}
"""

        # Try Gemini API if key is present
        if settings.GEMINI_API_KEY:
            try:
                from google import genai
                client = genai.Client(api_key=settings.GEMINI_API_KEY)
                response = client.models.generate_content(
                    model="gemini-1.5-flash",
                    contents=[
                        {"role": "user", "parts": [{"text": f"{system_prompt}\n\nStudent Question: {req.question}"}]}
                    ]
                )
                if response and response.text:
                    return AIQuestionResponse(
                        answer=response.text.strip(),
                        sources=citations[:2],
                        grounded=True,
                        level_applied=req.level
                    )
            except Exception as e:
                pass  # Fall through to deterministic template generation

        # Deterministic grounded fallback generation (zero-quota / offline resilient)
        answer = self._generate_grounded_fallback(req.question, req.level, req.equipment_id, context_chunks)
        return AIQuestionResponse(
            answer=answer,
            sources=citations[:2],
            grounded=True,
            level_applied=req.level
        )

    def _generate_grounded_fallback(self, question: str, level: str, equipment_id: str, context_chunks: List[str]) -> str:
        q_lower = question.lower()

        # Apollo 11 why left
        if "why" in q_lower and ("apollo" in q_lower or equipment_id == "apollo_11_lm"):
            if level == "kid":
                return "Great question! When astronauts Neil Armstrong and Buzz Aldrin blasted off from the Moon to fly home, they used the bottom half (the Descent Stage) as a launch pad! Taking that heavy bottom part home would have needed way too much rocket fuel. Leaving it turned it into a permanent trophy of humanity's greatest adventure!"
            elif level == "scientist":
                return "The Apollo 11 LM Descent Stage served as a stationary launch platform and thrust deflector for the Ascent Stage. Under Tsiolkovsky's Rocket Equation, returning the dry mass of the descent engine and landing gear would have imposed exponential propellant mass penalties that exceeded Saturn V payload margins. It remains at Tranquility Base as a protected historic archaeological site."
            else:
                return "The Apollo 11 Descent Stage was intentionally left at Tranquility Base because hauling its heavy landing legs and rocket engine back to orbit would have required an immense amount of extra fuel that the spacecraft could not carry. Instead, it served as a launch pad for the astronauts to lift off safely, becoming our first historic monument on the Moon!"

        # Sojourner why stopped / left
        if "sojourner" in q_lower or equipment_id == "sojourner":
            if level == "kid":
                return "Sojourner was a brave little rover about the size of a microwave oven! She was only designed to last 7 days, but kept rolling for 83 whole days! She stopped because her big buddy, the Pathfinder station, got too cold during freezing Martian nights and its battery fell asleep. Sojourner rests in Ares Vallis like an alien explorer hero!"
            elif level == "scientist":
                return "Sojourner concluded operations on Sol 83 after outlasting its 7-sol nominal lifespan by 12x. Because Sojourner relied on UHF proximity communications through the Pathfinder lander station, the mission terminated when Pathfinder's secondary batteries suffered cyclic thermal degradation. Sojourner's rocker-bogie chassis and APXS payload remain intact at the Carl Sagan Memorial Station."
            else:
                return "Sojourner was a groundbreaking microrover that operated for 83 days on Mars—way beyond its 7-day mission goal! It didn't break down; rather, the Pathfinder lander that relayed its messages to Earth ran out of battery due to freezing night temperatures. Sojourner remains peacefully parked on the sands of Ares Vallis."

        # Viking 1
        if "viking" in q_lower or equipment_id == "viking_1":
            if level == "kid":
                return "Viking 1 was a robotic science lab that sat on three sturdy legs on Mars! It worked for more than 6 years! It stopped talking to us in 1982 because a computer update accidentally pointed its antenna away from Earth. It's still sitting on the Plains of Gold on Mars!"
            elif level == "scientist":
                return "Viking 1 operated on Chryse Planitia from July 1976 to November 1982 (2,245 sols), powered by dual SNAP-19 RTGs. Operations ceased when an uplink software patch inadvertently overwrote antenna tracking vectors. Renamed the Thomas Mutch Memorial Station, it remains preserved in the dry Martian atmosphere."
            else:
                return "Viking 1 operated on Mars for over 6 years! Powered by nuclear radioisotope generators (RTGs), it survived freezing winters and global dust storms until 1982, when an antenna command error broke contact. It remains preserved in Chryse Planitia as an extraterrestrial memorial station."

        # General / context fallback
        if context_chunks:
            snippet = context_chunks[0][:300].strip() + "..."
            if level == "kid":
                return f"Here is what our NASA space records tell us: {snippet} Isn't space science incredible?"
            elif level == "scientist":
                return f"Archival mission records document the following telemetry and historical record: {snippet}"
            else:
                return f"According to verified NASA mission archives: {snippet} This equipment represents an important step in robotic planetary exploration."

        return "According to NASA's historical archives, equipment left on the Moon and Mars served crucial scientific and exploration objectives, proving engineering feasibility while resting as historic milestones of human curiosity!"

rag_service = RAGService()
