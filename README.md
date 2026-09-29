# 🤖 GenAI Resume Analyzer & Interview Prep

An intelligent web application built with **Streamlit**, **Google Gemini AI**, and the **MERN Stack** (MongoDB, Express, React, Node.js).

Upload your **Resume PDF**, provide your **Self Description**, and paste the **Job Description** to get:
- 📄 An **ATS-Friendly Resume** (downloadable PDF & HTML)
- 📊 A **Match Score** (0–100%) comparing your resume to the target job description
- 🧠 **Technical Interview Questions** with sample answers and explanations
- 💬 **Behavioral Interview Questions** with structured STAR method guidelines
- 🔍 **Skill Gap Analysis** highlighting missing skills and their priority level (High/Medium/Low)
- 📅 A **Personalized Preparation Plan** broken down day-by-day

---

## 🌟 Key Features

1. **Streamlit One-Click App Deployment**: Fast, responsive web UI with glassmorphism styling and session state history.
2. **API Key Integration**: Seamless support for Google Gemini API keys (starting with `AQ.Ab......` or `AIza...`) and Groq AI keys (`gsk_...`).
3. **Resume PDF Text Extraction**: Automatically extracts text content from uploaded PDF resumes using `pypdf` and `pdfplumber`.
4. **AI-Powered Analysis**: Generates an ATS-compliant resume and detailed feedback tailored specifically to your target job.
5. **Interactive Reports & Downloads**: Download newly formatted ATS Resumes directly as PDF files compiled with `xhtml2pdf`.
6. **MERN Stack & Streamlit Ready**: Run locally or deploy directly to Streamlit Community Cloud / Vercel / Render.

---

## 🛠️ Tech Stack

### Streamlit App (Python)
- **Framework**: Streamlit (v1.30+)
- **AI Models**: Google Gemini AI (`google-genai` SDK / `gemini-2.5-flash`) & Groq AI
- **PDF Processing**: `pypdf` & `pdfplumber` (text extraction)
- **PDF Generation**: `xhtml2pdf` & `reportlab` (HTML to PDF compilation)

### MERN Stack (Node.js/React)
- **Frontend**: React.js (Vite), React Router DOM, Context API
- **Backend**: Express.js, MongoDB, Mongoose, JWT & Firebase Auth
- **AI Services**: Grok / Gemini AI Service Integration

---

## 🚀 Quick Start (Streamlit Application)

### 1. Prerequisites
- Python 3.9 or higher

### 2. Installation & Running Locally

1. **Clone the Repository**
   ```bash
   git clone https://github.com/Dhanya562004/Gen-AI-Resume-Analyzer.git
   cd Gen-AI-Resume-Analyzer
   ```

2. **Install Python Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the Streamlit Application**
   ```bash
   streamlit run app.py
   ```

4. **Use the Application**
   - Open your browser at `http://localhost:8501`.
   - In the sidebar, paste your API Key starting with `AQ.Ab......` (or Google Gemini / Groq key).
   - Upload your Resume PDF, provide a brief self description, and paste the job description.
   - Click **🚀 Analyze Profile & Generate Prep Report** to get your ATS Resume PDF, match score, and preparation roadmap!

---

## 📂 Project Structure

```
Gen-AI-Resume-Analyzer/
├── app.py                   # Streamlit main application & UI
├── ai_service.py            # AI Service for Google Gemini (AQ.Ab...) & Groq API
├── pdf_service.py           # PDF text extraction & HTML-to-PDF compilation
├── requirements.txt         # Python dependencies for Streamlit deployment
├── Backend/                 # Node.js Express REST API backend
│   ├── config/              # Database configuration
│   ├── controllers/         # Auth & interview analysis logic
│   ├── middlewares/         # JWT verification & PDF file upload handling
│   ├── models/              # User, Report, & Token blacklist schemas
│   ├── routes/              # Auth & Interview route definitions
│   └── services/            # AI prompt integration
├── Frontend/mern/           # React frontend client
├── README.md
└── package.json
```

---

## 🌐 Deploying on Streamlit Cloud

1. Push this repository to GitHub.
2. Go to [Streamlit Community Cloud](https://share.streamlit.io/).
3. Connect your GitHub account and select repository: `Dhanya562004/Gen-AI-Resume-Analyzer`.
4. Set Main File Path to: `app.py`.
5. Click **Deploy!**

---

## 👤 Author

**Dhanya**
- **GitHub**: [@Dhanya562004](https://github.com/Dhanya562004)
- **Repository**: [Gen-AI-Resume-Analyzer](https://github.com/Dhanya562004/Gen-AI-Resume-Analyzer.git)
