"""
AI Text Generation Service — powered by OpenRouter (OpenAI-compatible API).
Generates full campaign copy as structured JSON.
"""
from openai import OpenAI
import os
import json
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(
    api_key=os.getenv("OPENROUTER_API_KEY"),
    base_url=os.getenv("OPENROUTER_BASE_URL"),
    default_headers={
        "HTTP-Referer": os.getenv("YOUR_SITE_URL"),
        "X-Title": os.getenv("YOUR_SITE_NAME"),
    },
)

SYSTEM_PROMPT = """
You are an expert digital marketing strategist.
Respond ONLY in valid JSON matching this schema exactly:
{
  "campaign_title": "string",
  "target_audience": "string",
  "brand_voice": "string",
  "blog_post": {
    "title": "string",
    "meta_description": "string (max 160 chars)",
    "body": "string (400-600 words, use \\n for paragraph breaks)",
    "cta": "string"
  },
  "tweets": [
    {"variant": 1, "text": "string (max 280 chars)", "hashtags": ["string"]},
    {"variant": 2, "text": "string (max 280 chars)", "hashtags": ["string"]},
    {"variant": 3, "text": "string (max 280 chars)", "hashtags": ["string"]}
  ],
  "seo": {
    "primary_keyword": "string",
    "secondary_keywords": ["string", "string", "string"],
    "meta_title": "string (max 60 chars)"
  },
  "image_prompt_1": "Detailed image generation prompt. Describe subject, style (photorealistic/illustrated), mood, lighting, and composition. Avoid text or logos.",
  "image_prompt_2": "A second image prompt with a different angle, composition, or scene variation."
}
"""


def generate_campaign_text(user_brief: str, model_override: str = None) -> dict:
    """
    Call OpenRouter to generate full campaign copy for the given brief.

    Args:
        user_brief: The user's campaign brief description.
        model_override: Optional model name to override the .env TEXT_MODEL.

    Returns:
        Parsed dict matching the campaign JSON schema.
    """
    model = model_override or os.getenv("TEXT_MODEL", "openai/gpt-4o")

    response = client.chat.completions.create(
        model=model,
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": f"Campaign brief: {user_brief}"},
        ],
    )

    raw_content = response.choices[0].message.content
    return json.loads(raw_content)
