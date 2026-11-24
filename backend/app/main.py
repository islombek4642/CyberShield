from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import Base, engine
from app.api.v1.auth import router as auth_router
from app.api.v1.models import router as models_router

# Ensure tables exist
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="CyberShield: Network Intrusion Detection & Security Operations Platform API"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(models_router, prefix=settings.API_V1_STR)

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "CyberShield Backend", "version": settings.VERSION}
