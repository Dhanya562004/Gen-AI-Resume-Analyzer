# 🤖 GenAI Resume Analyzer & Interview Prep System

> **GenAI + MERN Stack** powered intelligent resume analyzer — powered by **Grok AI (xAI)**. Upload your Resume PDF, Self Description, and Job Description to get an ATS-friendly resume, technical interview questions, behavioral questions, skill gap analysis, and a personalized preparation plan.

---

## 📌 What This App Does

1. User registers and logs in securely (Email/Password or **Google via Firebase**)
2. On login — JWT is generated and set as an **httpOnly cookie**
3. User uploads **Resume PDF** + fills **Self Description** + **Job Description**
4. Backend extracts text from PDF (`pdf-parse`), validates input (`Zod`), sends data to **Grok AI**
5. Grok AI analyzes everything and returns:
   - ✅ **ATS-Friendly Resume** (AI-generated HTML → PDF via Puppeteer)
   - 📊 **Match Score** (0–100) — resume vs job description
   - 🧠 **Technical Interview Questions** with intention & model answer
   - 💬 **Behavioral Interview Questions** with intention & model answer
   - 🔍 **Skill Gaps** — skill name + severity (low / medium / high)
   - 📅 **Preparation Plan** — day-wise focus & tasks
6. Report saved in MongoDB, accessible anytime from **All Reports** page

---

## 🗂️ Project Structure

```
root/
├── Backend/
│   ├── config/
│   │   └── db.js                        # MongoDB connection setup
│   ├── controllers/
│   │   ├── authController.js            # Register, Login, Google Auth, Logout logic
│   │   └── interviewController.js       # AI analysis & report generation
│   ├── middlewares/
│   │   ├── auth.middleware.js           # JWT verify + blacklist check
│   │   └── file.middleware.js           # Multer PDF upload config
│   ├── models/
│   │   ├── User.js                      # User schema (name, email, password, googleId)
│   │   ├── blacklist.model.js           # Revoked JWT tokens
│   │   └── interviewReport.model.js     # Saved AI analysis reports
│   ├── routes/
│   │   ├── authRoutes.js                # /api/auth/*
│   │   └── interview.routes.js          # /api/interview/*
│   ├── services/
│   │   └── ai.service.js                # Grok AI API integration & prompt builder
│   ├── app.js                           # Express app, global middleware setup
│   └── server.js                        # Entry point — starts HTTP server
│
├── Frontend/mern/
│   ├── public/
│   │   └── vite.svg
│   ├── src/
│   │   ├── Auth/
│   │   │   ├── components/
│   │   │   │   ├── AuthLoading.jsx      # Loading spinner for auth state
│   │   │   │   └── Protected.jsx        # Protected route wrapper component
│   │   │   ├── hooks/
│   │   │   │   └── useAuth.js           # Custom hook — consumes AuthContext
│   │   │   ├── pages/
│   │   │   │   ├── Login.jsx            # Email/password + Google Sign-In button
│   │   │   │   └── SignUp.jsx           # Email/password + Google Sign-Up button
│   │   │   ├── services/
│   │   │   │   ├── auth.api.js          # Axios calls for auth endpoints
│   │   │   │   ├── auth.context.jsx     # Auth Context Provider (no localStorage)
│   │   │   │   └── firebase.js          # Firebase app init + GoogleAuthProvider config
│   │   │   └── style/
│   │   │       └── auth.css             # Auth pages — Vanilla CSS
│   │   │
│   │   ├── interview/
│   │   │   ├── components/
│   │   │   │   └── Loading.jsx          # Interview loading state component
│   │   │   ├── hooks/
│   │   │   │   └── useInterview.js      # Custom hook — consumes InterviewContext
│   │   │   ├── pages/
│   │   │   │   ├── Home.jsx             # Upload form (PDF + descriptions)
│   │   │   │   ├── Interview.jsx        # AI result display page
│   │   │   │   └── AllReports.jsx       # All saved reports list
│   │   │   ├── services/
│   │   │   │   └── interview.api.js     # Axios calls for interview endpoints
│   │   │   ├── style/                   # Interview pages — Vanilla CSS
│   │   │   └── interview.context.jsx    # Interview Context Provider
│   │   │
│   │   ├── App.jsx                      # Routes definition (React Router)
│   │   ├── main.jsx                     # React DOM render entry
│   │   └── style.scss                   # Global styles
│   │
│   ├── axios.js                         # Global Axios instance (baseURL + withCredentials)
│   ├── index.html
│   ├── vite.config.js
│   ├── eslint.config.js
│   ├── package.json
│   └── .gitignore
│
├── .gitignore
├── package.json
└── README.md
```

