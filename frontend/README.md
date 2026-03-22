# QS Ai — Frontend

React + TypeScript + Vite frontend for the QS Ai risk assessment tool.

## Setup

```bash
npm install
cp .env.example .env   # or edit .env directly
npm run dev
```

App runs at: http://localhost:5173

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `http://localhost:8000` | Backend API URL |

## Key Design Decisions

- **Questions are loaded from the API** — `GET /questions` is called on mount in the wizard. Never hardcoded.
- **All scoring is server-side** — The frontend only displays what the backend returns in `results`.
- **TanStack Query** — All API calls use React Query for caching and loading states.
- **JWT in localStorage** — Token is attached automatically by the Axios interceptor.
- **Dark theme** — Slate/zinc color scheme throughout.

## Pages

| Route | Component | Description |
|-------|-----------|-------------|
| `/login` | `Login.tsx` | Email + password login |
| `/register` | `Register.tsx` | Full company registration |
| `/` | `Dashboard.tsx` | Stats + assessment history |
| `/assessment/new` | `AssessmentWizard.tsx` | Multi-step assessment form |
| `/assessment/:id` | `ViewAssessmentPage` | Read-only result view |
