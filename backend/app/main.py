from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import auth, assessments, questions

app = FastAPI(
    title="QS Ai API",
    description="Pre-contract job risk assessment tool for construction contractors",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
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
