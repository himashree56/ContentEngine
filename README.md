# ContentEngine — Professional AI Marketing Studio

Generate **premium blog posts, tweets, SEO metadata, and 8k Flux images** from a single campaign brief. Powered by a high-performance backend (FastAPI, Celery, Redis) and a dynamic frontend (React, Puter.js).

---

## 🚀 Key Features

- **Dual AI Pipeline** — Uses **OpenRouter** for advanced text generation and **Puter.js** for high-fidelity **Flux.1 Schnell** image generation.
- **Self-Healing JSON** — Robust backend parsing that automatically repairs AI formatting errors.
- **Browser Automation** — Integrated **Playwright** for "One-Click" publishing to LinkedIn and Twitter.
- **Premium Dashboard** — Professional dark mode UI with real-time Markdown rendering and Model Comparison tools.
- **Real-Time Progress** — Async task queue (Celery + Redis) with step-by-step progress tracking.

---

## 🛠 Tech Stack

- **Frontend**: React (Vite), Puter.js, Tailwind-inspired Vanilla CSS.
- **Backend**: FastAPI, Celery, Redis.
- **AI Models**: 
    - Text: `google/gemini-2.0-flash-lite:free` (via OpenRouter)
    - Image: `Flux.1 Schnell` (via Puter.js)
- **Automation**: Playwright (Headed automation).

---

## 📖 Documentation Index

- [**Architecture Guide**](ARCHITECTURE.md) — Deep dive into the system design.
- [**Setup & Installation**](SETUP.md) — How to run the project locally.
- [**Campaign Flow**](FLOW.md) — Step-by-step logic of the generation pipeline.

---

## ⚡ Quick Start

1. **Install Redis** and ensure it's running.
2. **Setup Backend**:
   ```bash
   cd backend
   pip install -r requirements.txt
   playwright install
   ```
3. **Setup Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
4. **Start Worker**:
   ```bash
   celery -A tasks.campaign_tasks worker --loglevel=info
   ```

---

## 🤝 Contact & Consultation

Interested in scaling your AI operations?
- **Email**: [himashree966@gmail.com](mailto:himashree966@gmail.com)
- **Phone**: [+91 70229 89390](tel:+917022989390)

---

*Built as a production-grade demonstration for the GenAI Internship.*
