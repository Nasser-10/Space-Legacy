from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1.router import api_router
from app.core.database import Base, engine

# Ensure tables are created
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc",
    description="Interactive digital museum API celebrating NASA's historical robotic equipment on the Moon and Mars."
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "project": settings.PROJECT_NAME,
        "challenge": "Abandoned but not Forgotten: Storytelling about NASA's Discarded Equipment on the Moon and Mars",
        "team": "Musicstarsz",
        "docs": f"{settings.API_V1_STR}/docs",
        "status": "operational"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "space-legacy-api"}
