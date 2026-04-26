"""
FastAPI application — REST endpoints for campaign generation.
"""
import os
from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from celery.result import AsyncResult

from models.schemas import CampaignRequest, GenerateResponse, HealthResponse
from tasks.campaign_tasks import app as celery_app, generate_campaign

# ---------------------------------------------------------------------------
# FastAPI app
# ---------------------------------------------------------------------------
app = FastAPI(
    title="Content Marketing Engine",
    description="AI-powered campaign generator using OpenRouter + Celery",
    version="1.0.0",
)

# ---------------------------------------------------------------------------
# CORS — allow the Vite dev server
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@app.get("/health", response_model=HealthResponse, tags=["System"])
def health_check():
    """Liveness probe — used by the frontend to confirm the backend is live."""
    return {"status": "ok"}


@app.post("/generate", response_model=GenerateResponse, tags=["Campaign"])
def start_campaign_generation(request: CampaignRequest):
    """
    Enqueue a campaign generation task.
    Returns a task_id immediately for the client to poll.
    """
    task = generate_campaign.delay(
        request.user_brief,
        request.text_model,  # None if not provided — falls back to .env
    )
    return {"task_id": task.id, "status": "queued"}


@app.get("/status/{task_id}", tags=["Campaign"])
def get_task_status(task_id: str):
    """
    Poll campaign task status.
    States: pending → processing → complete | failed
    """
    result = AsyncResult(task_id, app=celery_app)
    state = result.state

    if state == "PENDING":
        return {"status": "pending"}

    elif state == "PROGRESS":
        info = result.info or {}
        return {
            "status": "processing",
            "step": info.get("step", "Working..."),
        }

    elif state == "SUCCESS":
        return {
            "status": "complete",
            "data": result.result,
        }

    elif state == "FAILURE":
        return {
            "status": "failed",
            "error": str(result.info),
        }

    else:
        # Catch-all for RETRY, REVOKED, etc.
        return {"status": state.lower()}
