import sys
from pathlib import Path

# Add backend directory to path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from fastapi.testclient import TestClient
from app.main import app

def run_tests():
    print("Testing SPACE LEGACY Backend Endpoints...")
    client = TestClient(app)

    # 1. Root & Health
    r = client.get("/")
    assert r.status_code == 200, f"Root failed: {r.text}"
    print("[OK] Root endpoint OK:", r.json()["project"])

    r = client.get("/health")
    assert r.status_code == 200
    print("[OK] Health endpoint OK:", r.json()["status"])

    # 2. List Equipment
    r = client.get("/api/v1/equipment")
    assert r.status_code == 200
    items = r.json()
    assert len(items) >= 3, f"Expected at least 3 items, got {len(items)}"
    print(f"[OK] List equipment OK: Retrieved {len(items)} items")

    # 3. Filter Equipment by Planet
    r_moon = client.get("/api/v1/equipment?planet=moon")
    assert r_moon.status_code == 200
    print(f"[OK] Filter Moon OK: {len(r_moon.json())} lunar items")

    r_mars = client.get("/api/v1/equipment?planet=mars")
    assert r_mars.status_code == 200
    print(f"[OK] Filter Mars OK: {len(r_mars.json())} martian items")

    # 4. Equipment Details (Sojourner)
    r = client.get("/api/v1/equipment/sojourner")
    assert r.status_code == 200
    data = r.json()
    assert data["common_name"] == "Sojourner Rover"
    assert len(data["hotspots"]) >= 1
    print(f"[OK] Equipment details (Sojourner) OK: {len(data['hotspots'])} hotspots")

    # 5. Timeline
    r = client.get("/api/v1/equipment/apollo_11_lm/timeline")
    assert r.status_code == 200
    events = r.json()
    assert len(events) >= 3
    print(f"[OK] Timeline (Apollo 11) OK: {len(events)} events")

    # 6. Quiz Questions
    r = client.get("/api/v1/quiz/viking_1")
    assert r.status_code == 200
    quiz_q = r.json()
    assert len(quiz_q) == 4
    print(f"[OK] Quiz retrieval (Viking 1) OK: {len(quiz_q)} questions")

    # 7. Submit Quiz
    sub = {
        "equipment_id": "viking_1",
        "answers": {
            str(quiz_q[0]["question_id"]): "b",
            str(quiz_q[1]["question_id"]): "c",
            str(quiz_q[2]["question_id"]): "b",
            str(quiz_q[3]["question_id"]): "b"
        }
    }
    r = client.post("/api/v1/quiz/submit", json=sub)
    assert r.status_code == 200
    res = r.json()
    print(f"[OK] Quiz submission OK: Score {res['score']}/{res['total_questions']} - Badge: {res['badge']}")

    # 8. AI Space Historian RAG
    ai_req = {
        "equipment_id": "apollo_11_lm",
        "question": "Why was the Apollo 11 descent stage left on the Moon?",
        "level": "kid"
    }
    r = client.post("/api/v1/ai/ask", json=ai_req)
    assert r.status_code == 200
    ai_res = r.json()
    assert ai_res["grounded"] is True
    assert len(ai_res["answer"]) > 20
    print("[OK] AI Historian (Kid Mode) OK:")
    print("   Answer:", ai_res["answer"][:120] + "...")
    print("   Sources:", [s["title"] for s in ai_res["sources"]])

    # 9. AI Out-of-Scope Guardrail
    ai_out = {
        "equipment_id": "all",
        "question": "Who won the football world cup in 1998?",
        "level": "explorer"
    }
    r = client.post("/api/v1/ai/ask", json=ai_out)
    assert r.status_code == 200
    out_res = r.json()
    assert out_res["grounded"] is False
    print("[OK] AI Out-of-Scope Guardrail OK (Correctly detected non-space question)")

    print("\n=== ALL BACKEND TESTS PASSED WITH 100% SUCCESS! ===")

if __name__ == "__main__":
    run_tests()
