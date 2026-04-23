# ExamAI — AI-Powered Exam Preparation App

A full-stack web application that uses Google Gemini AI to help aspirants prepare for UPSC, APPSC, TSPSC, and all state PSC exams.

## Features

- **Previous Year Question Extraction** — Upload PDFs, AI extracts and categorizes all questions
- **AI Answer Evaluation** — Write answers, get scored feedback like a strict mentor (0-10)
- **Topper Answer Analysis** — Upload topper sheets, AI analyzes writing patterns
- **Daily Question System** — AI picks one question daily based on your weak areas
- **Pattern Analytics** — Charts showing topic frequency, subject weightage, score trends
- **Study Planner** — AI generates day-wise plan based on exam date and syllabus
- **Syllabus Tracker** — Upload syllabus PDF, track topic coverage visually
- **Multi-Exam Support** — UPSC, APPSC, TSPSC, BPSC, MPPSC, UPPSC, TNPSC — any state PSC
- **Streak Tracker** — Daily study streak with motivational reinforcement

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Tailwind CSS, Recharts, React Router |
| Backend | Node.js, Express.js |
| Database | MongoDB (Mongoose) |
| AI | Google Gemini 1.5 Pro (`@google/generative-ai`) |
| Auth | JWT (JSON Web Tokens) |
| PDF | Multer (upload) + pdf-parse (extraction) |

## Setup Instructions

### 1. Clone and install dependencies

```bash
git clone <repo-url>
cd upsc_app
cd server && npm install
cd ../client && npm install
```

### 2. Get a free Gemini API key

1. Go to [aistudio.google.com](https://aistudio.google.com)
2. Sign in with your Google account
3. Click "Get API key" → "Create API key"
4. Copy the key

### 3. Set up MongoDB Atlas (free)

1. Go to [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create a free account
3. Create a free M0 cluster
4. Click "Connect" → "Connect your application"
5. Copy the connection string (replace `<password>` with your DB password)

### 4. Configure environment variables

Copy the example file and fill in your keys:

```bash
cp server/.env.example server/.env
```

Edit `server/.env`:

```
GEMINI_API_KEY=your_gemini_api_key_here
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/upsc_app
JWT_SECRET=make_this_a_long_random_string
PORT=5000
CLIENT_URL=http://localhost:3000
```

### 5. Run the app

**Terminal 1 — Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd client
npm start
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
upsc_app/
├── server/
│   ├── models/          # Mongoose schemas
│   ├── routes/          # Express API routes
│   ├── controllers/     # Business logic
│   ├── services/        # Gemini AI + PDF services
│   ├── middleware/       # JWT auth middleware
│   └── index.js         # Server entry point
├── client/
│   └── src/
│       ├── pages/       # All page components
│       ├── components/  # Shared UI components
│       ├── context/     # React context (Auth)
│       └── utils/       # Axios API client
└── uploads/             # Uploaded PDF storage
```

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/profile` | Get profile |
| POST | `/api/documents/upload` | Upload PDF |
| GET | `/api/questions` | List questions with filters |
| GET | `/api/questions/daily` | Get today's question |
| POST | `/api/answers` | Submit answer for evaluation |
| GET | `/api/answers/stats` | Answer statistics |
| POST | `/api/study-plans/generate` | Generate AI study plan |
| GET | `/api/exams` | List exam profiles |

## Environment Variables

| Variable | Description |
|----------|-------------|
| `GEMINI_API_KEY` | Google Gemini API key (free from aistudio.google.com) |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret for JWT token signing |
| `PORT` | Server port (default: 5000) |
| `CLIENT_URL` | Frontend URL for CORS |
