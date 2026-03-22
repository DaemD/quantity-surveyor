# QS Ai — Pre-Contract Risk Assessment Tool

A full-stack web application for construction contractors to assess the commercial and financial risk of a contract before signing.

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18 + TypeScript + Vite + Tailwind CSS |
| Backend | Python FastAPI + SQLAlchemy 2.0 (async) |
| Database | PostgreSQL (via asyncpg) |
| Auth | JWT (python-jose) + bcrypt passwords |

---

## Quick Start

### 1. Start PostgreSQL

```bash
docker-compose up -d
```

This starts a PostgreSQL instance on port 5432 with database `qsai`.

### 2. Backend Setup

```bash
cd backend
python -m venv venv
# Windows: venv\Scripts\activate
# macOS/Linux: source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env if needed
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

Backend API docs: http://localhost:8000/docs

### 3. Frontend Setup

```bash
cd frontend
npm install
# .env is pre-configured to point to http://localhost:8000
npm run dev
```

Frontend: http://localhost:5173

---

## Customisation

### Questions
Edit `backend/app/config/questions.json` — the frontend renders questions dynamically from the API. No frontend changes needed.

### Scoring Rules
Edit `backend/app/config/scoring.json` — all thresholds and point weights are here. No code changes needed.

See `backend/README.md` for full details.

---

## Project Structure

```
qs-ai/
├── backend/          # FastAPI app
├── frontend/         # React app
└── docker-compose.yml
```
