# TestWest — Frontend Master Plan

> Internal blueprint. Treat this as the source of truth for all frontend work.
> Future prompts can say: **"Continue from `TESTWEST_FRONTEND_MASTER_PLAN.md` and build the next phase."**

---

## 1. Product Summary

**TestWest** is a K-12 (Grade 1–12) assessment platform. Students generate and take tests across boards, grades, subjects, chapters, topics, and subtopics, with configurable question types (MCQ, MSQ, Fill-in-the-blanks, Short answer), difficulty, and count. The product surfaces deep performance analytics for students and parents, and (later) admin tools for content management.

The frontend is a polished, modern, dashboard-first SaaS-edu product — premium, calm, trustworthy, and not childish.

## 2. Roles

| Role | Purpose | Phase |
|---|---|---|
| **STUDENT** | Generate/take tests, see performance, weak topics, motivation | Phase 1 ✅ |
| **PARENT** | View linked child performance, weak areas, supportive insights | Phase 1 ✅ |
| **ADMIN** | Manage questions, curriculum, users, moderation | Phase 5 |

## 3. Route Plan

### Phase 1 (this phase)
- `/` — public landing/intro with CTAs into both dashboards
- `/dashboard/student` — student dashboard
- `/dashboard/parent` — parent dashboard

### Future
- `/auth/login`, `/auth/signup`, `/auth/forgot-password` — Phase 2
- `/test/new` — test creation wizard (board → grade → subject → chapter → topic → subtopic → types → difficulty → count → review) — Phase 3
- `/test/:testId/take` — test-taking flow with timer, navigator, autosave — Phase 3
- `/test/:testId/results` — results page with per-question review — Phase 3
- `/analytics/student` — deep analytics (trends, mastery heatmap, time-on-task) — Phase 4
- `/dashboard/parent/child/:childId` — parent child-detail page — Phase 4
- `/admin/*` — admin panel (questions, chapters, users) — Phase 5

Routing is **TanStack Start file-based** with flat dot-separated convention (`dashboard.student.tsx`).

## 4. Shared App Shell

Located in `src/components/shell/`.

- **`AppShell`** — `SidebarProvider` + `Sidebar` + main column with `Header` + `<Outlet />` content.
- **`Sidebar`** — collapsible left nav (`collapsible="icon"`), role-aware items, brand mark at top.
- **`Header`** — sticky top bar with `SidebarTrigger`, page title slot, `RoleBadge`, search placeholder, avatar.
- **`RoleBadge`** — pill showing current role (Student / Parent).
- **`PageContainer`** — consistent max-width (`max-w-7xl`), responsive padding.
- **`SectionHeader`** — title + optional subtitle + optional right-aligned action.

The sidebar trigger lives in the header so it remains visible in any state.

## 5. Design System

Light theme. Tokens defined in `src/styles.css` using `oklch`.

| Token | Value | Use |
|---|---|---|
| `--background` | `oklch(0.99 0.005 80)` | Warm off-white app bg |
| `--foreground` | `oklch(0.2 0.02 250)` | Deep slate text |
| `--primary` | `oklch(0.55 0.17 255)` | Calm indigo-blue accent |
| `--primary-foreground` | `oklch(0.99 0.005 80)` | On primary |
| `--card` | `oklch(1 0 0)` | Pure white surface |
| `--muted` | `oklch(0.97 0.005 80)` | Subtle bg |
| `--border` | `oklch(0.92 0.005 80)` | Hairline borders |
| `--success` | `oklch(0.65 0.13 155)` | Improvement / positive |
| `--warning` | `oklch(0.78 0.14 75)` | Attention |
| `--destructive` | `oklch(0.6 0.18 25)` | Errors |
| `--radius` | `1rem` | Cards `rounded-2xl`, inputs `rounded-md` |

Shadows: `shadow-sm` default, `shadow-md` on hover. Typography: Inter system stack, `text-3xl` H1, `text-sm text-muted-foreground` captions, `tabular-nums` for stats. Charts: Recharts with restrained 3-color palette derived from `--primary`.

## 6. Component Inventory

### Shell
`AppShell`, `Sidebar`, `Header`, `RoleBadge`, `PageContainer`, `SectionHeader`

### Dashboard widgets (`src/components/dashboard/`)
`StatCard`, `ChartCard`, `InsightCard`, `WeakTopicChip`, `WeakTopicList`, `RecentTestsTable`, `ChildSwitcher`, `EmptyState`, `LoadingState`, `ErrorState`

### shadcn primitives (existing) — all `src/components/ui/*`

## 7. Dashboard Widget Inventory

### Student
- Welcome banner + "Create New Test" CTA
- 4 StatCards: Tests Taken · Avg Score · Accuracy · Avg Time/Question
- Score trend (line chart, last 10 tests)
- Subject performance (horizontal bar)
- Weak topics + Weak subtopics (ranked chips)
- Recent attempts table
- Recommended focus this week (3 InsightCards)
- Motivational callout strip

