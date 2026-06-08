# Campaign Generation Flow

This document outlines the step-by-step lifecycle of a marketing campaign generation task.

## 1. Request Phase
1. User enters a **Brief** and clicks "Generate".
2. Frontend hits `POST /generate` on the FastAPI server.
3. FastAPI creates a unique `task_id` and enqueues a Celery task.
4. User is redirected to the **Loading State**.

## 2. Text Generation Phase (Background)
1. The Celery worker picks up the task.
2. **Step A**: Calls **OpenRouter** with a strict system prompt to generate JSON data.
3. **Self-Healing Logic**: The backend validates the JSON. If the LLM makes a syntax error (e.g., missing comma), the "Self-Healing" parser repairs the string on the fly.
4. The campaign data (Blog, Tweets, SEO, Image Prompts) is saved to **Redis**.

## 3. Visual Generation Phase (Frontend)
1. Frontend detects `status: success` and receives the `image_prompts`.
2. For each prompt, the **ImageCard** component calls `puter.ai.txt2img`.
3. Puter.js handles the high-quality generation using the **Flux.1 Schnell** model.
4. Images are rendered in real-time in the user's browser.

## 4. Publishing Phase (Automation)
1. User clicks **"Auto Publish with Playwright"**.
2. Frontend hits `POST /publish` with the campaign content.
3. FastAPI launches a **Headed Playwright Browser**.
4. The user performs manual login (LinkedIn/Twitter).
5. Once logged in, the AI detects the social media composer and injects the generated blog post or tweet automatically.
