# 🤖 GenAI Resume Analyzer & Interview Prep

An intelligent web application built with the **MERN Stack** (MongoDB, Express, React, Node.js) and **Grok AI**.

Upload your **Resume PDF**, provide your **Self Description**, and paste the **Job Description** to get:
- 📄 An **ATS-Friendly Resume** (downloadable PDF)
- 📊 A **Match Score** (0–100%) comparing your resume to the job description
- 🧠 **Technical Interview Questions** with sample answers and explanations
- 💬 **Behavioral Interview Questions** with structured answer guidelines
- 🔍 **Skill Gap Analysis** highlighting missing skills and their priority level
- 📅 A **Personalized Preparation Plan** broken down day-by-day

---

## 🌟 Key Features

1. **Secure User Authentication**: Sign up and log in using Email/Password or **Google Sign-In** (Firebase).
2. **Resume PDF Text Extraction**: Automatically extracts text content from uploaded PDF resumes.
3. **AI-Powered Analysis**: Generates an ATS-compliant resume and detailed feedback tailored specifically to your target job.
4. **Interactive Reports**: View detailed interview preparation materials and download your newly formatted resume.
5. **Saved History**: All generated analysis reports are saved to your account so you can revisit them anytime.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React.js (Vite)
- **Routing**: React Router DOM
- **State Management**: Context API (Auth & Interview contexts)
- **Styling**: Vanilla CSS & SCSS

### Backend
- **Server**: Node.js & Express.js
- **Database**: MongoDB & Mongoose
- **Authentication**: JWT (httpOnly cookie) & Firebase Admin SDK
- **File Processing**: Multer (upload handling) & `pdf-parse` (PDF text extraction)
- **PDF Generation**: Puppeteer (Converts AI HTML to ATS PDF)
- **AI Engine**: Grok AI (xAI API) & Zod (Response schema validation)

---

## 📂 Project Structure

```
Gen-AI-Resume-Analyzer/
├── Backend/                 # Backend REST API
│   ├── config/              # Database configuration
│   ├── controllers/         # Auth & interview analysis logic
│   ├── middlewares/         # JWT verification & PDF file upload handling
│   ├── models/              # User, Report, & Token blacklist schemas
│   ├── routes/              # Auth & Interview route definitions
│   └── services/            # Grok AI prompt integration & email service
│
├── Frontend/mern/           # React frontend client
│   ├── src/
│   │   ├── Auth/            # Login, Signup, Firebase Google Auth, & Auth Context
│   │   └── interview/       # Dashboard, Resume Upload, Reports & Results
│   └── package.json
│
├── .gitignore
├── package.json
└── README.md
```

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18 or higher)
- MongoDB (Local instance or MongoDB Atlas)
- Grok AI API Key ([xAI Console](https://console.x.ai/))
- Firebase Project ([Firebase Console](https://console.firebase.google.com/))

---

### 2. Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/Dhanya562004/Gen-AI-Resume-Analyzer.git
   cd Gen-AI-Resume-Analyzer
   ```

2. **Setup Backend**
   ```bash
   cd Backend
   npm install
   ```

   Create a `.env` file in the `Backend/` directory:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_secret_jwt_key
   JWT_EXPIRES_IN=7d
   GROK_API_KEY=your_grok_ai_api_key

   FIREBASE_PROJECT_ID=your_firebase_project_id
   FIREBASE_CLIENT_EMAIL=your_firebase_client_email
   FIREBASE_PRIVATE_KEY="your_firebase_private_key"
   ```

   Run the backend server:
   ```bash
   npm run dev
   ```

3. **Setup Frontend**
   ```bash
   cd ../Frontend/mern
   npm install
   ```

   Create a `.env` file in `Frontend/mern/`:
   ```env
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
   VITE_FIREBASE_APP_ID=your_firebase_app_id
   ```

   Run the frontend application:
   ```bash
   npm run dev
   ```

---

## 👤 Author

**Dhanya**
- **GitHub**: [@Dhanya562004](https://github.com/Dhanya562004)
- **Repository**: [Gen-AI-Resume-Analyzer](https://github.com/Dhanya562004/Gen-AI-Resume-Analyzer.git)
