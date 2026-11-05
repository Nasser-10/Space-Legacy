import os
import sys
import re
from pathlib import Path

backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from app.core.config import settings

def chunk_markdown(text: str, max_chars: int = 1200, overlap: int = 150):
    """
    Split markdown text into section-aware chunks.
    Preserves headings where possible.
    """
    sections = re.split(r'\n(?=#{1,3}\s)', text)
    chunks = []
    
    for sec in sections:
        sec = sec.strip()
        if not sec:
            continue
        if len(sec) <= max_chars:
            chunks.append(sec)
        else:
            paragraphs = sec.split('\n\n')
            current_chunk = ""
            for p in paragraphs:
                if len(current_chunk) + len(p) + 2 <= max_chars:
                    current_chunk += p + "\n\n"
                else:
                    if current_chunk.strip():
                        chunks.append(current_chunk.strip())
                    current_chunk = p + "\n\n"
            if current_chunk.strip():
                chunks.append(current_chunk.strip())
                
    return chunks

def build_vector_index():
    print("Building ChromaDB vector index from official NASA documents...")
    import chromadb
    from chromadb.utils import embedding_functions

    chroma_path = Path(settings.CHROMA_PERSIST_DIR)
    chroma_path.mkdir(parents=True, exist_ok=True)
    
    client = chromadb.PersistentClient(path=str(chroma_path))
    
    # Use SentenceTransformers embedding function
    print("Initializing embedding function (all-MiniLM-L6-v2)...")
    emb_fn = embedding_functions.SentenceTransformerEmbeddingFunction(
        model_name="all-MiniLM-L6-v2"
    )
    
    # Get or create collection
    try:
        client.delete_collection("nasa_space_legacy")
        print("Deleted existing collection 'nasa_space_legacy'")
    except Exception:
        pass
        
    collection = client.create_collection(
        name="nasa_space_legacy",
        embedding_function=emb_fn,
        metadata={"description": "Authoritative NASA space equipment documents and mission records"}
    )
    
    docs_dir = Path(settings.DOCUMENTS_DIR)
    doc_files = list(docs_dir.glob("*.md"))
    print(f"Found {len(doc_files)} markdown documents in {docs_dir}")
    
    total_chunks = 0
    ids = []
    documents = []
    metadatas = []
    
    doc_mapping = {
        "apollo_11_descent.md": {"equipment_id": "apollo_11_lm", "title": "Apollo 11 Mission Report & ALER", "celestial_body": "moon"},
        "viking_1_lander.md": {"equipment_id": "viking_1", "title": "Viking 1 Lander Mission History", "celestial_body": "mars"},
        "sojourner_pathfinder.md": {"equipment_id": "sojourner", "title": "Mars Pathfinder & Sojourner Science Log", "celestial_body": "mars"},
        "planetary_protection_and_heritage.md": {"equipment_id": "all", "title": "Planetary Protection and Extraterrestrial Heritage", "celestial_body": "both"}
    }
    
    for f in doc_files:
        filename = f.name
        mapping = doc_mapping.get(filename, {"equipment_id": "all", "title": filename, "celestial_body": "space"})
        
        with open(f, "r", encoding="utf-8") as file:
            content = file.read()
            
        chunks = chunk_markdown(content)
        print(f"File '{filename}' generated {len(chunks)} chunks.")
        
        for idx, chunk in enumerate(chunks):
            chunk_id = f"{f.stem}_chunk_{idx}"
            ids.append(chunk_id)
            documents.append(chunk)
            metadatas.append({
                "source_file": filename,
                "equipment_id": mapping["equipment_id"],
                "document_title": mapping["title"],
                "celestial_body": mapping["celestial_body"]
            })
            total_chunks += 1
            
    if ids:
        collection.add(
            ids=ids,
            documents=documents,
            metadatas=metadatas
        )
        print(f"SUCCESS: Indexed {total_chunks} chunks into ChromaDB at {chroma_path}")
    else:
        print("WARNING: No chunks were generated.")

if __name__ == "__main__":
    build_vector_index()
