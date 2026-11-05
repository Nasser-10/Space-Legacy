import argparse
import re
import sys
from pathlib import Path

backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from app.core.config import settings


INDEX_VERSION = 2

DOC_MAPPING = {
    "apollo_11_descent.md": {
        "equipment_id": "apollo_11_lm",
        "title": "Apollo 11 Mission Report (NASA SP-238)",
        "celestial_body": "moon",
        "source_url": "https://history.nasa.gov/alsj/a11/A11_MissionReport.pdf",
        "source_author": "NASA Manned Spacecraft Center",
        "source_year": "1969",
    },
    "viking_1_lander.md": {
        "equipment_id": "viking_1",
        "title": "The Viking Mission to Mars (NASA SP-334)",
        "celestial_body": "mars",
        "source_url": "https://ntrs.nasa.gov/citations/19770008581",
        "source_author": "NASA Scientific and Technical Information Office",
        "source_year": "1976",
    },
    "sojourner_pathfinder.md": {
        "equipment_id": "sojourner",
        "title": "Mars Pathfinder Microrover Operations",
        "celestial_body": "mars",
        "source_url": "https://mars.nasa.gov/resources/pathfinder-status",
        "source_author": "NASA Jet Propulsion Laboratory",
        "source_year": "1997",
    },
    "planetary_protection_and_heritage.md": {
        "equipment_id": "all",
        "title": "NASA Planetary Protection",
        "celestial_body": "both",
        "source_url": "https://sma.nasa.gov/sma-disciplines/planetary-protection/",
        "source_author": "NASA Office of Safety and Mission Assurance",
        "source_year": "2024",
    },
}


def chunk_markdown(text: str, max_chars: int = 1200, overlap: int = 150):
    """Split Markdown into bounded chunks while retaining a small text overlap."""
    sections = re.split(r"\n(?=#{1,3}\s)", text)
    chunks = []

    for section in sections:
        section = section.strip()
        if not section:
            continue
        paragraphs = [part.strip() for part in section.split("\n\n") if part.strip()]
        current = ""
        for paragraph in paragraphs:
            candidate = f"{current}\n\n{paragraph}".strip() if current else paragraph
            if len(candidate) <= max_chars:
                current = candidate
                continue

            if current:
                chunks.append(current)
                current = current[-overlap:] + "\n\n" + paragraph if overlap else paragraph
            else:
                # Avoid creating a chunk larger than max_chars for a long paragraph.
                for start in range(0, len(paragraph), max_chars - overlap):
                    chunks.append(paragraph[start:start + max_chars])
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
        if (
            not force_rebuild
            and metadata.get("index_version") == INDEX_VERSION
            and existing.count() > 0
        ):
            print(f"Vector index already current ({existing.count()} chunks); skipping rebuild.")
            return
        client.delete_collection("nasa_space_legacy")
    except Exception:
        pass

    embedding_fn = embedding_functions.SentenceTransformerEmbeddingFunction(
        model_name=settings.EMBEDDING_MODEL_NAME.split("/")[-1]
    )
    collection = client.create_collection(
        name="nasa_space_legacy",
        embedding_function=embedding_fn,
        metadata={
            "description": "NASA mission and planetary-protection source excerpts",
            "index_version": INDEX_VERSION,
        },
    )

    docs_dir = Path(settings.DOCUMENTS_DIR)
    if not docs_dir.exists():
        raise FileNotFoundError(f"Documents directory not found: {docs_dir}")

    ids, documents, metadatas = [], [], []
    for document_path in sorted(docs_dir.glob("*.md")):
        mapping = DOC_MAPPING.get(document_path.name)
        if not mapping:
            print(f"Skipping document without a source mapping: {document_path.name}")
            continue

        content = document_path.read_text(encoding="utf-8")
        for index, chunk in enumerate(chunk_markdown(content)):
            ids.append(f"{document_path.stem}_chunk_{index}")
            documents.append(chunk)
            metadatas.append({
                "source_file": document_path.name,
                "equipment_id": mapping["equipment_id"],
                "document_title": mapping["title"],
                "celestial_body": mapping["celestial_body"],
                "source_url": mapping["source_url"],
                "source_author": mapping["source_author"],
                "source_year": mapping["source_year"],
            })

    if not ids:
        raise RuntimeError("No source chunks were generated; refusing to create an empty index.")

    collection.add(ids=ids, documents=documents, metadatas=metadatas)
    print(f"Indexed {len(ids)} chunks into {chroma_path}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--rebuild",
        action="store_true",
        help="Force deletion and rebuilding of the existing vector index.",
    )
    args = parser.parse_args()
    build_vector_index(force_rebuild=args.rebuild)
