# Setup & Installation Guide

Follow these steps to get the Content Marketing Engine running on your local machine.

## Prerequisites
- **Node.js** (v18+)
- **Python** (3.9+)
- **Redis Server** (Running locally or via Docker)

## 1. Backend Setup

1. **Navigate to backend**:
   ```bash
   cd backend
   ```
2. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   playwright install chromium
   ```
3. **Configure Environment**:
   Create a `.env` file:
   ```env
   OPENROUTER_API_KEY=your_key_here
   TEXT_MODEL=google/gemini-2.0-flash-lite:free
   REDIS_URL=redis://localhost:6379/0
   ```

## 2. Frontend Setup

1. **Navigate to frontend**:
   ```bash
   cd frontend
   ```
2. **Install Dependencies**:
   ```bash
   npm install
   ```

## 3. Running the Engine

You will need **4 terminal windows**:

### Terminal 1: Redis
```bash
redis-server
```

### Terminal 2: Celery Worker
```bash
cd backend
celery -A tasks.campaign_tasks worker --loglevel=info -P threads
```

### Terminal 3: FastAPI Server
```bash
cd backend
uvicorn main:app --reload --port 8000
```

### Terminal 4: React Frontend
```bash
cd frontend
npm run dev
```

## 4. Troubleshooting
- **Playwright Errors**: If the browser doesn't open, run `playwright install` again.
- **Image Generation**: Ensure you have an active internet connection for Puter.js and OpenRouter.
- **Redis Connection**: Ensure `REDIS_URL` in `.env` matches your local Redis port (default 6379).