---

## ⚙️ Tech Stack

### 🖥️ Frontend

| Technology | Purpose |
|---|---|
| React.js (Vite) | UI Framework |
| React Router DOM | Client-side routing |
| Axios | HTTP requests with `withCredentials` |
| Context API | Global state — Auth + Interview (no localStorage) |
| Firebase Auth | Google OAuth 2.0 — `signInWithPopup` + `GoogleAuthProvider` |
| Vanilla CSS + SCSS | Styling (no Tailwind, no CSS-in-JS) |

### 🖧 Backend

| Technology | Purpose |
|---|---|
| Node.js + Express | Server & REST API |
| MongoDB + Mongoose | Database |
| firebase-admin | Verify Firebase ID tokens server-side |
| Multer | PDF file upload handling (max 3MB) |
| pdf-parse | Extract raw text from uploaded resume PDF |
| Puppeteer | Render AI-generated HTML resume → ATS PDF |
| bcryptjs | Secure password hashing (email/password users) |
| jsonwebtoken | JWT — generated at login, set as httpOnly cookie |
| blacklist.model.js | Secure logout — revoke JWT on logout |
| Zod | Request body & AI response schema validation |
| zod-to-json-schema | Convert Zod schema → JSON Schema for structured AI output |
| Grok AI (xAI) | Generative AI — ATS resume + full analysis engine |

---

## 🔐 Authentication Flow

This app supports **two login methods** — both result in the same httpOnly JWT cookie session.

---

### 1️⃣ Email / Password Auth

```
REGISTER
────────
User submits name, email, password
        │
        ▼
bcryptjs.hash(password, 10) → hashed password saved to MongoDB
        │
        ▼
Registration success → user redirected to Login


LOGIN
─────
User submits email, password
        │
        ▼
User.findOne({ email }) → exists?
        │
        ▼
bcryptjs.compare(plainPassword, hash) → match?
        │
        ▼
jwt.sign({ userId }, JWT_SECRET, { expiresIn })
        │
        ▼
JWT set as httpOnly cookie → sent to client
        │
        ▼
Auth state updated in auth.context.jsx
```

---

### 2️⃣ Google Sign-In (Firebase)

```
User clicks "Sign in with Google"
        │
        ▼
Firebase SDK → signInWithPopup(auth, new GoogleAuthProvider())
        │
        ▼
Google OAuth popup → user selects Google account & consents
        │
        ▼
Firebase returns → user.accessToken  (Firebase ID Token)
        │
        ▼
Frontend sends token → POST /api/auth/google
  { idToken: "Firebase ID token" }
        │
        ▼
Backend → firebase-admin.auth().verifyIdToken(idToken)
  → confirms token is genuine & not expired
        │
        ▼
User.findOrCreate({ email }) in MongoDB
  ├── Existing user → skip creation
  └── New Google user → save { name, email, googleId } (no password field)
        │
        ▼
jwt.sign({ userId }, JWT_SECRET, { expiresIn })
        │
        ▼
JWT set as httpOnly cookie → same session flow as email/password
        │
        ▼
Auth state updated in auth.context.jsx
```

---

### 🔒 Protected Request (Both Auth Methods)

```
Client hits any protected route
        │
        ▼
auth.middleware.js
  ├── Extract JWT from httpOnly cookie
  ├── jwt.verify(token, JWT_SECRET) → valid & not expired?
  ├── blacklist.model.findOne({ token }) → not revoked?
  └── req.user = decoded payload → call next()
```

---

### 🚪 Logout (Both Auth Methods)

```
auth.middleware.js verifies token first
        │
        ▼
Token saved to blacklist.model (MongoDB)
        │
        ▼
Firebase: auth.signOut() called on client (clears Google session)
        │
        ▼
httpOnly cookie cleared on client
        │
        ▼
All future requests with this token → 401 Unauthorized
```

> **Why Blacklist?** JWT is stateless — once issued it stays valid until expiry. Storing revoked tokens in `blacklist.model.js` gives true, server-enforced logout for **both** email and Google auth users.