### Parent
- Welcome + ChildSwitcher
- 4 StatCards: Tests Completed · Avg Score · Weak Topics · Improvement Trend
- Recent performance (area chart)
- Subject comparison panel (bar)
- Weak topics & subtopics
- Activity timeline (last 7 days)
- Supportive InsightCards
- Quick academic summary

## 8. Mock Data Strategy

Located in `src/lib/mock/`. All data is fully typed in `src/types/index.ts`.

- `students.ts` — student profile (name, grade, board)
- `children.ts` — parent's linked children (2 kids: Aarav G8 CBSE, Diya G5 ICSE)
- `tests.ts` — recent test attempts with realistic labels
- `performance.ts` — score trends, subject performance, weak areas
- `insights.ts` — generated focus areas / supportive insights

When the API arrives, swap mock imports for queries — components stay unchanged.

## 9. Phased Roadmap

| Phase | Scope |
|---|---|
| **1 ✅** | App shell, design system, homepage, student & parent dashboards (mock data) |
| **2 ✅** | Test creation wizard at `/test/new` (board → grade → subject → chapter → topic → subtopic → types → difficulty → count → review → mock generation) |
| **3** | Test-taking flow + results page (per-question review) |
| **4** | Auth: login/signup/forgot-password, JWT context, protected routes |
| **5** | Analytics deep dive + parent child-detail pages |
| **6** | Admin dashboard: question management, curriculum tree, user management |
| **7** | Polish: notifications, settings, billing, onboarding |

## 10. Future Pages

- Auth (login, signup, forgot, reset)
- Test creation wizard (multi-step)
- Test-taking flow (timer, palette, autosave)
- Results page (per-question review, explanation)
- Student analytics (mastery heatmap, time analysis)
- Parent child-detail page
- Admin: questions CRUD, chapter tree, user management

## 11. Design Consistency Rules

1. **Never hardcode colors** in components — only semantic tokens (`bg-primary`, `text-muted-foreground`, etc.).
2. Cards use `rounded-2xl`, soft `shadow-sm`, hairline `border`.
3. Stats use `tabular-nums` and clear hierarchy (label small uppercase muted, value `text-2xl font-semibold`).
4. Spacing rhythm: 4 / 6 / 8 (gap-4 inside cards, gap-6 between cards, gap-8 between sections).
5. Charts: max 3 colors per chart, no gridlines unless necessary, muted axes.
6. Empty/loading/error states are mandatory for any data surface.
7. Microcopy is calm and educational — never exclamatory, never childish.

## 12. Code Organization

```
src/
  routes/                 # TanStack file routes
  components/
    shell/                # AppShell, Sidebar, Header, ...
    dashboard/            # reusable widgets
    ui/                   # shadcn (existing)
  features/
    student/              # student-specific composition
    parent/               # parent-specific composition
  lib/
    mock/                 # mock data
    utils.ts
  types/
    index.ts
  styles.css
docs/
  TESTWEST_FRONTEND_MASTER_PLAN.md
  TESTWEST_PRODUCT_CONTEXT.md
```

Rules:
- Pages compose features; features compose widgets; widgets are dumb and presentational.
- Mock data is imported from `@/lib/mock/*` — never inline in components.
- All cross-cutting types live in `@/types`.

## 13. Future Integration: Django REST + JWT

- Backend: Django REST Framework, JWT (`access` + `refresh`).
- Add `src/lib/api/` with a typed `apiClient` (fetch wrapper, refresh interceptor).
- Add `src/lib/auth/` with `AuthProvider`, `useAuth`, route guards.
- Replace `src/lib/mock/*` imports with `@tanstack/react-query` hooks (`useStudentDashboard`, `useParentDashboard(childId)`).
- Endpoints expected:
  - `POST /api/auth/login`, `POST /api/auth/refresh`
  - `GET /api/students/me/dashboard`
  - `GET /api/parents/me/children`
  - `GET /api/parents/me/children/:id/dashboard`
  - `POST /api/tests` (create), `GET /api/tests/:id`, `POST /api/tests/:id/submit`
- `QueryClient` is created inside `getRouter()` (already wired via TanStack Start).

---

## Phase 3 Prompt (next)

> "Continue from `TESTWEST_FRONTEND_MASTER_PLAN.md`. Build Phase 3: the **test-taking flow** at `/test/$testId/take` and the **results page** at `/test/$testId/results`. Include a question palette/navigator, timer, autosave indicator, per-question type renderers (MCQ, MSQ, Fill-in-the-blanks, Short answer), submit confirmation, and a results screen with overall score, accuracy, time-per-question, and per-question review with explanations. Use mock questions generated from the wizard selections. Reuse the existing app shell and design tokens. Keep code under `src/features/test-taking/` and `src/features/test-results/`."
