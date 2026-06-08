"""
Celery task definitions for campaign generation.
Orchestrates text generation + parallel image generation.
"""
import os
from concurrent.futures import ThreadPoolExecutor
from celery import Celery
from dotenv import load_dotenv

load_dotenv()

# ---------------------------------------------------------------------------
# Deferred imports
# ---------------------------------------------------------------------------
from services.ai_service import generate_campaign_text
from services.image_service import generate_image

# Simple in-memory store for task states since Celery is hanging on Windows
task_status_store = {}

def update_task_state(task_id: str, state: str, meta: dict = None, result=None):
    task_status_store[task_id] = {
        "state": state,
        "info": meta or {},
        "result": result
    }

def generate_campaign(task_id: str, user_brief: str, model_override: str = None):
    """
    Full campaign generation pipeline executed via FastAPI BackgroundTasks:
      1. Generate text copy (blog, tweets, SEO, image prompts)
      2. Generate both promo images
      3. Return the complete campaign dict.
    """
    # ── Step 1: Text generation ──────────────────────────────────────────
    try:
        update_task_state(task_id, state="PROGRESS", meta={"step": "Generating campaign copy..."})
        campaign_data = generate_campaign_text(user_brief, model_override=model_override)

        # ── Step 2: Parallel image generation ───────────────────────────────
        update_task_state(task_id, state="PROGRESS", meta={"step": f"Generating promotional images..."})
        
        image_prompts = campaign_data.get("image_prompts", [])
        
        # Generate images in parallel using the ThreadPoolExecutor
        with ThreadPoolExecutor(max_workers=3) as executor:
            image_urls = list(executor.map(generate_image, image_prompts))
        
        campaign_data["image_urls"] = image_urls

        # ── Step 3: Finalise ─────────────────────────────────────────────────
        update_task_state(task_id, state="PROGRESS", meta={"step": "Finalizing..."})
        update_task_state(task_id, state="SUCCESS", result=campaign_data)
        return campaign_data

    except Exception as e:
        print(f"[tasks] Critical error in campaign generation: {e}")
        update_task_state(task_id, state="FAILURE", meta=str(e))
        return None
