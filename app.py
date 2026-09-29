import io
import json
import os
import streamlit as st
from ai_service import (
    generate_interview_report,
    generate_resume_html,
    generate_smart_fallback_report,
    generate_smart_fallback_resume_html,
)
from pdf_service import extract_text_from_pdf, generate_pdf_from_html

# Page Configuration
st.set_page_config(
    page_title="GenAI Resume Analyzer & Interview Prep",
    page_icon="📄",
    layout="wide",
    initial_sidebar_state="expanded",
)

# Custom CSS for Premium Design & Aesthetic
st.markdown(
    """
<style>
    /* Main Background & Gradient Accents */
    .stApp {
        background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%);
        color: #f8fafc;
    }
    
    /* Header Styling */
    .main-title {
        font-family: 'Inter', system-ui, -apple-system, sans-serif;
        font-weight: 800;
        background: linear-gradient(90deg, #38bdf8, #818cf8, #c084fc);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        font-size: 2.5rem;
        margin-bottom: 0.2rem;
    }
    
    .sub-title {
        color: #94a3b8;
        font-size: 1.1rem;
        margin-bottom: 1.5rem;
    }
    
    /* Card Container */
    .custom-card {
        background: rgba(30, 41, 59, 0.7);
        backdrop-filter: blur(12px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 16px;
        padding: 24px;
        margin-bottom: 20px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
    }
    
    /* Match Score Metric Card */
    .score-badge {
        font-size: 3.5rem;
        font-weight: 900;
        text-align: center;
        margin: 10px 0;
    }
    
    .score-high { color: #4ade80; text-shadow: 0 0 20px rgba(74, 222, 128, 0.4); }
    .score-med { color: #facc15; text-shadow: 0 0 20px rgba(250, 204, 21, 0.4); }
    .score-low { color: #f87171; text-shadow: 0 0 20px rgba(248, 113, 113, 0.4); }
    
    /* Severity Badges */
    .badge-high {
        background-color: rgba(239, 68, 68, 0.2);
        color: #fca5a5;
        border: 1px solid #ef4444;
        padding: 4px 10px;
        border-radius: 20px;
        font-size: 0.85rem;
        font-weight: 600;
    }
    .badge-medium {
        background-color: rgba(245, 158, 11, 0.2);
        color: #fde047;
        border: 1px solid #f59e0b;
        padding: 4px 10px;
        border-radius: 20px;
        font-size: 0.85rem;
        font-weight: 600;
    }
    .badge-low {
        background-color: rgba(34, 197, 94, 0.2);
        color: #86efac;
        border: 1px solid #22c55e;
        padding: 4px 10px;
        border-radius: 20px;
        font-size: 0.85rem;
        font-weight: 600;
    }
    
    /* Buttons */
    .stButton>button {
        background: linear-gradient(90deg, #4f46e5, #7c3aed);
        color: white;
        border: none;
        border-radius: 10px;
        font-weight: 600;
        padding: 12px 24px;
        transition: all 0.3s ease;
    }
    .stButton>button:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 20px rgba(124, 58, 237, 0.4);
    }
    
    /* Sidebar Styling */
    section[data-testid="stSidebar"] {
        background-color: #0f172a;
        border-right: 1px solid rgba(255, 255, 255, 0.1);
    }
</style>
""",
    unsafe_allow_html=True,
)

# Initialize Session State
if "history" not in st.session_state:
    st.session_state.history = []
if "current_report" not in st.session_state:
    st.session_state.current_report = None
if "current_resume_html" not in st.session_state:
    st.session_state.current_resume_html = None
if "current_pdf_bytes" not in st.session_state:
    st.session_state.current_pdf_bytes = None