---

## 🤖 AI Analysis Flow

```
Client (multipart/form-data)
  ├── selfDescription   → string
  ├── jobDescription    → string
  └── resumePDF         → .pdf file (max 3MB)
          │
          ▼
  auth.middleware.js → verify JWT cookie + blacklist check
          │
          ▼
  file.middleware.js (Multer)
  → PDF only, max 3MB → saved to temp disk path
          │
          ▼
  Zod Validator
  → selfDescription & jobDescription validation
          │
          ▼
  pdf-parse
  → extracts raw text content from uploaded PDF
          │
          ▼
  ai.service.js — Prompt Builder
  → merges: resumeText + selfDescription + jobDescription
  → attaches zodToJsonSchema → enforces structured JSON output
          │
          ▼
  Grok AI API (xAI)
  → full contextual analysis → returns structured JSON
          │
          ▼
  Puppeteer
  → launches headless Chromium
  → renders AI-generated atsResumeHTML
  → exports as ATS-friendly resume.pdf
          │
          ▼
  interviewReport.model
  → full report + PDF path saved to MongoDB (linked to userId)
          │
          ▼
  Response sent to client
  → PDF download link + full analysis data
```

---

## 📐 AI Response Schema

The Grok AI response is structurally enforced using `Zod` + `zodToJsonSchema`:

```json
{
  "matchScore": 78,

  "technicalQuestionSchema": [
    {
      "question": "Explain the virtual DOM reconciliation process in React.",
      "intention": "Tests depth of React internals knowledge.",
      "answer": "React compares the new virtual DOM tree with the previous one using a diffing algorithm..."
    }
  ],

  "behaviourQuestionSchema": [
    {
      "question": "Tell me about a time you resolved a critical bug under pressure.",
      "intention": "Assesses problem-solving and composure under stress.",
      "answer": "Use the STAR method: describe the Situation, Task, Action taken, and Result..."
    }
  ],

  "skillGapsSchema": [
    { "skill": "Docker",        "severity": "high"   },
    { "skill": "CI/CD",         "severity": "high"   },
    { "skill": "System Design", "severity": "medium" },
    { "skill": "GraphQL",       "severity": "low"    }
  ],

  "preparationPlanSchema": [
    {
      "day": 1,
      "focus": "Docker & Containerization",
      "tasks": [
        "Complete Docker official getting-started tutorial",
        "Containerize an existing Node.js project"
      ]
    }
  ]
}
```

---

## 📦 NPM Packages

### Backend

```bash
npm install express mongoose dotenv cors cookie-parser
npm install bcryptjs
npm install jsonwebtoken
npm install firebase-admin
npm install multer
npm install pdf-parse
npm install puppeteer
npm install zod zod-to-json-schema
```

### Frontend

```bash
npm install axios
npm install react-router-dom
npm install sass
npm install firebase
```

---

## 🌐 API Endpoints

### Auth — `/api/auth`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/register` | Register new user (email/password) | ❌ |
| POST | `/login` | Login — JWT set as httpOnly cookie | ❌ |
| POST | `/google` | Verify Firebase ID token → issue JWT cookie | ❌ |
| POST | `/logout` | Blacklist token, clear cookie | ✅ |
| GET | `/me` | Get logged-in user info | ✅ |

### Interview — `/api/interview`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/analyze` | Upload PDF + descriptions → AI analysis + ATS PDF | ✅ |
| GET | `/reports` | Get all reports of logged-in user | ✅ |
| GET | `/reports/:id` | Get single report by ID | ✅ |

**POST `/api/auth/google` — Request** (`application/json`):

```json
{
  "idToken": "Firebase ID token returned from signInWithPopup"
}
```

**POST `/analyze` — Request** (`multipart/form-data`):

```
selfDescription   → string  (required)
jobDescription    → string  (required)
resumePDF         → file    (required, .pdf only, max 3MB)
```

**POST `/analyze` — Response** (`application/json`):

```json
{
  "success": true,
  "reportId": "64fa3c...",
  "pdfUrl": "/api/interview/download/64fa3c...",
  "data": {
    "matchScore": 78,
    "technicalQuestionSchema": [...],
    "behaviourQuestionSchema": [...],
    "skillGapsSchema": [{ "skill": "Docker", "severity": "high" }],
    "preparationPlanSchema": [...]
  }
}
```

---

