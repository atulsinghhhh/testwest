# TestWest — Product Context

> Short reusable context. Include this when starting any new prompt.

## Product

TestWest is a K-12 (Grade 1–12) assessment platform. Students generate and take tests by board, grade, subject, chapter, topic, and subtopic, with configurable question types (MCQ, MSQ, Fill-in-the-blanks, Short answer), difficulty, and count. The product delivers performance analytics to students and parents.

## Target Users

- **Students** (Grade 1–12) — practice and self-assessment
- **Parents** — monitor and support their child's learning
- **Admins** — manage questions and curriculum (later phase)

## Dashboard Goals

- **Student**: understand recent performance, see weak topics/subtopics, average score & accuracy, average time per question, quickly start a new test, feel motivated and guided.
- **Parent**: view linked child performance, identify weak areas, see recent activity, feel reassured and informed about where their child needs support.

## Roles

- **STUDENT** — primary learner
- **PARENT** — guardian, view-only on child analytics
- **ADMIN** — content/operations (Phase 5)

## Design Rules

- Light theme, warm neutral background, single calm indigo-blue primary accent
- `rounded-2xl` cards, soft shadows, hairline borders
- Strong spacing rhythm (gap-4 / 6 / 8), excellent typography hierarchy
- Recharts with a restrained palette (max 3 colors)
- Never hardcode colors — only semantic tokens from `src/styles.css`

## Brand Tone

Premium · modern · calm · trustworthy · educational · dashboard-first · polished but not flashy · **not childish**.

Avoid: cartoonish, overly colorful, cluttered, template-looking, generic.

## UX Guardrails

- Clear visual hierarchy and easy scanning
- Reusable dashboard widgets
- Role-aware navigation
- Polished empty / loading / error states
- Mock data feels realistic (Fractions, Algebra, Photosynthesis, Grammar, etc.)
- Microcopy is calm and educational, never exclamatory

## Future Features

- Auth (login/signup, JWT)
- Test creation wizard
- Test-taking flow with timer & autosave
- Results page with per-question review
- Deep analytics (mastery heatmap, time analysis)
- Parent child-detail pages
- Admin question/curriculum/user management
- Notifications, settings, billing