# Sidebar Configuration
with st.sidebar:
    st.image("https://img.icons8.com/color/96/000000/resume.png", width=64)
    st.markdown("### ⚙️ Application Settings")

    # Check for API key in Environment variables or Streamlit secrets
    secret_key = (
        os.getenv("GEMINI_API_KEY", "").strip()
        or os.getenv("GROQ_API_KEY", "").strip()
        or os.getenv("XAI_API_KEY", "").strip()
    )
    if not secret_key:
        try:
            if "GEMINI_API_KEY" in st.secrets:
                secret_key = st.secrets["GEMINI_API_KEY"]
            elif "GROQ_API_KEY" in st.secrets:
                secret_key = st.secrets["GROQ_API_KEY"]
            elif "XAI_API_KEY" in st.secrets:
                secret_key = st.secrets["XAI_API_KEY"]
        except Exception:
            pass

    api_key_input = st.text_input(
        "🔑 Enter API Key",
        value=secret_key,
        type="password",
        placeholder="AQ.Ab...... or AIza... / gsk_...",
        help="Paste your Google Gemini API Key (starts with AQ.Ab... or AIza...) or Groq API key (starts with gsk_).",
    )

    model_choice = st.selectbox(
        "🤖 Select Model",
        options=["gemini-3.8-flash", "gemini-2.0-flash-exp", "gemini-2.5-flash", "gemini-1.5-flash"],
        index=0,
    )

    st.markdown("---")
    st.markdown("### 📜 Session History")
    if st.session_state.history:
        for idx, item in enumerate(st.session_state.history):
            if st.button(f"Report #{idx+1}: {item.get('job_title', 'Analysis')}", key=f"hist_{idx}"):
                st.session_state.current_report = item.get("report")
                st.session_state.current_resume_html = item.get("resume_html")
                st.session_state.current_pdf_bytes = item.get("pdf_bytes")
    else:
        st.info("No saved analysis reports in this session yet.")

    st.markdown("---")
    st.markdown("💡 **Author & Support**")
    st.caption("Built with Streamlit & Google Gemini / Groq AI")
    st.caption("[GitHub Repository](https://github.com/Dhanya562004/Gen-AI-Resume-Analyzer)")

# Main Header
st.markdown('<div class="main-title">GenAI Resume Analyzer & Interview Prep</div>', unsafe_allow_html=True)
st.markdown(
    '<div class="sub-title">Upload your resume PDF, paste the job description, and get instant ATS resume generation, match score, skill gap analysis, and tailored interview questions.</div>',
    unsafe_allow_html=True,
)

# Tabs
tab_input, tab_score, tab_resume, tab_tech, tab_behav, tab_gaps, tab_plan = st.tabs(
    [
        "📥 Upload & Input",
        "📊 Match Score",
        "📄 ATS Resume PDF",
        "🧠 Technical Questions",
        "💬 Behavioral Questions",
        "🔍 Skill Gap Analysis",
        "📅 Preparation Plan",
    ]
)

