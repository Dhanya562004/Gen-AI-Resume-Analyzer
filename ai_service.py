import json
import os
import re
import time
import warnings
import requests

try:
    from google import genai
    from google.genai import types
    HAS_GENAI_SDK = True
except ImportError:
    HAS_GENAI_SDK = False

try:
    with warnings.catch_warnings():
        warnings.simplefilter("ignore")
        import google.generativeai as genai_legacy
    HAS_LEGACY_SDK = True
except ImportError:
    HAS_LEGACY_SDK = False


def clean_json_string(text: str) -> str:
    """Cleans backticks, markdown formatting, and extracts raw JSON block."""
    if not text:
        return "{}"
    text = text.strip()
    if text.startswith("```json"):
        text = text[7:]
    elif text.startswith("```"):
        text = text[3:]
    if text.endswith("```"):
        text = text[:-3]
    text = text.strip()
    start = text.find("{")
    end = text.rfind("}")
    if start != -1 and end != -1 and end > start:
        text = text[start : end + 1]
    return text


def call_ai_model(api_key: str, prompt: str, model_name: str = "gemini-2.0-flash") -> str:
    """
    Calls Google Gemini API, Groq, or xAI API with automatic retries on 503 (high demand) and 429 errors.
    Supports Google Gemini API keys starting with 'AQ.Ab...', 'AIza...', etc.
    Reads GEMINI_API_KEY from environment if api_key is empty.
    """
    api_key = (api_key or "").strip()
    if not api_key:
        api_key = (
            os.getenv("GEMINI_API_KEY", "").strip()
            or os.getenv("GROQ_API_KEY", "").strip()
            or os.getenv("XAI_API_KEY", "").strip()
        )

    if not api_key:
        raise ValueError("API Key is missing. Please enter your API Key in the sidebar or configure GEMINI_API_KEY in environment/secrets.")

    # 1. Groq API Key
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

    # 2. xAI Grok API Key
    if api_key.startswith("xai-"):
        url = "https://api.x.ai/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": "grok-beta",
            "messages": [{"role": "user", "content": prompt}],
            "response_format": {"type": "json_object"}
        }
        resp = requests.post(url, headers=headers, json=payload, timeout=60)
        if resp.status_code != 200:
            raise Exception(f"xAI API Error ({resp.status_code}): {resp.text}")
        res_json = resp.json()
        return res_json["choices"][0]["message"]["content"]

    # 3. Google Gemini API
    # High-capacity candidate models list
    candidate_models = [
        model_name,
        "gemini-2.0-flash",
        "gemini-2.0-flash-lite",
        "gemini-3.8-flash",
        "gemini-2.5-flash",
        "gemini-1.5-flash",
        "gemini-1.5-pro",
    ]
    clean_models = []
    for m in candidate_models:
        if m:
            m_norm = m.replace("models/", "").strip()
            if m_norm and m_norm not in clean_models:
                clean_models.append(m_norm)

    all_errors = []

    for m in clean_models:
        for attempt in range(2):
            # Strategy A1: google-genai SDK (JSON mode)
            if HAS_GENAI_SDK:
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
                    err_str = str(e)
                    all_errors.append(f"SDK JSON ({m}, retry {attempt}): {err_str}")
                    if "503" in err_str or "UNAVAILABLE" in err_str or "429" in err_str:
                        time.sleep(1.5)
                        continue

                # Strategy A2: google-genai SDK (Plain text fallback)
                try:
                    client = genai.Client(api_key=api_key)
                    response = client.models.generate_content(
                        model=m,
                        contents=prompt,
                    )
                    if response and response.text:
                        return response.text
                except Exception as e:
                    err_str = str(e)
                    all_errors.append(f"SDK Plain ({m}, retry {attempt}): {err_str}")

            # Strategy B: Legacy google-generativeai SDK
            if HAS_LEGACY_SDK:
                try:
                    genai_legacy.configure(api_key=api_key)
                    legacy_model = genai_legacy.GenerativeModel(
                        model_name=m,
                        generation_config={"response_mime_type": "application/json"}
                    )
                    resp = legacy_model.generate_content(prompt)
                    if resp and resp.text:
                        return resp.text
                except Exception as e:
                    all_errors.append(f"Legacy SDK ({m}): {e}")

            # Strategy C1: Gemini REST API v1 (JSON mode)
            try:
                url = f"https://generativelanguage.googleapis.com/v1/models/{m}:generateContent?key={api_key}"
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
                        if parts and "text" in parts[0]:
                            return parts[0]["text"]
                elif resp.status_code in [503, 429]:
                    time.sleep(1.5)
                    all_errors.append(f"REST v1 ({m}): HTTP {resp.status_code}")
                    continue
                else:
                    all_errors.append(f"REST v1 ({m}): HTTP {resp.status_code}")
            except Exception as e:
                all_errors.append(f"REST v1 Exc ({m}): {e}")

            # Strategy C2: Gemini REST API v1 (Plain text mode)
            try:
                url = f"https://generativelanguage.googleapis.com/v1/models/{m}:generateContent?key={api_key}"
                headers = {"Content-Type": "application/json"}
                payload = {
                    "contents": [{"parts": [{"text": prompt}]}]
                }
                resp = requests.post(url, headers=headers, json=payload, timeout=60)
                if resp.status_code == 200:
                    res_j = resp.json()
                    candidates = res_j.get("candidates", [])
                    if candidates:
                        parts = candidates[0].get("content", {}).get("parts", [])
                        if parts and "text" in parts[0]:
                            return parts[0]["text"]
            except Exception as e:
                all_errors.append(f"REST v1 Plain Exc ({m}): {e}")

            # Strategy D: Gemini REST API v1beta
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
                        if parts and "text" in parts[0]:
                            return parts[0]["text"]
            except Exception as e:
                all_errors.append(f"REST v1beta Exc ({m}): {e}")

            break  # Break retry loop if non-transient

    # If all models fail
    summary_err = all_errors[-1] if all_errors else "All API calls failed."
    raise Exception(f"Gemini API temporarily experiencing high server demand across models. Please retry in a few seconds. Details: {summary_err}")


def generate_interview_report(api_key: str, resume_text: str, self_description: str, job_description: str, model_name: str = "gemini-2.0-flash") -> dict:
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
- Return ONLY valid JSON. Do not include markdown code block backticks outside the JSON object.
- Ensure all fields are filled with comprehensive, high-quality, actionable insights.
"""

    raw_response = call_ai_model(api_key, prompt, model_name=model_name)
    cleaned = clean_json_string(raw_response)
    try:
        data = json.loads(cleaned)
    except json.JSONDecodeError as e:
        raise Exception(f"Failed to parse JSON response from AI: {e}\nRaw output: {raw_response[:300]}")

    return data


def generate_resume_html(api_key: str, resume_text: str, self_description: str, job_description: str, model_name: str = "gemini-2.0-flash") -> str:
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
