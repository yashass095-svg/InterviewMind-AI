# InterviewMind AI

InterviewMind AI is an adaptive technical interview platform for enterprise AI cohorts. It helps teams select a candidate, start an AI-led interview, collect answers, and generate a structured performance report.

## Features

- Polished Next.js landing page and candidate command center
- Candidate search, readiness filtering, and cohort metrics
- FastAPI backend for interview sessions, answers, finish flow, and reports
- Gemini-based answer evaluation when `GEMINI_API_KEY` is configured
- Curriculum and candidate datasets included for demo workflows

## Project Structure

```text
backend/   FastAPI API and interview logic
frontend/  Next.js application
docs/      Technical notes
```

## Run Backend

```powershell
cd backend
python -m venv venv
.\venv\Scripts\pip install -r requirements.txt
copy .env.example .env
.\venv\Scripts\uvicorn.exe app.main:app --reload
```

Add your Gemini key to `backend/.env` before using AI evaluation.

## Run Frontend

```powershell
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000`.

## Submission Notes

- Problem statement: Redesign ABTalks
- AI usage log: see `PROMPTS.md`