# TAB 1: INPUT & ANALYSIS TRIGGER
with tab_input:
    col1, col2 = st.columns([1, 1])

    with col1:
        st.markdown("### 📄 Step 1: Upload Resume")
        uploaded_file = st.file_uploader(
            "Upload your PDF Resume", type=["pdf"], help="Supports single or multi-page PDF resumes."
        )

        extracted_text = ""
        if uploaded_file is not None:
            with st.spinner("Extracting text from PDF..."):
                extracted_text = extract_text_from_pdf(uploaded_file)
            if extracted_text:
                st.success(f"Successfully extracted {len(extracted_text)} characters from PDF!")
                with st.expander("🔍 Preview Extracted Resume Text"):
                    st.text_area("Extracted Text", extracted_text, height=180, disabled=True)
            else:
                st.error("Could not extract text from PDF. Please ensure it is not an image-only scan.")

        st.markdown("### 👤 Step 2: Self Description")
        self_description_input = st.text_area(
            "Provide a brief self description",
            height=120,
            placeholder="e.g. Full Stack Engineer with 2+ years of experience in React, Node.js, Express, MongoDB, REST APIs, Docker, and AWS.",
        )

    with col2:
        st.markdown("### 🎯 Step 3: Target Job Description")
        job_description_input = st.text_area(
            "Paste Target Job Description",
            height=320,
            placeholder="e.g. Looking for a Senior Full Stack Developer proficient in React, Node.js, MongoDB, TypeScript, Microservices, and CI/CD pipelines...",
        )

    st.markdown("---")
    analyze_btn = st.button("🚀 Analyze Profile & Generate Prep Report", use_container_width=True)

    if analyze_btn:
        # Validations
        if not extracted_text.strip():
            st.error("⚠️ Please upload a valid PDF resume first.")
        elif not job_description_input.strip():
            st.error("⚠️ Please paste the target Job Description.")
        else:
            try:
                progress_bar = st.progress(10)
                status_text = st.empty()

                status_text.text("🧠 Analyzing profile alignment & generating interview report...")
                progress_bar.progress(35)

                report = None
                try:
                    report = generate_interview_report(
                        api_key=api_key_input,
                        resume_text=extracted_text,
                        self_description=self_description_input,
                        job_description=job_description_input,
                        model_name=model_choice,
                    )
                except Exception as ex_rep:
                    print(f"Notice: Remote report API call failed ({ex_rep}). Using Smart Fallback Engine.")

                if not report or not isinstance(report, dict):
                    report = generate_smart_fallback_report(extracted_text, self_description_input, job_description_input)

                status_text.text("🎨 Crafting ATS-friendly HTML & PDF resume...")
                progress_bar.progress(70)

                resume_html = None
                try:
                    resume_html = generate_resume_html(
                        api_key=api_key_input,
                        resume_text=extracted_text,
                        self_description=self_description_input,
                        job_description=job_description_input,
                        model_name=model_choice,
                    )
                except Exception as ex_html:
                    print(f"Notice: Remote HTML API call failed ({ex_html}). Using Smart Resume Engine.")

                if not resume_html or not isinstance(resume_html, str):
                    resume_html = generate_smart_fallback_resume_html(extracted_text, self_description_input, job_description_input)

                pdf_bytes = generate_pdf_from_html(resume_html)

                progress_bar.progress(100)
                status_text.text("✅ Analysis complete!")

                # Save to session state
                st.session_state.current_report = report
                st.session_state.current_resume_html = resume_html
                st.session_state.current_pdf_bytes = pdf_bytes

                # Add to history
                job_title_short = (
                    job_description_input.split("\n")[0][:30] if job_description_input else "Report"
                )
                st.session_state.history.append(
                    {
                        "job_title": job_title_short,
                        "report": report,
                        "resume_html": resume_html,
                        "pdf_bytes": pdf_bytes,
                    }
                )

                st.balloons()
                st.success("🎉 Report and ATS Resume successfully generated! Switch tabs above to view details.")

            except Exception as e:
                # Emergency failsafe fallback
                report = generate_smart_fallback_report(extracted_text, self_description_input, job_description_input)
                resume_html = generate_smart_fallback_resume_html(extracted_text, self_description_input, job_description_input)
                pdf_bytes = generate_pdf_from_html(resume_html)

                st.session_state.current_report = report
                st.session_state.current_resume_html = resume_html
                st.session_state.current_pdf_bytes = pdf_bytes

                st.success("🎉 Report and ATS Resume generated! Switch tabs above to view details.")


# Helper to check if report is available
report = st.session_state.current_report
resume_html = st.session_state.current_resume_html
pdf_bytes = st.session_state.current_pdf_bytes


# TAB 2: MATCH SCORE
with tab_score:
    if not report:
        st.info("👈 Upload your resume and click 'Analyze Profile' to see your Match Score.")
    else:
        score = report.get("matchScore", 0)
        summary = report.get("summary", "Analysis completed based on job description alignment.")

        st.markdown('<div class="custom-card">', unsafe_allow_html=True)
        st.markdown("<h2 style='text-align: center;'>📊 Overall Candidate Match Score</h2>", unsafe_allow_html=True)

        if score >= 80:
            score_class = "score-high"
            badge = "🟢 Excellent Alignment (High Fit)"
        elif score >= 50:
            score_class = "score-med"
            badge = "🟡 Moderate Alignment (Medium Fit)"
        else:
            score_class = "score-low"
            badge = "🔴 Gap Identified (Requires Focused Prep)"

        st.markdown(f'<div class="score-badge {score_class}">{score}%</div>', unsafe_allow_html=True)
        st.markdown(f"<h4 style='text-align: center;'>{badge}</h4>", unsafe_allow_html=True)
        st.progress(score / 100)
        st.markdown("</div>", unsafe_allow_html=True)

        st.markdown('<div class="custom-card">', unsafe_allow_html=True)
        st.markdown("### 📝 Executive Fit Summary")
        st.write(summary)
        st.markdown("</div>", unsafe_allow_html=True)


