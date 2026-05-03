## TestWest — Phase 1 Frontend Foundation

I have enough detail from your brief to proceed. Here's the plan.

### 1. Internal blueprint docs (created first, treated as source of truth)

- `docs/TESTWEST_FRONTEND_MASTER_PLAN.md` — full master plan: product summary, roles, route plan, app shell, design system, component inventory, widget inventory, mock data strategy, phased roadmap (Phase 1–6), future pages, design consistency rules, code org, Django REST/JWT integration notes.
- `docs/TESTWEST_PRODUCT_CONTEXT.md` — short reusable context: product summary, users, dashboard goals, role descriptions, design rules, brand tone, UX guardrails, future feature list.

Both written so future prompts can say "Continue from TESTWEST_FRONTEND_MASTER_PLAN.md, build next phase."

### 2. Design system (light theme, premium SaaS-edu)

- **Background**: warm neutral `oklch(0.99 0.005 80)` (subtle warm off-white)
- **Foreground**: deep slate `oklch(0.2 0.02 250)`
- **Primary accent**: calm indigo-blue `oklch(0.55 0.17 255)` — trustworthy, educational, not childish
- **Success / Warning / Destructive**: muted, not neon
- **Radius**: `1rem` (rounded-2xl on cards)
- **Shadows**: soft, layered (`shadow-sm` default, `shadow-md` on hover)
- **Typography**: Inter via system stack; clear hierarchy (text-3xl headings, text-sm muted captions, tabular-nums for stats)
- **Charts**: Recharts with a restrained 3-color palette derived from primary
- All tokens defined in `src/styles.css` via existing `:root` CSS vars (overwritten with new palette)

### 3. Routes (TanStack Start file-based)

- `src/routes/index.tsx` — landing/homepage placeholder with TestWest brand intro + CTAs to both dashboards (replaces blank placeholder)
- `src/routes/dashboard.tsx` — layout route with `<Outlet />` wrapped in the app shell
- `src/routes/dashboard.student.tsx` — student dashboard
- `src/routes/dashboard.parent.tsx` — parent dashboard

Each route gets its own `head()` metadata.

### 4. Shared app shell (`src/components/shell/`)

- `AppShell.tsx` — sidebar + header + main container, responsive
- `Sidebar.tsx` — collapsible left nav using shadcn sidebar, role-aware items
- `Header.tsx` — page title slot, role badge, user avatar, search placeholder
- `RoleBadge.tsx` — Student / Parent pill
- `PageContainer.tsx` — consistent max-width + padding
- `SectionHeader.tsx` — title + optional action
- Sidebar trigger always visible in header

### 5. Reusable UI foundations (`src/components/dashboard/`)

- `StatCard.tsx` — label, value, delta indicator, icon
- `ChartCard.tsx` — wrapper with title/subtitle/legend slot
- `InsightCard.tsx` — icon + headline + supporting text (motivational / supportive variants)
- `WeakTopicChip.tsx` and `WeakTopicList.tsx` — ranked weak areas
- `RecentTestsTable.tsx` — subject, score, accuracy, date, status badge
- `EmptyState.tsx`, `LoadingState.tsx`, `ErrorState.tsx` — polished placeholders
- `ChildSwitcher.tsx` — parent's child selector (dropdown)

### 6. Mock data layer (`src/lib/mock/`)

- `students.ts` — student profile, grade, board
- `children.ts` — parent's linked children (2 kids)
- `tests.ts` — recent test attempts with realistic subject/chapter/topic labels (Fractions, Algebra, Photosynthesis, Grammar, Reading Comprehension, Integers, Force and Motion, etc.)
- `performance.ts` — score trends, subject performance, weak topics/subtopics, accuracy, avg time
- `insights.ts` — generated focus areas / supportive insights
- All typed in `src/types/index.ts` (Student, Parent, Child, TestAttempt, SubjectPerformance, WeakArea, Insight)

### 7. Student dashboard composition

- Welcome banner: "Welcome back, Aarav — Grade 8, CBSE" + prominent "Create New Test" CTA
- 4 StatCards row: Tests Taken · Avg Score · Accuracy · Avg Time/Question
- Two-column grid:
  - Score trend (line chart, last 10 tests)
  - Subject performance (horizontal bar chart)
- Weak topics + Weak subtopics (chip ranked cards)
- Recent attempts table (8 rows)
- Recommended focus this week (insight cards, 3)
- Motivational callout strip

### 8. Parent dashboard composition

- Welcome + ChildSwitcher (top right)
- 4 StatCards for selected child: Tests Completed · Avg Score · Weak Topics · Improvement Trend
- Two-column grid:
  - Recent performance (area chart)
  - Subject comparison panel
- Weak topics & subtopics
- Activity timeline (last 7 days)
- Supportive insight cards (e.g., "Needs more practice in Fractions", "Improving in English comprehension")
- Quick academic summary card

### 9. Code organization

```
src/
  routes/                 # TanStack file routes
  components/
    shell/                # AppShell, Sidebar, Header
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
  styles.css              # design tokens
docs/
  TESTWEST_FRONTEND_MASTER_PLAN.md
  TESTWEST_PRODUCT_CONTEXT.md
```

### 10. Out of scope for Phase 1 (documented in master plan for future phases)

- Auth screens, JWT wiring
- Test creation wizard
- Test-taking flow
- Results page
- Admin dashboard
- Analytics deep dive
- Parent child-detail pages

### Phase 2 preview (will be in master plan)

"Build the test creation wizard: board → grade → subject → chapter → topic → subtopic → question types → difficulty → count, with review screen and mock test generation."

After implementation I will summarize files created, components built, design choices, and the exact Phase 2 prompt to use next.
