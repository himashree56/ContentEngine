# ContentEngine — Multi-Modal AI Content Marketing Engine

Generate **blog posts, tweets, SEO metadata, and promotional images** from a single campaign brief — all in parallel using a Celery + Redis task queue powered by [OpenRouter](https://openrouter.ai).

---

## Architecture

```
User (React) ──POST /generate──► FastAPI ──delay()──► Celery Worker
                                                          │
                                              ┌───────────┴──────────────┐
                                              │  generate_campaign_text  │  ← OpenRouter (GPT-4o / Claude)
                                              │  + ThreadPoolExecutor    │
                                              │    generate_image ×2     │  ← OpenRouter (flux-schnell)
                                              └───────────┬──────────────┘
                                                          │
User (React) ──GET /status/:id──────────────────────────►│ Redis result backend
```

- **Text AI** — OpenRouter's OpenAI-compatible API, using the `openai` Python SDK pointed at `https://openrouter.ai/api/v1`  
- **Image AI** — OpenRouter's REST `/images/generations` endpoint (direct `requests` call)  
- **Task Queue** — Celery with Redis as both broker and result backend  
- **Frontend** — React (Vite) polls `/status/{task_id}` every 2 seconds until `complete` or `failed`

---

## Setup

### 1. Get an OpenRouter API key

Free key at: **https://openrouter.ai/keys**

### 2. Configure environment variables

```bash
cd project3-content-engine/backend
cp .env.example .env
# Edit .env and set your OPENROUTER_API_KEY
```

`.env` contents:
```
OPENROUTER_API_KEY=sk-or-...your-key-here...
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
TEXT_MODEL=openai/gpt-4o
IMAGE_MODEL=black-forest-labs/flux-schnell
REDIS_URL=redis://localhost:6379/0
YOUR_SITE_URL=http://localhost:5173
YOUR_SITE_NAME=ContentEngine
```

### 3. Install Redis

| Platform | Command |
|----------|---------|
| macOS | `brew install redis && brew services start redis` |
| Ubuntu/Debian | `sudo apt install redis-server && sudo systemctl start redis` |
| Windows | Use [Redis for Windows](https://github.com/microsoftarchive/redis/releases) or WSL |

### 4. Install Python dependencies

```bash
cd project3-content-engine/backend
pip install -r requirements.txt
```

---

## Running the Project

Open **4 terminals**:

**Terminal 1 — Redis**
```bash
redis-server
```

**Terminal 2 — Celery Worker**
```bash
cd project3-content-engine/backend
celery -A tasks.campaign_tasks worker --loglevel=info
```

**Terminal 3 — FastAPI Backend**
```bash
cd project3-content-engine/backend
uvicorn main:app --reload --port 8000
```

**Terminal 4 — React Frontend**
```bash
cd project3-content-engine/frontend
npm install
npm run dev
```

Then open **http://localhost:5173** in your browser.

---

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Liveness probe |
| `POST` | `/generate` | Enqueue campaign task → returns `task_id` |
| `GET` | `/status/{task_id}` | Poll task status and result |

### POST `/generate` body
```json
{
  "user_brief": "Launch campaign for sustainable bamboo water bottles targeting eco-conscious millennials",
  "text_model": "openai/gpt-4o"
}
```

### GET `/status/{task_id}` responses
```json
// Pending
{ "status": "pending" }

// Processing
{ "status": "processing", "step": "Generating campaign copy..." }

// Complete
{ "status": "complete", "data": { ... full campaign object ... } }

// Failed
{ "status": "failed", "error": "..." }
```

---

## Campaign Output Schema

```json
{
  "campaign_title": "...",
  "target_audience": "...",
  "brand_voice": "...",
  "blog_post": {
    "title": "...",
    "meta_description": "...",
    "body": "...",
    "cta": "..."
  },
  "tweets": [
    { "variant": 1, "text": "...", "hashtags": ["..."] },
    { "variant": 2, "text": "...", "hashtags": ["..."] },
    { "variant": 3, "text": "...", "hashtags": ["..."] }
  ],
  "seo": {
    "primary_keyword": "...",
    "secondary_keywords": ["...", "...", "..."],
    "meta_title": "..."
  },
  "image_url_1": "https://...",
  "image_url_2": "https://..."
}
```

---

## Security Notes

- ✅ All secrets stored in `.env` — never hardcoded  
- ✅ `.env` added to `.gitignore`  
- ✅ `HTTP-Referer` and `X-Title` headers sent on every OpenRouter request  
- ✅ Image generation falls back to a placeholder URL on failure — pipeline never breaks  

---

## Project Structure

```
project3-content-engine/
├── backend/
│   ├── main.py                    # FastAPI app + endpoints
│   ├── tasks/
│   │   └── campaign_tasks.py      # Celery task with parallel image generation
│   ├── services/
│   │   ├── ai_service.py          # OpenRouter text generation (openai SDK)
│   │   └── image_service.py       # OpenRouter image generation (requests)
│   ├── models/
│   │   └── schemas.py             # Pydantic request/response models
│   ├── requirements.txt
│   ├── .env.example
│   └── .gitignore
├── frontend/
│   └── src/
│       ├── App.jsx                # Root component + polling logic
│       ├── api.js                 # Axios API client
│       └── components/
│           ├── InputSection.jsx
│           ├── LoadingState.jsx
│           ├── ErrorState.jsx
│           └── ResultsDashboard.jsx
└── README.md
```

---

*Built for the 4-week GenAI Internship — Week 3 Project.*
