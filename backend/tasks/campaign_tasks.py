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
# Celery application — broker and result backend both use Redis
# ---------------------------------------------------------------------------
app = Celery(
    "tasks",
    broker=os.getenv("REDIS_URL", "redis://localhost:6379/0"),
    backend=os.getenv("REDIS_URL", "redis://localhost:6379/0"),
)

# Ensure results are JSON-serialisable
app.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    timezone="UTC",
    enable_utc=True,
)

# ---------------------------------------------------------------------------
# Deferred imports to avoid circular issues when Celery discovers tasks
# ---------------------------------------------------------------------------
from services.ai_service import generate_campaign_text       # noqa: E402
from services.image_service import generate_image            # noqa: E402


@app.task(bind=True, name="tasks.generate_campaign")
def generate_campaign(self, user_brief: str, model_override: str = None):
    """
    Full campaign generation pipeline:
      1. Generate text copy (blog, tweets, SEO, image prompts)
      2. Generate both promo images in parallel via ThreadPoolExecutor
      3. Return the complete campaign dict as the task result.
    """
    # ── Step 1: Text generation ──────────────────────────────────────────
    self.update_state(
        state="PROGRESS",
        meta={"step": "Generating campaign copy..."},
    )
    campaign_data = generate_campaign_text(user_brief, model_override=model_override)

    # ── Step 2: Parallel image generation ───────────────────────────────
    self.update_state(
        state="PROGRESS",
        meta={"step": "Generating promotional images..."},
    )
    with ThreadPoolExecutor(max_workers=2) as executor:
        f1 = executor.submit(generate_image, campaign_data["image_prompt_1"])
        f2 = executor.submit(generate_image, campaign_data["image_prompt_2"])
        campaign_data["image_url_1"] = f1.result()
        campaign_data["image_url_2"] = f2.result()

    # ── Step 3: Finalise ─────────────────────────────────────────────────
    self.update_state(
        state="PROGRESS",
        meta={"step": "Finalizing..."},
    )

    return campaign_data
