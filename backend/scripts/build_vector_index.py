import argparse
import re
import sys
from pathlib import Path

backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from app.core.config import settings

INDEX_VERSION = 3
DOC_MAPPING = {
    "apollo_11_descent.md": {
        "equipment_id": "apollo_11_lm", "title": "Apollo 11 Mission Report (NASA SP-238)",
        "celestial_body": "moon", "source_url": "https://history.nasa.gov/alsj/a11/A11_MissionReport.pdf",
        "source_author": "NASA Manned Spacecraft Center", "source_year": "1969",
    },
    "viking_1_lander.md": {
        "equipment_id": "viking_1", "title": "The Viking Mission to Mars (NASA SP-334)",
        "celestial_body": "mars", "source_url": "https://ntrs.nasa.gov/citations/19770008581",
        "source_author": "NASA Scientific and Technical Information Office", "source_year": "1976",
    },
    "sojourner_pathfinder.md": {
        "equipment_id": "sojourner", "title": "Mars Pathfinder Mission Archive",
        "celestial_body": "mars", "source_url": "https://science.nasa.gov/mission/mars-pathfinder/",
        "source_author": "NASA / Jet Propulsion Laboratory", "source_year": "1997",
    },
    "planetary_protection_and_heritage.md": {
        "equipment_id": "all", "title": "NASA Planetary Protection",
        "celestial_body": "both", "source_url": "https://sma.nasa.gov/sma-disciplines/planetary-protection/",
        "source_author": "NASA Office of Safety and Mission Assurance", "source_year": "2024",
    },
}


def chunk_markdown(text: str, max_chars: int = 1200, overlap: int = 150):
    sections = re.split(r"\n(?=#{1,3}\s)", text)
    chunks = []
    for section in sections:
        section = section.strip()
        if not section:
            continue
        current = ""
        for paragraph in [p.strip() for p in section.split("\n\n") if p.strip()]:
            candidate = f"{current}\n\n{paragraph}".strip() if current else paragraph
            if len(candidate) <= max_chars:
                current = candidate
            else:
                if current:
                    chunks.append(current)
                    current = current[-overlap:] + "\n\n" + paragraph if overlap else paragraph
                else:
                    step = max(1, max_chars - overlap)
                    chunks.extend(paragraph[i:i + max_chars] for i in range(0, len(paragraph), step))
                    current = ""
        if current:
            chunks.append(current)
    return chunks


def build_vector_index(force_rebuild: bool = False):
    import chromadb
    from chromadb.utils import embedding_functions

    chroma_path = Path(settings.CHROMA_PERSIST_DIR)
    chroma_path.mkdir(parents=True, exist_ok=True)
    client = chromadb.PersistentClient(path=str(chroma_path))
    try:
        existing = client.get_collection("nasa_space_legacy")
        metadata = existing.metadata or {}
        current = (
            metadata.get("index_version") == INDEX_VERSION
            and metadata.get("embedding_model") == settings.EMBEDDING_MODEL_NAME
            and existing.count() > 0
        )
        if not force_rebuild and current:
            print(f"Vector index already current ({existing.count()} chunks); skipping rebuild.")
            return
        client.delete_collection("nasa_space_legacy")
    except Exception:
        pass

    embedding_fn = embedding_functions.SentenceTransformerEmbeddingFunction(
        model_name=settings.EMBEDDING_MODEL_NAME
    )
    collection = client.create_collection(
        name="nasa_space_legacy",
        embedding_function=embedding_fn,
        metadata={
            "description": "NASA mission and planetary-protection source excerpts",
            "index_version": INDEX_VERSION,
            "embedding_model": settings.EMBEDDING_MODEL_NAME,
            "hnsw:space": "l2",
        },
    )
    docs_dir = Path(settings.DOCUMENTS_DIR)
    if not docs_dir.exists():
        raise FileNotFoundError(f"Documents directory not found: {docs_dir}")
    ids, documents, metadatas = [], [], []
    for path in sorted(docs_dir.glob("*.md")):
        mapping = DOC_MAPPING.get(path.name)
        if not mapping:
            print(f"Skipping document without source mapping: {path.name}")
            continue
        for index, chunk in enumerate(chunk_markdown(path.read_text(encoding="utf-8"))):
            ids.append(f"{path.stem}_chunk_{index}")
            documents.append(chunk)
            metadatas.append({
                "source_file": path.name, "equipment_id": mapping["equipment_id"],
                "document_title": mapping["title"], "celestial_body": mapping["celestial_body"],
                "source_url": mapping["source_url"], "source_author": mapping["source_author"],
                "source_year": mapping["source_year"],
            })
    if not ids:
        raise RuntimeError("No source chunks generated; refusing to create an empty index.")
    collection.add(ids=ids, documents=documents, metadatas=metadatas)
    print(f"Indexed {len(ids)} chunks into {chroma_path}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--rebuild", action="store_true", help="Force rebuilding the vector index.")
    build_vector_index(force_rebuild=parser.parse_args().rebuild)
