import os
from typing import List

from dotenv import load_dotenv
from google import genai
from google.genai import types
from pydantic import BaseModel


# Load variables from backend/.env
load_dotenv()


class EvaluationResult(BaseModel):
    score: int
    strengths: List[str]
    improvements: List[str]


class AIInterviewEvaluator:

    def __init__(self):
        # Read Gemini API key from .env
        api_key = os.getenv("GEMINI_API_KEY")

        if not api_key:
            raise RuntimeError(
                "GEMINI_API_KEY is missing from backend/.env"
            )

        # Create Gemini client
        self.client = genai.Client(api_key=api_key)

        # Gemini model
        self.model = "gemini-3.6-flash"

    def evaluate_answer(
        self,
        question: str,
        answer: str,
    ) -> dict:

        prompt = f"""
You are an expert technical interviewer.

Evaluate the candidate's answer to the interview question.

INTERVIEW QUESTION:
{question}

CANDIDATE ANSWER:
{answer}

Evaluate the answer using these criteria:

1. Technical correctness
2. Understanding of the concept
3. Completeness
4. Clarity
5. Practical knowledge
6. Examples, if appropriate

Give a fair score from 0 to 100.

SCORING GUIDELINES:

90-100 = Excellent
75-89 = Very Good
60-74 = Good
40-59 = Average
20-39 = Weak
0-19 = Very Poor

IMPORTANT RULES:

- Score the actual answer provided by the candidate.
- Do not give a score of 0 just because the answer is short.
- If the answer contains some correct technical information, give appropriate partial credit.
- Give a higher score when the candidate demonstrates correct understanding.
- Do not invent information that is not present in the answer.
- Give 2 or 3 specific strengths.
- Give 2 or 3 specific improvements.
- The score must be an integer between 0 and 100.

Return the result as structured JSON.
"""

        response = self.client.models.generate_content(
            model=self.model,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=EvaluationResult,
            ),
        )

        # Gemini SDK may return a parsed Pydantic object
        if response.parsed:
            result = response.parsed

        # Otherwise parse the JSON text
        else:
            result = EvaluationResult.model_validate_json(
                response.text
            )

        # Make sure score stays between 0 and 100
        score = max(0, min(100, int(result.score)))

        return {
            "score": score,
            "strengths": result.strengths,
            "improvements": result.improvements,
        }