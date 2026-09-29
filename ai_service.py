import json
import re
import requests
from google import genai
from google.genai import types


def clean_json_string(text: str) -> str:
    """Cleans backticks, markdown formatting, and extracts raw JSON block."""
    text = text.strip()
    if text.startswith("```json"):
        text = text[7:]
    elif text.startswith("```"):
        text = text[3:]
    if text.endswith("```"):
        text = text[:-3]
    text = text.strip()
    # Try finding first { and last }
    start = text.find("{")
    end = text.rfind("}")
    if start != -1 and end != -1 and end > start:
        text = text[start : end + 1]
    return text


def call_ai_model(api_key: str, prompt: str, model_name: str = "gemini-2.5-flash") -> str:
    """
    Calls Google Gemini API or Groq API depending on the API key type.
    Handles key format starting with 'AQ.Ab...', 'AIza...', or 'gsk_'.
    """
    api_key = api_key.strip()
    if not api_key:
        raise ValueError("API Key is missing. Please enter your API Key in the sidebar.")

    # Groq API Key
    if api_key.startswith("gsk_"):
        url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": "llama-3.3-70b-versatile",
            "messages": [{"role": "user", "content": prompt}],
            "response_format": {"type": "json_object"}
        }
        resp = requests.post(url, headers=headers, json=payload, timeout=60)
        if resp.status_code != 200:
            raise Exception(f"Groq API Error ({resp.status_code}): {resp.text}")
        res_json = resp.json()
        return res_json["choices"][0]["message"]["content"]

    # Google Gemini API (AQ.Ab..., AIza..., etc.)
    # Models to attempt in order of preference
    models_to_try = [model_name, "gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"]
    last_error = None

    for m in dict.fromkeys(models_to_try):  # Preserve order, unique items
        try:
            client = genai.Client(api_key=api_key)
            response = client.models.generate_content(
                model=m,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json"
                ),
            )
            if response and response.text:
                return response.text
        except Exception as e:
            last_error = e
            # Try REST API fallback for Gemini if SDK encounters error
            try:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/{m}:generateContent?key={api_key}"
                headers = {"Content-Type": "application/json"}
                payload = {
                    "contents": [{"parts": [{"text": prompt}]}],
                    "generationConfig": {"responseMimeType": "application/json"}
                }
                resp = requests.post(url, headers=headers, json=payload, timeout=60)
                if resp.status_code == 200:
                    res_j = resp.json()
                    candidates = res_j.get("candidates", [])
                    if candidates:
                        parts = candidates[0].get("content", {}).get("parts", [])
                        if parts:
                            return parts[0].get("text", "")
            except Exception as e_rest:
                pass

    raise Exception(f"Failed to generate content with Gemini API Key. Details: {last_error}")


def generate_interview_report(api_key: str, resume_text: str, self_description: str, job_description: str, model_name: str = "gemini-2.5-flash") -> dict:
    """
    Generates structured interview report JSON from candidate resume, self description, and job description.
    """
    prompt = f"""Generate a detailed interview analysis report for a candidate with the following details:

Candidate Resume:
{resume_text}

Self Description:
{self_description}

Target Job Description:
{job_description}

You MUST return a JSON object with EXACTLY these fields:
{{
  "matchScore": (number between 0 and 100),
  "summary": "Brief executive summary of fit",
  "technicalQuestionSchema": [
    {{
      "question": "Technical question specific to role",
      "intention": "What interviewer evaluates",
      "answer": "Detailed answer strategy and key technical concepts to cover"
    }}
  ],
  "behaviourQuestionSchema": [
    {{
      "question": "Behavioral question",
      "intention": "Interviewer intention/trait tested",
      "answer": "STAR method response guideline with example"
    }}
  ],
  "skillGapsSchema": [
    {{
      "skill": "Skill missing or needs improvement",
      "severity": "low" or "medium" or "high",
      "recommendation": "How to bridge this gap"
    }}
  ],
  "preparationPlanSchema": [
    {{
      "day": 1,
      "focus": "Main focus area for this day",
      "tasks": ["Specific actionable task 1", "Specific actionable task 2"]
    }}
  ]
}}

CRITICAL QUESTION & STRUCTURE RULES:
1. matchScore MUST realistically reflect candidate alignment (0-100).
2. If matchScore is 80 to 100:
   - technicalQuestionSchema MUST contain exactly 4 questions
   - behaviourQuestionSchema MUST contain exactly 3 questions
   - skillGapsSchema MUST contain 2 to 3 items
   - preparationPlanSchema MUST contain exactly 5 days
3. If matchScore is 50 to 79:
   - technicalQuestionSchema MUST contain exactly 6 questions
   - behaviourQuestionSchema MUST contain exactly 4 questions
   - skillGapsSchema MUST contain 3 to 5 items
   - preparationPlanSchema MUST contain exactly 7 days
4. If matchScore is below 50:
   - technicalQuestionSchema MUST contain exactly 8 questions
   - behaviourQuestionSchema MUST contain exactly 5 questions
   - skillGapsSchema MUST contain 5 to 7 items
   - preparationPlanSchema MUST contain exactly 10 days

Important:
- Return ONLY valid JSON. Do not include markdown code block backticks if possible, or keep inside standard JSON object format.
- Ensure all fields are filled with comprehensive, high-quality, actionable insights.
"""

    raw_response = call_ai_model(api_key, prompt, model_name=model_name)
    cleaned = clean_json_string(raw_response)
    try:
        data = json.loads(cleaned)
    except json.JSONDecodeError as e:
        raise Exception(f"Failed to parse JSON response from AI: {e}\nRaw output: {raw_response[:300]}")

    return data


def generate_resume_html(api_key: str, resume_text: str, self_description: str, job_description: str, model_name: str = "gemini-2.5-flash") -> str:
    """
    Generates ATS-Friendly Resume HTML string tailored to target job.
    """
    prompt = f"""Create a highly attractive, professional, ATS-optimized resume in full HTML format for the candidate based on:

Candidate Resume:
{resume_text}

Self Description:
{self_description}

Target Job Description:
{job_description}

Layout and Styling Guidelines:
1. Two-column responsive print layout with a dark/blue accent header.
2. Clean, elegant typography (Helvetica/Arial), clear section headers, consistent margins.
3. Left main column: Professional Summary, Work Experience, Key Achievements, Projects.
4. Right sidebar: Skills (Technical & Soft), Certifications, Education, Contact details.
5. ATS compliance: Use standard semantic tags (<section>, <h2>, <ul>, <li>, <strong>).
6. Highlight keywords relevant to the target job description naturally.
7. Return ONLY a JSON object with one key: "html".
8. The "html" field value must be a complete HTML string starting with <!DOCTYPE html> containing embedded CSS in <style> tag.

Return format:
{{
  "html": "<!DOCTYPE html><html><head><style>/* CSS */</style></head><body>/* Content */</body></html>"
}}
"""

    raw_response = call_ai_model(api_key, prompt, model_name=model_name)
    cleaned = clean_json_string(raw_response)
    try:
        data = json.loads(cleaned)
        html_content = data.get("html", "")
        if html_content:
            return html_content
    except Exception:
        pass

    # If raw response is HTML directly
    if "<!DOCTYPE html>" in raw_response or "<html>" in raw_response:
        return raw_response

    raise Exception("AI did not return valid HTML for the resume.")
