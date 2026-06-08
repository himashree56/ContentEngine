"""
AI Service — Generates campaign content with robust JSON self-healing.
Routes to OpenRouter or local Ollama depending on the model ID format.
Ollama models use bare names with colons (e.g. mistral:latest, qwen2:7b).
OpenRouter models use slash-separated IDs (e.g. google/gemini-2.0-flash-lite:free).
"""
import os
import json
import re
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

# OpenRouter client (cloud models)
openrouter_client = OpenAI(
    base_url=os.getenv("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1"),
    api_key=os.getenv("OPENROUTER_API_KEY"),
)

# Ollama client (local models)
ollama_client = OpenAI(
    base_url=os.getenv("OLLAMA_BASE_URL", "http://localhost:11434/v1"),
    api_key="ollama",  # Ollama requires a non-empty key but ignores the value
)

def _get_client(model: str) -> OpenAI:
    """
    Return the correct OpenAI-compatible client based on the model ID.
    Ollama models have no '/' in their ID (e.g. 'mistral:latest', 'qwen2:7b').
    OpenRouter models always contain a '/' (e.g. 'google/gemini-2.0-flash-lite:free').
    """
    if "/" not in model:
        print(f"[ai_service] Routing '{model}' -> Ollama ({os.getenv('OLLAMA_BASE_URL', 'http://localhost:11434/v1')})")
        return ollama_client
    print(f"[ai_service] Routing '{model}' -> OpenRouter")
    return openrouter_client

SYSTEM_PROMPT = """You are a Marketing AI. Return ONLY valid JSON, no markdown, no explanation.

CRITICAL IMAGE GUIDELINES:
1. Do NOT include any humans, people, faces, hands, limbs, athletes, models, silhouettes, or human figures/parts in ANY of the image prompts.
2. Every prompt must focus 100% on the product and its environment, packaging, ingredients, or abstract elements from different perspectives.
3. NEVER use ambiguous packaging words like "tub" alone, as image generators mistake "tub" for a bathtub, washbasin, or tub basin. Instead, always use concrete packaging terms like "cylindrical supplement canister", "plastic protein powder jar with a screw-top lid", "resealable stand-up pouch", or "matte finish jar".
4. Explicitly reference the product type from the brief (e.g., if the user brief is protein powder, ensure the prompt describes "protein powder canister" or "scoop of protein powder", and includes relevant ingredients like plant leaves, cocoa beans, or vanilla pods in the background).
5. Explicitly include the brand name from the generated "campaign_title" on the packaging label (e.g., "a label reading 'CAMPAIGN_TITLE'").

JSON Schema:
{
  "campaign_title": "string",
  "target_audience": "string",
  "brand_voice": "string",
  "blog_post": {
    "title": "string",
    "meta_description": "string (max 160 chars)",
    "body": "string (3-4 paragraphs markdown)",
    "cta": "string"
  },
  "social_media": {
    "tweets": [
      {"variant": 1, "text": "string (max 280 chars)", "hashtags": ["tag1", "tag2"]}
    ]
  },
  "seo_metadata": {
    "primary_keyword": "string",
    "secondary_keywords": ["kw1", "kw2"],
    "meta_title": "string"
  },
  "image_prompts": [
    "prompt1 (Hero Shot: A highly descriptive, detailed product-only prompt. Show the cylindrical supplement canister on a premium pedestal, concrete block, or minimalist studio background with clean lighting.)",
    "prompt2 (Lifestyle: A highly descriptive product-focused setting. Place the supplement canister on a kitchen counter or a gym bench next to relevant items like a shaker bottle, fresh green leaves, or ingredients. No humans.)",
    "prompt3 (Product Close-Up: A macro close-up shot focusing on the packaging design, label details showing the brand name, lid texture, or a scoop of powder. No humans.)",
    "prompt4 (Social Media Banner: A wide-angle landscape shot of the supplement canister set off-center against a vibrant, premium backdrop, allowing ample clean space for text. No humans.)",
    "prompt5 (Editorial: An artistic, high-concept composition. Surround the supplement canister with its raw, natural ingredients, elegant shadows, or botanical elements. No humans.)",
    "prompt6 (Cinematic: A dramatic, atmospheric product shot with rich color grading, intense lighting/shadow play, and a shallow depth of field, highlighting the canister as the sole main subject. No humans.)"
  ]
}"""

def repair_json(json_str: str) -> str:
    """
    Attempt to repair common LLM JSON errors.
    """
    # 1. Strip markdown wrappers
    json_str = re.sub(r'^```json\s*', '', json_str.strip())
    json_str = re.sub(r'^```\s*', '', json_str)
    json_str = re.sub(r'\s*```$', '', json_str)
    
    # 2. Fix trailing commas in arrays/objects
    json_str = re.sub(r',\s*([\]}])', r'\1', json_str)
    
    # 3. Handle unescaped newlines in strings
    # Find all content between double quotes and replace internal newlines
    def fix_newlines(match):
        return match.group(0).replace('\n', '\\n').replace('\r', '')
    
    json_str = re.sub(r'"(.*?)"', fix_newlines, json_str, flags=re.DOTALL)
    
    return json_str

def generate_campaign_text(user_brief: str, model_override: str = None) -> dict:
    model = model_override or os.getenv("TEXT_MODEL", "google/gemini-2.0-flash-lite:free")
    
    print(f"[ai_service] Requesting campaign from: {model}")
    
    response = _get_client(model).chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": f"Campaign brief: {user_brief}"},
        ],
        max_tokens=2000,
        timeout=300.0
    )

    raw_content = response.choices[0].message.content
    
    # --- Robust Parsing & Repair ---
    try:
        # Step 1: Extract JSON using regex (safest way to skip AI chatter)
        match = re.search(r'(\{.*\})', raw_content, re.DOTALL)
        if not match:
            raise ValueError("No JSON object found in response.")
            
        json_body = match.group(1)
        
        # Step 2: Try direct parse
        try:
            return json.loads(json_body)
        except json.JSONDecodeError:
            # Step 3: Attempt Repair
            print("[ai_service] JSON error detected. Attempting self-healing...")
            repaired = repair_json(json_body)
            return json.loads(repaired)
            
    except Exception as e:
        print(f"[ai_service] Final parsing failure: {e}")
        # Debug: Save raw response for analysis
        with open("failed_response.txt", "w", encoding="utf-8") as f:
            f.write(raw_content)
        raise ValueError(f"Failed to parse AI response as JSON: {str(e)}")
