# SPACE LEGACY: The Forgotten Explorers
### NASA Space Apps Challenge 2026

> **Challenge:** *Abandoned but not Forgotten: Storytelling about NASA's Discarded Equipment on the Moon and Mars*  
> **Team Name:** Musicstarsz (Mohamed, Farida, Mariam, Heba)  
> **Local Web App:** `http://localhost:5173` | **API Swagger Docs:** `http://localhost:8000/api/v1/docs`

---

## Project Overview

**SPACE LEGACY** is an interactive virtual museum for school-age students and lifelong learners. It combines 3D exhibit inspection, mission timelines, archive-based explanations, quizzes, and a bilingual AI Space Historian.

- **3D Hardware Inspection:** Rotate, zoom, and inspect models with component hotspots.
- **Mission Context:** Learn why equipment remained on the Moon or Mars.
- **Mission Chronologies:** Explore milestones for covered exhibits.
- **AI Space Historian:** Retrieves archive passages, attaches source metadata, and declines to guess when relevance is insufficient.
- **Quizzes:** Test understanding of the currently covered missions.

## Team Musicstarsz

| Member | Primary Role | Key Deliverables |
| :--- | :--- | :--- |
| **Mohamed** | Team Lead & AI/ML Engineer | FastAPI backend, RAG pipeline, ChromaDB ingestion, Gemini integration. |
| **Farida** | Frontend Developer | React + Vite interface and exhibit views. |
| **Mariam** | 3D Experience Developer | GLB assets, model-viewer integration, interactive hotspots. |
| **Heba** | Research & Data Engineer | NASA source curation, seed data, quiz verification. |

## Technology Stack

- **Frontend:** React 18, Vite, Tailwind CSS, Lucide React, Google `<model-viewer>`
- **Backend:** Python 3.12+, FastAPI, Pydantic v2, SQLAlchemy, Uvicorn
- **AI & RAG:** ChromaDB, Sentence Transformers multilingual embeddings, Google GenAI SDK (Gemini 2.5 Flash)
- **Database:** SQLite

## Quick Start

### Windows launcher
Run `run_project.bat`. It checks Python and npm, installs backend requirements, initializes the database only when it is missing, checks/rebuilds the vector index when its version or embedding model changes, installs frontend dependencies with `npm ci` when needed, and starts both servers.

The launcher uses the Python and Node.js versions available on PATH. It does not create a virtual environment. Installing packages globally may affect other Python projects; use a dedicated environment if you prefer isolation.

### Environment variables
Copy `.env.example` to `.env` in the repository root and add your Gemini API key if you want generated explanations. Without a key, the API can return retrieved archive excerpts rather than generated answers.

### Manual setup

Backend:
```bash
cd backend
python -m pip install -r requirements.txt
python scripts/seed_database.py
python scripts/build_vector_index.py
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

Frontend:
```bash
cd frontend
npm ci
npm run dev
```

Run the RAG unit tests:
```bash
cd backend
python -m pytest -q
```

API docs: `http://localhost:8000/api/v1/docs`  
Web app: `http://localhost:5173`

**Important:** Changing the embedding model invalidates the previous Chroma vectors. The index builder detects the model/version change and rebuilds the local index. This may download the multilingual model on first run.

## Current Content Coverage

- **3D models:** Apollo 11 Lunar Module, Viking 1 Lander, and Sojourner have dedicated model assets. Surveyor 3 and Opportunity use archival images rather than mismatched 3D models.
- **Timelines, quizzes, and exhibit-specific source lists:** currently populated for Apollo 11, Viking 1, and Sojourner. Surveyor 3 and Opportunity still need dedicated reviewed content.
- **AI archive:** retrieval filters by exhibit, uses a distance threshold for vector matches, and uses actual query/document token overlap for the Markdown fallback. Unknown source files do not receive a generic NASA homepage citation.
- **Grounding status:** the API applies a conservative lexical evidence-overlap check to generated text. This is a heuristic, not a semantic entailment proof or substitute for scientific review. When the check fails, the API returns the retrieved excerpt and marks the generated response as not grounded.

## Scientific content notes

- Apollo 11 deployed EASEP, a precursor/simplified package, not the full ALSEP configuration used on later Apollo missions.
- Viking 1's November 1982 dates are described as separate mission-status milestones rather than treated as one universally defined end date.
- September 27, 1997 is described as the last Pathfinder data transmission, distinct from later mission closure.
- Sojourner mass is omitted because published figures vary by source and mass definition.

## CI

GitHub Actions runs backend pytest tests and a frontend production build on pushes and pull requests.

## NASA references

- [Apollo 11 Mission Report (NASA SP-238)](https://history.nasa.gov/alsj/a11/A11_MissionReport.pdf)
- [Apollo 11 Press Kit](https://www.nasa.gov/wp-content/uploads/static/history/alsj/a11/A11_PressKit.pdf)
- [NASA Viking 1 mission overview](https://science.nasa.gov/mission/viking-1/)
- [NASA NTRS — The Viking Mission to Mars (NASA SP-334)](https://ntrs.nasa.gov/citations/19770008581)
- [NASA Mars Pathfinder mission overview](https://science.nasa.gov/mission/mars-pathfinder/)
- [NASA/JPL Mars Pathfinder photojournal](https://photojournal.jpl.nasa.gov/mission/Mars%20Pathfinder)
- [NASA 3D Resources](https://github.com/nasa/NASA-3D-Resources)

