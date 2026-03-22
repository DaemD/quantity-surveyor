# QS Ai — Backend

FastAPI + PostgreSQL backend for the QS Ai pre-contract risk assessment tool.

## Setup

### 1. Prerequisites
- Python 3.11+
- PostgreSQL running locally (or use Docker — see root `docker-compose.yml`)

### 2. Create virtual environment

```bash
cd backend
python -m venv venv
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure environment

```bash
cp .env.example .env
# Edit .env with your database credentials and a strong SECRET_KEY
```

### 5. Run database migrations

```bash
alembic upgrade head
```

### 6. Start the server

```bash
uvicorn app.main:app --reload --port 8000
```

API docs available at: http://localhost:8000/docs

---

## Customisation

### Changing / Adding Questions

Edit `app/config/questions.json`. No code changes are needed.

**To add a question to the Commercial section:**
```json
{
  "id": "myNewQuestion",
  "label": "My New Question",
  "help": "Tooltip text",
  "options": [
    { "label": "Bad option", "value": -2 },
    { "label": "Good option", "value": 2 }
  ]
}
```
Add it to `sections[0].questions` (the `commercial` section).

**To add a numeric input to the Financial section:**
```json
{
  "id": "myNumber",
  "label": "My Number",
  "prefix": "£",
  "default": 0,
  "group": "job",
  "groupLabel": "This Job's Details"
}
```
Add it to `sections[1].questions` (the `execution` section).

The frontend will automatically render new questions — no frontend changes needed.

### Changing Scoring Rules

Edit `app/config/scoring.json`.

- `execution.weights` — change pass/fail point values for each financial check
- `execution.cashflow_weeks_buffer` — how many weeks of burn must cash cover (default: 4)
- `execution.survival_months_min` — minimum months overhead buffer required (default: 3)
- `execution.jobsize_ratio_max` — max contract/avg ratio before "too big" flag (default: 2.5)
- `overall.excellent_commercial_min` — min commercial score for Excellent rating (default: 10)
- `overall.excellent_execution_min` — min execution score for Excellent rating (default: 15)

No restarts needed if you reload the service; the config is read at startup. For production, restart the server after editing JSON files.

---

## API Reference

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /auth/register | No | Register new user |
| POST | /auth/login | No | Login, get JWT |
| GET | /auth/me | Yes | Current user profile |
| GET | /questions | No | Full questions config |
| POST | /assessments | Yes | Submit answers, get scored result |
| GET | /assessments | Yes | List all user's assessments |
| GET | /assessments/{id} | Yes | Single assessment detail |
