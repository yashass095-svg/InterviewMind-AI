# InterviewMind AI Hackathon API Specification

## Endpoint

POST /api/interview

## Request

New session:

{
  "candidateId": "CAND-001"
}

Existing session:

{
  "sessionId": "<uuid>",
  "answer": "Candidate response text"
}

## Response

New or existing session while the interview is active:

{
  "reply": "<generated question>",
  "done": false
}

After the eighth answer has been received:

{
  "reply": "Interview completed.",
  "done": true,
  "feedback": {
    "summary": "",
    "strengths": [],
    "gaps": [],
    "next": []
  }
}
