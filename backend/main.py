"""
FastAPI application — REST endpoints for campaign generation.
"""
import os
from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI, HTTPException, Query, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from fastapi.staticfiles import StaticFiles
import requests as http_requests
import uuid
import asyncio

from models.schemas import CampaignRequest, GenerateResponse, HealthResponse
from tasks.campaign_tasks import generate_campaign, task_status_store
from services.publish_service import publish_to_social

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
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost",
        "http://127.0.0.1",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Static Files — Serve generated images
# ---------------------------------------------------------------------------
IMAGE_DIR = os.path.join(os.path.dirname(__file__), "static", "images")
os.makedirs(IMAGE_DIR, exist_ok=True)

app.mount("/static/images", StaticFiles(directory=IMAGE_DIR), name="static_images")


@app.get("/", tags=["System"])
def root():
    return {
        "message": "ContentEngine API is running!",
        "frontend_url": "http://localhost:5173",
        "docs_url": "http://localhost:8000/docs"
    }

# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

# Global semaphore to limit concurrent image generations (prevents rate-limiting)
image_semaphore = asyncio.Semaphore(2)

@app.get("/proxy-image", tags=["Utility"])
async def proxy_image(prompt: str = Query(..., description="The visual prompt"), seed: int = Query(None)):
    """
    Asynchronous server-side image proxy with concurrency limiting and retries.
    """
    import urllib.parse
    import httpx
    import asyncio

    image_seed = seed or 42
    
    async with image_semaphore:
        # Simple retry logic
        max_retries = 3
        async with httpx.AsyncClient(timeout=60.0) as client:
            for attempt in range(max_retries + 1):
                try:
                    # Use a simplified prompt and a faster 'turbo' model
                    simplified_prompt = urllib.parse.quote(prompt[:200])
                    target_url = f"https://image.pollinations.ai/prompt/{simplified_prompt}?width=1024&height=1024&seed={image_seed}&model=turbo&nologo=true"
                    
                    resp = await client.get(target_url, follow_redirects=True)
                    resp.raise_for_status()
                    
                    content_type = resp.headers.get("content-type", "image/jpeg")
                    return StreamingResponse(
                        (chunk for chunk in resp.iter_bytes(chunk_size=8192)), 
                        media_type=content_type,
                        headers={"Cache-Control": "public, max-age=3600"}
                    )
                except Exception as exc:
                    if attempt < max_retries:
                        await asyncio.sleep(3 * (attempt + 1)) # Exponential backoff
                        continue
                    
                    print(f"[proxy_image] Failed after {max_retries} retries: {exc}")
                    raise HTTPException(status_code=502, detail="AI Image generation failed")


@app.get("/health", response_model=HealthResponse, tags=["System"])
def health_check():
    """Liveness probe — used by the frontend to confirm the backend is live."""
    return {"status": "ok"}


@app.post("/generate", response_model=GenerateResponse, tags=["Campaign"])
def start_campaign_generation(request: CampaignRequest, background_tasks: BackgroundTasks):
    """
    Enqueue a campaign generation task.
    Returns a task_id immediately for the client to poll.
    """
    task_id = str(uuid.uuid4())
    task_status_store[task_id] = {"state": "PENDING", "info": {}, "result": None}
    
    background_tasks.add_task(
        generate_campaign,
        task_id,
        request.user_brief,
        request.text_model,
    )
    return {"task_id": task_id, "status": "queued"}


@app.get("/status/{task_id}", tags=["Campaign"])
def get_task_status(task_id: str):
    """
    Poll campaign task status.
    States: pending → processing → complete | failed
    """
    task_data = task_status_store.get(task_id)
    if not task_data:
        return {"status": "pending"}

    state = task_data.get("state")
    info = task_data.get("info", {})
    result = task_data.get("result")

    if state == "PENDING":
        return {"status": "pending"}
    elif state == "PROGRESS":
        return {
            "status": "processing",
            "step": info.get("step", "Working..."),
        }
    elif state == "SUCCESS":
        return {
            "status": "complete",
            "data": result,
        }
    elif state == "FAILURE":
        return {
            "status": "failed",
            "error": str(info),
        }
    else:
        return {"status": str(state).lower()}


@app.post("/publish", tags=["Campaign"])
async def publish_campaign(platform: str = Query(...), content: str = Query(...), background_tasks: BackgroundTasks = BackgroundTasks()):
    """
    Triggers Playwright automation to publish content to social media.
    """
    background_tasks.add_task(publish_to_social, platform, content)
    return {"message": f"Publishing to {platform} started in a new browser window."}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
