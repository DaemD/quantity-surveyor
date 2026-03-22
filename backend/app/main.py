import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import auth, assessments, questions

# Log the DB host at startup so we can confirm the env var is set
_db_url = os.getenv("DATABASE_URL", "NOT SET - using localhost fallback")
print(f"[startup] DATABASE_URL = {_db_url[:40]}..." if len(_db_url) > 40 else f"[startup] DATABASE_URL = {_db_url}")

app = FastAPI(
    title="QS Ai API",
    description="Pre-contract job risk assessment tool for construction contractors",
    version="1.0.0",
)

_cors_origins = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:5173,http://localhost:3000"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in _cors_origins],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(assessments.router, prefix="/assessments", tags=["assessments"])
app.include_router(questions.router, tags=["questions"])


@app.get("/health")
async def health_check():
    return {"status": "ok"}
