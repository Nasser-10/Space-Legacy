from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class HotspotSchema(BaseModel):
    slot: str
    position: str
    normal: str
    title: str
    description: str

class TimelineEventSchema(BaseModel):
    date: str
    title: str
    description: str
    category: Optional[str] = None

class SourceSchema(BaseModel):
    title: str
    author_or_org: Optional[str] = None
    publication_year: Optional[str] = None
    url: str
    source_type: Optional[str] = None

class EquipmentSummarySchema(BaseModel):
    equipment_id: str
    mission_id: str
    official_name: str
    common_name: str
    celestial_body: str
    landing_site_name: Optional[str] = None
    status_category: Optional[str] = None
    operational_status: Optional[str] = None
    landing_date: Optional[str] = None
    thumbnail_url: Optional[str] = None
    has_3d_model: bool = True

class EquipmentDetailSchema(BaseModel):
    equipment_id: str
    mission_id: str
    mission_name: Optional[str] = None
    program: Optional[str] = None
    official_name: str
    common_name: str
    celestial_body: str
    landing_site_name: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    status_category: Optional[str] = None
    operational_status: Optional[str] = None
    launch_date: Optional[str] = None
    landing_date: Optional[str] = None
    mission_end_date: Optional[str] = None
    mass_kg: Optional[str] = None
    dimensions: Optional[str] = None
    why_left_behind: Optional[str] = None
    scientific_legacy: Optional[str] = None
    model_glb_url: Optional[str] = None
    fallback_image_urls: List[str] = []
    hotspots: List[HotspotSchema] = []
    sources: List[SourceSchema] = []
