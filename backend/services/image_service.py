"""
Image Generation Service — powered by OpenRouter REST API.
Uses black-forest-labs/flux-schnell via direct HTTP (not OpenAI SDK).
"""
import os
import requests
from dotenv import load_dotenv

load_dotenv()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_BASE_URL = os.getenv("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1")
IMAGE_MODEL = os.getenv("IMAGE_MODEL", "black-forest-labs/flux-schnell")
YOUR_SITE_URL = os.getenv("YOUR_SITE_URL", "http://localhost:5173")
YOUR_SITE_NAME = os.getenv("YOUR_SITE_NAME", "ContentEngine")

PLACEHOLDER_URL = "https://placehold.co/1024x1024?text=Image+Unavailable"


def generate_image(prompt: str) -> str:
    """
    Generate an image via OpenRouter's images/generations endpoint.
    Falls back to a placeholder URL if generation fails.

    Args:
        prompt: Detailed text description for the image.

    Returns:
        Image URL string (real or placeholder).
    """
    try:
        headers = {
            "Authorization": f"Bearer {OPENROUTER_API_KEY}",
            "HTTP-Referer": YOUR_SITE_URL,
            "X-Title": YOUR_SITE_NAME,
            "Content-Type": "application/json",
        }
        payload = {
            "model": IMAGE_MODEL,
            "prompt": prompt,
            "n": 1,
            "size": "1024x1024",
        }

        response = requests.post(
            f"{OPENROUTER_BASE_URL}/images/generations",
            headers=headers,
            json=payload,
            timeout=120,
        )
        response.raise_for_status()

        data = response.json()
        image_url = data["data"][0]["url"]
        return image_url

    except Exception as exc:
        print(f"[image_service] Image generation failed: {exc}")
        return PLACEHOLDER_URL
