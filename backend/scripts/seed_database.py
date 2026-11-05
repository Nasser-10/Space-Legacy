import json
import os
import sys
from pathlib import Path

# Add backend to sys.path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from app.core.config import settings
from app.core.database import SessionLocal, engine, Base
from app.models.equipment import Mission, Equipment, TimelineEvent, Source, QuizQuestion

def seed_database():
    print(f"Connecting to database at: {settings.DATABASE_URL}")
    Base.metadata.create_all(bind=engine)
    
    seed_file = Path(settings.SEED_DATA_PATH)
    if not seed_file.exists():
        print(f"ERROR: Seed file not found at {seed_file}")
        sys.exit(1)
        
    with open(seed_file, "r", encoding="utf-8") as f:
        data = json.load(f)

    db = SessionLocal()
    try:
        # Clear existing records
        db.query(QuizQuestion).delete()
        db.query(Source).delete()
        db.query(TimelineEvent).delete()
        db.query(Equipment).delete()
        db.query(Mission).delete()
        db.commit()
        print("Cleared existing database records.")

        # Seed Missions
        for m in data.get("missions", []):
            mission = Mission(
                mission_id=m["mission_id"],
                name=m["name"],
                program=m["program"],
                target_body=m["target_body"],
                launch_date=m.get("launch_date"),
                landing_date=m.get("landing_date"),
                end_date=m.get("end_date"),
                objective_summary=m.get("objective_summary")
            )
            db.add(mission)
        db.commit()
        print(f"Seeded {len(data.get('missions', []))} missions.")

        # Seed Equipment
        for eq in data.get("equipment", []):
            equipment = Equipment(
                equipment_id=eq["equipment_id"],
                mission_id=eq["mission_id"],
                official_name=eq["official_name"],
                common_name=eq["common_name"],
                celestial_body=eq["celestial_body"],
                landing_site_name=eq.get("landing_site_name"),
                latitude=eq.get("latitude"),
                longitude=eq.get("longitude"),
                status_category=eq.get("status_category"),
                operational_status=eq.get("operational_status"),
                launch_date=eq.get("launch_date"),
                landing_date=eq.get("landing_date"),
                mission_end_date=eq.get("mission_end_date"),
                mass_kg=eq.get("mass_kg"),
                dimensions=eq.get("dimensions"),
                why_left_behind=eq.get("why_left_behind"),
                scientific_legacy=eq.get("scientific_legacy"),
                model_glb_url=eq.get("model_glb_url"),
                fallback_image_urls=eq.get("fallback_image_urls", []),
                hotspots=eq.get("hotspots", [])
            )
            db.add(equipment)
        db.commit()
        print(f"Seeded {len(data.get('equipment', []))} equipment items.")

        # Seed Timelines
        total_events = 0
        for t in data.get("timelines", []):
            eq_id = t["equipment_id"]
            for ev in t.get("events", []):
                event = TimelineEvent(
                    equipment_id=eq_id,
                    event_date=ev["date"],
                    title=ev["title"],
                    description=ev["description"],
                    category=ev.get("category")
                )
                db.add(event)
                total_events += 1
        db.commit()
        print(f"Seeded {total_events} timeline events.")

        # Seed Quizzes
        total_questions = 0
        for qz in data.get("quizzes", []):
            eq_id = qz["equipment_id"]
            for q in qz.get("questions", []):
                question = QuizQuestion(
                    id=q["question_id"],
                    equipment_id=eq_id,
                    question_text=q["question_text"],
                    options=q["options"],
                    correct_option=q["correct_option"],
                    explanation=q["explanation"]
                )
                db.add(question)
                total_questions += 1
        db.commit()
        print(f"Seeded {total_questions} quiz questions.")

        # Seed Sources
        total_sources = 0
        for src in data.get("sources", []):
            source = Source(
                source_id=src["source_id"],
                equipment_id=src["equipment_id"],
                title=src["title"],
                author_or_org=src.get("author_or_org"),
                publication_year=src.get("publication_year"),
                url=src["url"],
                source_type=src.get("source_type")
            )
            db.add(source)
            total_sources += 1
        db.commit()
        print(f"Seeded {total_sources} verified sources.")

        print("DATABASE SEEDING COMPLETED SUCCESSFULLY!")
    except Exception as e:
        db.rollback()
        print(f"Error during seeding: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
