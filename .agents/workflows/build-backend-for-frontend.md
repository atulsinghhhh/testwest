---
description: Build Node.js + Express + MongoDB backend endpoints and models for each TestWest frontend component
---

# TestWest — Backend-for-Frontend Workflow (Node.js & MongoDB)

This workflow guides you through writing **every Express endpoint and Mongoose model** required to replace the frontend's mock data layer (`src/lib/mock/*`) with real API calls.

Reference: `docs/TESTWEST_FRONTEND_MASTER_PLAN.md` and `src/types/index.ts` are the source of truth.

---

## Prerequisites

Before starting, confirm:
- Node.js 18+ is installed.
- A MongoDB instance is ready (local or MongoDB Atlas).
- The backend will live in a new directory named `backend/` inside the project root.

---

## Step 1 — Initialize Backend Project

Open a terminal and set up the Express application:

// turbo
```bash
mkdir backend
cd backend
npm init -y
npm install express mongoose dotenv cors jsonwebtoken bcryptjs
npm install -D nodemon typescript ts-node @types/express @types/node @types/cors @types/jsonwebtoken @types/bcryptjs
npx tsc --init
```

Create the standard Express folder structure:
```bash
mkdir src src/config src/controllers src/middleware src/models src/routes src/utils
```

Update `backend/tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "es2022",
    "module": "commonjs",
    "rootDir": "./src",
    "outDir": "./dist",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true
  }
}
```

---

## Step 2 — Auth Models & Endpoints (`accounts`)

**Frontend consumers:** Login page (Phase 4), JWT refresh interceptor in `src/lib/api/apiClient`.

### 2a. Mongoose Models (`src/models/User.ts`)

```typescript
import mongoose, { Schema, Document, Types } from 'mongoose';

const Role = ["STUDENT", "PARENT", "TEACHER", "SCHOOL", "ADMIN", "SOLO"];

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  role: string;
  firstName: string;
  lastName: string;
}

const userSchema = new Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, required: true, enum: Role },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true }
}, { timestamps: true });

export const User = mongoose.model<IUser>('User', userSchema);

const studentProfileSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  grade: { type: Number, required: true },       // 1-12
  board: { type: String, required: true },       // CBSE, ICSE, State, IB
  avatarUrl: { type: String, default: "" }
});

export const StudentProfile = mongoose.model('StudentProfile', studentProfileSchema);

const parentProfileSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  children: [{ type: Schema.Types.ObjectId, ref: 'StudentProfile' }]
});

export const ParentProfile = mongoose.model('ParentProfile', parentProfileSchema);
```

### 2b. Endpoints (`src/routes/authRoutes.ts`)

| Method | URL | Controller Task | Frontend Hook |
|--------|-----|-----------------|---------------|
| `POST` | `/api/auth/register` | Hash password, create User + Profile | Signup page |
| `POST` | `/api/auth/login` | Validate password, issue `access` & `refresh` JWTs (send refresh as HTTP-only cookie) | Login page |
| `POST` | `/api/auth/refresh` | Verify refresh token, issue new access token | `apiClient` interceptor |
| `GET`  | `/api/auth/me` | Return decoded user profile data | `useAuth` hook |

---

## Step 3 — Curriculum Models & Endpoints (`curriculum`)

**Frontend consumers:** Test creation wizard (`src/routes/test.new.tsx`).

### 3a. Mongoose Models (`src/models/Curriculum.ts`)

Instead of tightly relational tables, Mongoose allows embedding or flexible referencing.

```typescript
import mongoose, { Schema } from 'mongoose';

const questionSchema = new Schema({
  board: { type: String, required: true },
  grade: { type: Number, required: true },
  subject: { type: String, required: true },
  chapter: { type: String, required: true },
  topic: { type: String, required: true },
  subtopic: { type: String, required: true },
  
  type: { type: String, enum: ["MCQ", "MSQ", "Fill in the blanks", "Short answer"], required: true },
  difficulty: { type: String, enum: ["Easy", "Medium", "Hard"], required: true },
  
  body: { type: String, required: true },
  options: { type: Schema.Types.Mixed, default: [] }, // Array of { id, text }
  answer: { type: Schema.Types.Mixed, required: true }, // String or Array configuration
  explanation: { type: String, default: "" }
}, { timestamps: true });

export const Question = mongoose.model('Question', questionSchema);
```

### 3b. Endpoints (`src/routes/curriculumRoutes.ts`)

Query the database dynamically to get distinct values (for drill-down menus):

| Method | URL | Mongoose Query | Frontend step |
|--------|-----|----------------|---------------|
| `GET` | `/api/curriculum/boards` | `Question.distinct('board')` | Step 1 |
| `GET` | `/api/curriculum/subjects` | `Question.distinct('subject', { grade, board })` | Step 3 |
| `GET` | `/api/curriculum/chapters` | `Question.distinct('chapter', { subject, grade, board })` | Step 4 |
| `GET` | `/api/curriculum/topics` | `Question.distinct('topic', { chapter })` | Step 5 |
| `GET` | `/api/curriculum/subtopics`| `Question.distinct('subtopic', { topic })` | Step 6 |
| `GET` | `/api/curriculum/questions/count` | `Question.countDocuments({ subtopic, type, difficulty })` | Review step |

---

## Step 4 — Tests Models & Endpoints (`tests`)

**Frontend consumers:** `test.new.tsx` (create), `test.$testId.take.tsx` (take), `test.$testId.results.tsx` (results), `tests.tsx` (list).

### 4a. Mongoose Models (`src/models/Test.ts`)

In NoSQL, it's highly efficient to embed test questions and responses together within the `Test` document.