# TAB 3: ATS RESUME & PDF DOWNLOAD
with tab_resume:
    if not resume_html or not pdf_bytes:
        st.info("👈 Generate your report to preview & download your ATS-Friendly Resume PDF.")
    else:
        st.markdown("### 📄 Your ATS-Optimized Resume")

        col_dl1, col_dl2 = st.columns([1, 1])
        with col_dl1:
            st.download_button(
                label="📥 Download ATS Resume (PDF)",
                data=pdf_bytes,
                file_name="ATS_Optimized_Resume.pdf",
                mime="application/pdf",
                use_container_width=True,
            )
        with col_dl2:
            st.download_button(
                label="🌐 Download Resume HTML",
                data=resume_html,
                file_name="ATS_Optimized_Resume.html",
                mime="text/html",
                use_container_width=True,
            )

        st.markdown("---")
        st.markdown("#### Live Resume Preview")
        st.components.v1.html(resume_html, height=750, scrolling=True)


# TAB 4: TECHNICAL QUESTIONS
with tab_tech:
    if not report:
        st.info("👈 Generate your report to view Tailored Technical Interview Questions.")
    else:
        tech_q = report.get("technicalQuestionSchema", [])
        st.markdown(f"### 🧠 Technical Interview Questions ({len(tech_q)} questions)")
        st.caption("Customized according to your candidate match score and target role requirements.")

        for idx, item in enumerate(tech_q):
            with st.expander(f"Q{idx+1}: {item.get('question')}", expanded=(idx == 0)):
                st.markdown(f"**🎯 Interviewer Intention:** {item.get('intention')}")
                st.markdown("---")
                st.markdown(f"**💡 Sample Answer & Key Concepts:**\n\n{item.get('answer')}")


# TAB 5: BEHAVIORAL QUESTIONS
with tab_behav:
    if not report:
        st.info("👈 Generate your report to view Tailored Behavioral Questions.")
    else:
        beh_q = report.get("behaviourQuestionSchema", [])
        st.markdown(f"### 💬 Behavioral Interview Questions ({len(beh_q)} questions)")

        for idx, item in enumerate(beh_q):
            with st.expander(f"Q{idx+1}: {item.get('question')}", expanded=(idx == 0)):
                st.markdown(f"**🎯 Evaluated Trait & Intention:** {item.get('intention')}")
                st.markdown("---")
                st.markdown(f"**⭐ STAR Method Guidelines & Response:**\n\n{item.get('answer')}")


# TAB 6: SKILL GAP ANALYSIS
with tab_gaps:
    if not report:
        st.info("👈 Generate your report to view your Skill Gap Analysis.")
    else:
        skill_gaps = report.get("skillGapsSchema", [])
        st.markdown(f"### 🔍 Identified Skill Gaps ({len(skill_gaps)} items)")

        for item in skill_gaps:
            skill_name = item.get("skill", "Unknown Skill")
            severity = str(item.get("severity", "medium")).lower()
            recommendation = item.get("recommendation", "Review key documentation and build a hands-on mini project.")

            if severity == "high":
                badge_html = '<span class="badge-high">High Priority</span>'
            elif severity == "low":
                badge_html = '<span class="badge-low">Low Priority</span>'
            else:
                badge_html = '<span class="badge-medium">Medium Priority</span>'

            st.markdown(
                f"""
            <div class="custom-card">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <h3 style="margin: 0; color: #f8fafc;">⚡ {skill_name}</h3>
                    {badge_html}
                </div>
                <p style="margin-top: 12px; color: #cbd5e1;"><strong>Recommendation:</strong> {recommendation}</p>
            </div>
            """,
                unsafe_allow_html=True,
            )


# TAB 7: PREPARATION PLAN
with tab_plan:
    if not report:
        st.info("👈 Generate your report to view your Personalized Day-by-Day Preparation Plan.")
    else:
        prep_plan = report.get("preparationPlanSchema", [])
        st.markdown(f"### 📅 Personalized {len(prep_plan)}-Day Preparation Plan")

        for item in prep_plan:
            day_num = item.get("day", 1)
            focus = item.get("focus", "Review fundamentals")
            tasks = item.get("tasks", [])

            with st.expander(f"📌 Day {day_num}: {focus}", expanded=True):
                st.markdown("**Actionable Plan & Tasks:**")
                for task in tasks:
                    st.checkbox(f"{task}", key=f"day_{day_num}_task_{task[:15]}")
