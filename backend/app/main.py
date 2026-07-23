"""
TriageAI - FastAPI Application Entry Point
AI-Powered Emergency Room Smart Triage System
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import create_tables
from app.routers import patients, triage, analytics


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events."""
    # Startup: create database tables
    await create_tables()
    print("✅ Database tables created")
    print("🏥 TriageAI Backend is ready!")
    yield
    # Shutdown
    print("👋 TriageAI Backend shutting down")


app = FastAPI(
    title="TriageAI API",
    description="AI-Powered Emergency Room Smart Triage System. Uses Google Gemini AI to provide intelligent, explainable triage assessments based on the ESI 5-level system.",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS - Allow all origins for hackathon development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(patients.router)
app.include_router(triage.router)
app.include_router(analytics.router)


@app.get("/", tags=["Health"])
async def root():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "TriageAI API",
        "version": "1.0.0",
        "description": "AI-Powered Emergency Room Smart Triage System",
    }


@app.get("/health", tags=["Health"])
async def health_check():
    """Detailed health check."""
    return {
        "status": "healthy",
        "database": "connected",
        "ai_engine": "ready",
    }
