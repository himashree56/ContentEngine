"""
Image Service — Streamlined version (Classifier removed).
Provides raw prompts for the frontend Puter.js integration.
"""
import os
import uuid
import threading
from dotenv import load_dotenv

load_dotenv()

# Configuration
IMAGE_DIR = os.path.join(os.path.dirname(__file__), "..", "static", "images")
os.makedirs(IMAGE_DIR, exist_ok=True)

# Sequential generation lock (still useful to prevent backend overload)
generation_lock = threading.Lock()

def generate_image(prompt: str) -> str:
    """
    Returns a local URL placeholder. 
    The frontend (Puter.js) will handle the actual generation.
    """
    # In this streamlined version, we simply provide the local path structure
    # the frontend will use Puter.js to generate the actual visual content.
    filename = f"{uuid.uuid4()}.jpg"
    return f"http://localhost:8000/static/images/{filename}"
