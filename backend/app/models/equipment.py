from sqlalchemy import Column, String, Integer, Float, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

class Mission(Base):
    __tablename__ = "missions"

    mission_id = Column(String(50), primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    program = Column(String(100), nullable=False)
    target_body = Column(String(50), nullable=False)  # 'moon' or 'mars'
    launch_date = Column(String(50))
    landing_date = Column(String(50))
    end_date = Column(String(50))
    objective_summary = Column(Text)

    equipment_items = relationship("Equipment", back_populates="mission")

class Equipment(Base):
    __tablename__ = "equipment"

    equipment_id = Column(String(50), primary_key=True, index=True)
    mission_id = Column(String(50), ForeignKey("missions.mission_id"), nullable=False)
    official_name = Column(String(150), nullable=False)
    common_name = Column(String(100), nullable=False)
    celestial_body = Column(String(50), nullable=False)  # 'moon' or 'mars'
    landing_site_name = Column(String(150))
    latitude = Column(Float)
    longitude = Column(Float)
    status_category = Column(String(50))  # 'historic_monument', 'completed', 'active'
    operational_status = Column(String(100))
    launch_date = Column(String(50))
    landing_date = Column(String(50))
    mission_end_date = Column(String(50))
    mass_kg = Column(String(100))
    dimensions = Column(String(150))
    why_left_behind = Column(Text)
    scientific_legacy = Column(Text)
    model_glb_url = Column(String(255))
    fallback_image_urls = Column(JSON)
    hotspots = Column(JSON)

    mission = relationship("Mission", back_populates="equipment_items")
    timeline_events = relationship("TimelineEvent", back_populates="equipment", cascade="all, delete-orphan")
    sources = relationship("Source", back_populates="equipment", cascade="all, delete-orphan")
    quiz_questions = relationship("QuizQuestion", back_populates="equipment", cascade="all, delete-orphan")

class TimelineEvent(Base):
    __tablename__ = "timeline_events"

    id = Column(Integer, primary_key=True, autoincrement=True)
    equipment_id = Column(String(50), ForeignKey("equipment.equipment_id"), nullable=False)
    event_date = Column(String(50), nullable=False)
    title = Column(String(150), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(50))

    equipment = relationship("Equipment", back_populates="timeline_events")

class Source(Base):
    __tablename__ = "sources"

    source_id = Column(Integer, primary_key=True, autoincrement=True)
    equipment_id = Column(String(50), ForeignKey("equipment.equipment_id"), nullable=False)
    title = Column(String(200), nullable=False)
    author_or_org = Column(String(150))
    publication_year = Column(String(20))
    url = Column(String(255), nullable=False)
    source_type = Column(String(50))

    equipment = relationship("Equipment", back_populates="sources")

class QuizQuestion(Base):
    __tablename__ = "quiz_questions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    equipment_id = Column(String(50), ForeignKey("equipment.equipment_id"), nullable=False)
    question_text = Column(Text, nullable=False)
    options = Column(JSON, nullable=False)  # {"a": "...", "b": "...", "c": "...", "d": "..."}
    correct_option = Column(String(10), nullable=False)
    explanation = Column(Text, nullable=False)

    equipment = relationship("Equipment", back_populates="quiz_questions")