## 🛡️ Middleware Details

### `auth.middleware.js`
```
1. Extract JWT from httpOnly cookie
2. jwt.verify(token, process.env.JWT_SECRET) — valid & not expired?
3. blacklist.model.findOne({ token }) — reject if present
4. req.user = { userId, email } → call next()
```

### `file.middleware.js` (Multer)
```
storage    → diskStorage (saves to temp path for pdf-parse)
fileFilter → accept only mimetype: application/pdf
limits     → fileSize: 3MB max
```

---

## 🔒 Security Summary

| Practice | Implementation |
|---|---|
| Password hashing | `bcryptjs` — salt rounds: 10 |
| Email/password tokens | `jsonwebtoken` — set as httpOnly cookie at login |
| Google auth | Firebase `signInWithPopup` → ID token verified by `firebase-admin` on backend |
| Unified session | Both auth methods issue the same httpOnly JWT cookie |
| Secure logout | `blacklist.model.js` (MongoDB) + Firebase `auth.signOut()` on client |
| Input validation | `Zod` on all request bodies |
| AI output validation | `Zod` schema enforces structured Grok AI response |
| File validation | Multer fileFilter — PDF only, max 3MB |
| No localStorage | Auth state in React Context + httpOnly cookies only |
| Secrets management | All keys in `.env` |

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- Grok AI API Key — [xAI Console](https://console.x.ai/)
- Firebase Project — [Firebase Console](https://console.firebase.google.com/)

### 1. Clone

```bash
git clone https://github.com/Manvendra-2006/GENAI.git
cd GENAI
```

### 2. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/) → Create or select a project
2. **Authentication** → Sign-in method → Enable **Google**
3. **Project Settings → General** → Add a Web App → copy the Firebase config (for frontend `.env`)
4. **Project Settings → Service Accounts** → Generate new private key → download JSON (for backend `.env`)

### 3. Backend Setup

```bash
cd Backend
npm install
```

Create `Backend/.env`:

```env
PORT=5000
MONGO_URI=your_mongodb_url
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d
GROK_API_KEY=your_grok_xai_api_key_here
NODE_ENV=development

# Firebase Admin SDK (from downloaded service account JSON)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

```bash
npm run dev
```

### 4. Frontend Setup

```bash
cd Frontend/mern
npm install
```

Create `Frontend/mern/.env`:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_APP_ID=your_app_id
```

```bash
npm run dev
```

| Service | URL |
|---------|-----|
| App (Full) | http://localhost:3000 |

---

## 🧩 Key Concepts Explained

### Firebase Google Auth + Backend JWT
Firebase handles the Google OAuth popup on the frontend. Once the user signs in, Firebase returns an **ID token**. This token is sent to the backend where `firebase-admin` verifies it — confirming the user is genuinely authenticated by Google. The backend then issues its own **JWT as an httpOnly cookie**, keeping all subsequent requests uniform regardless of whether the user signed in via email or Google.

### JWT + httpOnly Cookie
JWT is generated **only at login** (both methods) and set as an **httpOnly cookie** — inaccessible to JavaScript, protecting against XSS. Never stored in `localStorage` or `sessionStorage`.

### JWT + Blacklist Pattern
JWT is stateless — once issued it remains valid until expiry. Every logged-out token is inserted into `blacklist.model.js` (MongoDB). `auth.middleware.js` checks this on every protected request, making logout truly server-enforced for both email and Google users.

### No localStorage — Context API Only
Auth state lives in `auth.context.jsx` (React Context). No sensitive data ever touches browser storage APIs. State rehydrates on page load via a `/me` endpoint call secured by the httpOnly cookie.

### Zod + zodToJsonSchema
Zod validates incoming request bodies on the backend. The same schema is converted to **JSON Schema** via `zod-to-json-schema` and passed to Grok AI — forcing it to always return exactly the defined structure. No hallucinated keys, no missing fields.

### Puppeteer — HTML to ATS PDF
Grok AI generates an ATS-optimized resume as an **HTML string**. Puppeteer launches a headless Chromium browser, renders it, and exports a clean **PDF** formatted to pass ATS parsers and human reviewers.


## 👨‍💻 Author

**Manvendra** — [github.com/Manvendra-2006](https://github.com/Manvendra-2006)

> *Empowering job seekers with AI-driven interview preparation and ATS-optimized resumes*