```typescript
import mongoose, { Schema } from 'mongoose';

const testQuestionSchema = new Schema({
  originalQuestionId: { type: Schema.Types.ObjectId, ref: 'Question' },
  body: String,
  options: Schema.Types.Mixed,
  answer: Schema.Types.Mixed,
  explanation: String,
  
  // Embedded response data
  givenAnswer: { type: Schema.Types.Mixed, default: null },
  isCorrect: { type: Boolean, default: null },
  timeSpentSeconds: { type: Number, default: 0 },
  flagged: { type: Boolean, default: false }
});

const testSchema = new Schema({
  student: { type: Schema.Types.ObjectId, ref: 'StudentProfile', required: true },
  subject: String,
  chapter: String,
  topic: String,
  subtopic: String,
  difficulty: String,
  status: { type: String, enum: ["Pending", "In progress", "Completed", "Abandoned"], default: "Pending" },
  
  questions: [testQuestionSchema], // Embedded questions + answers
  
  score: { type: Number, default: null },
  accuracy: { type: Number, default: null },
  durationSeconds: { type: Number, default: null },
  submittedAt: { type: Date, default: null }
}, { timestamps: true });

export const Test = mongoose.model('Test', testSchema);
```

### 4b. Endpoints (`src/routes/testRoutes.ts`)

| Method | URL | Description |
|--------|-----|-------------|
| `POST` | `/api/tests` | Aggregation: `$match` options, `$sample` size `N`. Embed them into newly created `Test`. |
| `GET`  | `/api/tests` | Find tests by student ID (list view). |
| `GET`  | `/api/tests/:id` | Get test info (exclude answers for "In progress" tests). |
| `PATCH`| `/api/tests/:id/responses/:qid` | Use `$set` on `questions.$.givenAnswer`. |
| `POST` | `/api/tests/:id/submit` | Grade each response, compute score/accuracy, `status="Completed"`, stamp `submittedAt`. |
| `GET`  | `/api/tests/:id/results` | Returns full completed test with explanations. |

---

## Step 5 — Analytics Endpoints (`analytics`)

**Frontend consumers:** `dashboard.student.tsx`, `dashboard.parent.tsx`.

These endpoints map precisely to your `src/types/index.ts` structures. Use MongoDB Aggregation pipelines (`$group`, `$match`, `$project`) to compute the nested arrays.

| Method | URL | Description |
|--------|-----|-------------|
| `GET` | `/api/students/me/dashboard` | All student dashboard data in one payload. |
| `GET` | `/api/parents/me/children` | List linked children. |
| `GET` | `/api/parents/me/children/:childId/dashboard` | Full parent dashboard for one child. |

### Analytics Computation Notes
- **Stats:** `$match` tests where `status: "Completed"`, then `$group` to calculate averages (`$avg: "$score"`, `$avg: "$accuracy"`).
- **Subject Performance:** `$group` by `$subject` within the student's completed tests.
- **Weak Topics:** `$unwind` questions, `$group` by `topic`, filter to `avgAccuracy < 60`, `$limit: 6`.
- **Score Trend:** Sort completed tests by date descending, limit 10, project score and accuracy.

---

## Step 6 — Connect & Run

Inside `backend/src/index.ts` (Entry point):
```typescript
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
// ... other imports

dotenv.config();

const app = express();
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());

app.use('/api/auth', authRoutes);
// ... attach other routers

mongoose.connect(process.env.MONGO_URI as string)
  .then(() => {
    console.log('MongoDB Connected');
    app.listen(8000, () => console.log('Server running on port 8000'));
  })
  .catch(err => console.error(err));
```

Run dev server:
// turbo
```bash
npx nodemon src/index.ts
```

---

## Step 7 — Wire Frontend to API

Replace mock imports in each frontend component:

1. **Create `src/lib/api/apiClient.ts`** — `fetch` or `axios` wrapper handling the auth header and token refresh logic.
2. **Create `src/lib/auth/AuthProvider.tsx`** — React Context holding `user`, `login()`, `logout()`.
3. **React Query hooks** in `src/lib/api/hooks/` for every mapped endpoint.
4. Replace imports like `import { mockStudentDashboard } from "@/lib/mock/performance";` with `const { data, isLoading } = useStudentDashboard();`.

---

## Endpoint Summary Cheatsheet

| # | Method | URL | Frontend Screen |
|---|--------|-----|-----------------|
| 1 | POST | `/api/auth/register` | Signup |
| 2 | POST | `/api/auth/login` | Login |
| 3 | POST | `/api/auth/refresh` | apiClient |
| 4 | GET  | `/api/auth/me` | AppShell / useAuth |
| 5 | GET  | `/api/curriculum/boards` | Test wizard step 1 |
| 6 | GET  | `/api/curriculum/subjects` | Test wizard step 3 |
| 7 | GET  | `/api/curriculum/chapters` | Test wizard step 4 |
| 8 | GET  | `/api/curriculum/topics` | Test wizard step 5 |
| 9 | GET  | `/api/curriculum/subtopics` | Test wizard step 6 |
| 10 | GET | `/api/curriculum/questions/count` | Test wizard review |
| 11 | POST | `/api/tests` | Test wizard submit |
| 12 | GET  | `/api/tests` | Tests list page |
| 13 | GET  | `/api/tests/:id` | Test take page |
| 14 | PATCH | `/api/tests/:id/responses/:qid` | Autosave answer + Flag |
| 15 | POST | `/api/tests/:id/submit` | Submit test |
| 16 | GET  | `/api/tests/:id/results` | Results page |
| 17 | GET  | `/api/students/me/dashboard` | Student dashboard |
| 18 | GET  | `/api/parents/me/children` | ChildSwitcher |
| 19 | GET  | `/api/parents/me/children/:id/dashboard` | Parent dashboard |
