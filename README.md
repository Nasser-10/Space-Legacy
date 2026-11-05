# SPACE LEGACY: The Forgotten Explorers
### NASA Space Apps Challenge 2026

> **Challenge:** *Abandoned but not Forgotten: Storytelling about NASA's Discarded Equipment on the Moon and Mars*  
> **Team Name:** Musicstarsz (Mohamed, Farida, Mariam, Heba)  
> **Live Web App:** `http://localhost:5173` | **API Swagger Docs:** `http://localhost:8000/api/v1/docs`

---

## 🚀 Project Overview

Every probe, descent stage, rover, and scientific sensor resting on the Moon and Mars represents a triumph of human curiosity, engineering audacity, and scientific ambition. When these machines conclude their primary missions, they do not become "space junk"—they become in-situ historical monuments and humanity's first extraterrestrial archaeological sites.

**SPACE LEGACY** is an interactive, web-based virtual museum designed to bring these forgotten robotic heroes to life for school-age students and lifelong learners:
1. **Interactive 3D Hardware Inspection:** Rotate, zoom, and explore authentic NASA 3D models with clickable component hotspots.
2. **Why Was It Left Behind?:** Clear, scientific breakdowns explaining how the rocket equation and mass constraints necessitate leaving hardware in-situ.
3. **Mission Chronologies:** Interactive milestone timelines tracing the journey from launch pad to extraterrestrial monument.
4. **AI Space Historian:** A multi-tier conversational tutor (Kid, Explorer, Scientist) that retrieves excerpts from the project's NASA source archive and displays the associated source links. If no relevant excerpt is found, it reports that limitation instead of inventing an answer.
5. **Interactive Quizzes & Badging:** Gamified knowledge checks testing student understanding with automated grading and digital achievement badges.

---

## 👥 Team Musicstarsz & Roles

| Member | Primary Role | Key Deliverables |
| :--- | :--- | :--- |
| **Mohamed** | Team Lead & AI/ML Engineer | FastAPI backend architecture, RAG vector pipeline, ChromaDB ingestion, and Gemini 1.5 integration. |
| **Farida** | Frontend Developer | React 18 + Vite SPA, Tailwind CSS deep-space UI, Moon & Mars explorer portals, and detail views. |
| **Mariam** | 3D Experience Developer | NASA GLB 3D model sourcing, compression, Google `<model-viewer>` integration, and interactive hotspots. |
| **Heba** | Research & Data Engineer | Official NASA technical report curation, relational dataset authoring (`seed_data.json`), and quiz verification. |

---

## 🛠️ Technology Stack

- **Frontend:** React 18, Vite, Tailwind CSS, Lucide React, Google `<model-viewer>`
- **Backend:** Python 3.12, FastAPI, Pydantic v2, SQLAlchemy 2.0, Uvicorn
- **AI & RAG Engine:** ChromaDB (local persistent vector store), HuggingFace `all-MiniLM-L6-v2` embeddings, Google GenAI SDK (Gemini 1.5 Flash)
- **Database:** SQLite (`space_legacy.db`) + static JSON seed fixtures for 100% offline fallback resilience

---

## ⚡ Quick Start & Execution

### Option 1: One-Click Windows Launcher
Double-click `run_project.bat` in the root directory. It checks that Python and npm are available, initializes the SQLite database when it is missing, checks the vector index, installs frontend packages when needed, and starts both servers. The launcher uses the Python and Node.js versions available on your PATH.

### Option 2: Manual Terminal Execution

#### 1. Backend Setup:
```bash
cd backend
pip install -r requirements.txt
python scripts/seed_database.py
python scripts/build_vector_index.py
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
Swagger UI will be live at: `http://localhost:8000/api/v1/docs`

#### 2. Frontend Setup:
```bash
cd frontend
npm install
npm run dev
```
Web application will be live at: `http://localhost:5173`

#### 3. Run Automated Backend Tests:
```bash
cd backend
python scripts/test_api_local.py
```

---

## 📌 Current Content Coverage

- **3D models:** Apollo 11 Lunar Module, Viking 1 Lander, and Sojourner have dedicated model assets. Surveyor 3 and Opportunity currently use archival images rather than a mismatched 3D model.
- **Timelines, quizzes, and exhibit-specific source lists:** currently populated for Apollo 11, Viking 1, and Sojourner. Surveyor 3 and Opportunity still need dedicated, reviewed content before those sections can be described as complete.
- **AI archive:** citations are attached to the source document used for retrieval. A response without a relevant retrieved document is marked as not grounded.

## 📚 Official NASA Data Sources & Attribution

All spacecraft coordinates, specifications, and historical records are strictly sourced from official NASA public domain repositories:
- [Apollo 11 Mission Report (NASA SP-238)](https://history.nasa.gov/alsj/a11/A11_MissionReport.pdf)
- [Viking 1 Lander NSSDCA Master Catalog Record](https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1975-075C)
- [Mars Pathfinder Microrover Operations (JPL Publication D-15555)](https://mars.nasa.gov/resources/pathfinder-status)
- [NASA 3D Resources Repository](https://github.com/nasa/NASA-3D-Resources)
- [NASA Image and Video Library](https://images.nasa.gov)

*Images, 3D models, and telemetry courtesy of NASA / JPL-Caltech / National Space Science Data Center.*
