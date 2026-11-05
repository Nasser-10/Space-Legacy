from sqlalchemy.orm import Session
from typing import List, Optional
from app.models.equipment import Equipment, Mission, TimelineEvent, Source
from app.schemas.equipment import EquipmentSummarySchema, EquipmentDetailSchema, TimelineEventSchema, SourceSchema, HotspotSchema

class EquipmentService:
    @staticmethod
    def get_equipment_list(db: Session, planet: Optional[str] = None, status: Optional[str] = None) -> List[EquipmentSummarySchema]:
        query = db.query(Equipment)
        if planet:
            query = query.filter(Equipment.celestial_body == planet.lower())
        if status:
            query = query.filter(Equipment.status_category == status.lower())
            
        items = query.all()
        result = []
        for eq in items:
            thumb = eq.fallback_image_urls[0] if eq.fallback_image_urls and len(eq.fallback_image_urls) > 0 else None
            result.append(EquipmentSummarySchema(
                equipment_id=eq.equipment_id,
                mission_id=eq.mission_id,
                official_name=eq.official_name,
                common_name=eq.common_name,
                celestial_body=eq.celestial_body,
                landing_site_name=eq.landing_site_name,
                status_category=eq.status_category,
                operational_status=eq.operational_status,
                landing_date=eq.landing_date,
                thumbnail_url=thumb,
                has_3d_model=bool(eq.model_glb_url)
            ))
        return result

    @staticmethod
    def get_equipment_detail(db: Session, equipment_id: str) -> Optional[EquipmentDetailSchema]:
        eq = db.query(Equipment).filter(Equipment.equipment_id == equipment_id).first()
        if not eq:
            return None
            
        mission = db.query(Mission).filter(Mission.mission_id == eq.mission_id).first()
        sources = db.query(Source).filter(Source.equipment_id == equipment_id).all()
        
        hotspots_parsed = []
        if eq.hotspots and isinstance(eq.hotspots, list):
            for h in eq.hotspots:
                hotspots_parsed.append(HotspotSchema(
                    slot=h.get("slot", ""),
                    position=h.get("position", ""),
                    normal=h.get("normal", ""),
                    title=h.get("title", ""),
                    description=h.get("description", "")
                ))

        sources_parsed = []
        for s in sources:
            sources_parsed.append(SourceSchema(
                title=s.title,
                author_or_org=s.author_or_org,
                publication_year=s.publication_year,
                url=s.url,
                source_type=s.source_type
            ))

        return EquipmentDetailSchema(
            equipment_id=eq.equipment_id,
            mission_id=eq.mission_id,
            mission_name=mission.name if mission else None,
            program=mission.program if mission else None,
            official_name=eq.official_name,
            common_name=eq.common_name,
            celestial_body=eq.celestial_body,
            landing_site_name=eq.landing_site_name,
            latitude=eq.latitude,
            longitude=eq.longitude,
            status_category=eq.status_category,
            operational_status=eq.operational_status,
            launch_date=eq.launch_date,
            landing_date=eq.landing_date,
            mission_end_date=eq.mission_end_date,
            mass_kg=eq.mass_kg,
            dimensions=eq.dimensions,
            why_left_behind=eq.why_left_behind,
            scientific_legacy=eq.scientific_legacy,
            model_glb_url=eq.model_glb_url,
            fallback_image_urls=eq.fallback_image_urls or [],
            hotspots=hotspots_parsed,
            sources=sources_parsed
        )

    @staticmethod
    def get_timeline(db: Session, equipment_id: str) -> List[TimelineEventSchema]:
        events = db.query(TimelineEvent).filter(TimelineEvent.equipment_id == equipment_id).all()
        return [
            TimelineEventSchema(
                date=e.event_date,
                title=e.title,
                description=e.description,
                category=e.category
            ) for e in events
        ]

    @staticmethod
    def get_sources(db: Session, equipment_id: str) -> List[SourceSchema]:
        sources = db.query(Source).filter(Source.equipment_id == equipment_id).all()
        return [
            SourceSchema(
                title=s.title,
                author_or_org=s.author_or_org,
                publication_year=s.publication_year,
                url=s.url,
                source_type=s.source_type
            ) for s in sources
        ]
