import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, GraduationCap, Users, Sparkles, Target, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TestWest — K-12 Assessments & Insights" },
      {
        name: "description",
        content:
          "TestWest helps K-12 students practice with smart, customizable tests and gives parents clear insight into progress and weak areas.",
      },
      { property: "og:title", content: "TestWest — K-12 Assessments & Insights" },
      {
        property: "og:description",
        content: "Customizable tests for Grades 1–12 with deep analytics for students and parents.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 md:px-8">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <GraduationCap className="h-4 w-4" />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold tracking-tight">TestWest</p>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              K-12 Assessments
            </p>
          </div>
        </Link>
        <nav className="hidden items-center gap-2 md:flex">
          <Button asChild variant="ghost" size="sm">
            <Link to="/dashboard/student">Student</Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link to="/dashboard/parent">Parent</Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link to="/dashboard/teacher">Teacher</Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link to="/dashboard/solo">Solo</Link>
          </Button>
          <Button asChild size="sm">
            <Link to="/pricing">Pricing</Link>
          </Button>
        </nav>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 pb-12 pt-8 md:px-8 md:pb-20 md:pt-16">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary-soft px-3 py-1 text-xs font-medium text-accent-foreground">
              <Sparkles className="h-3 w-3" />
              Phase 1 preview
            </span>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
              Practice with purpose.
              <br />
              <span className="text-accent-foreground">See progress clearly.</span>
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
              TestWest lets students from Grade 1 to 12 generate focused tests by chapter, topic,
              and difficulty — and gives parents calm, useful insight into how their child is really
              doing.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/dashboard/student">
                  Open student dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/dashboard/parent">
                  Open parent dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Mock preview card */}
          <div className="relative">
            <div className="absolute -inset-6 -z-10 rounded-3xl bg-gradient-to-br from-primary-soft via-background to-background blur-2xl" />
            <Card className="overflow-hidden">
              <CardContent className="p-6">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  This week
                </p>
                <h3 className="mt-1 text-lg font-semibold">You're up 12% in Mathematics</h3>
                <div className="mt-5 grid grid-cols-3 gap-3">
                  {[
                    { label: "Tests", value: "34" },
                    { label: "Avg score", value: "78%" },
                    { label: "Accuracy", value: "80%" },
                  ].map((s) => (
                    <div key={s.label} className="rounded-xl border bg-background p-3">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        {s.label}
                      </p>
                      <p className="mt-1 text-xl font-semibold tabular-nums">{s.value}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-5 space-y-2">
                  {[
                    { name: "Algebra", v: 82 },
                    { name: "Force & Motion", v: 68 },
                    { name: "Reading Comprehension", v: 91 },
                  ].map((b) => (
                    <div key={b.name}>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">{b.name}</span>
                        <span className="font-medium tabular-nums">{b.v}%</span>
                      </div>
                      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${b.v}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Roles */}
      <section className="mx-auto max-w-7xl px-4 pb-20 md:px-8">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[
            {
              icon: GraduationCap,
              title: "For students",
              desc: "Generate tests by board, grade, subject, chapter, and topic. Track weak areas and accuracy over time.",
              href: "/dashboard/student",
              cta: "Open student view",
            },
            {
              icon: Users,
              title: "For parents",
              desc: "See your child's progress at a glance, with calm insights on what to support next.",
              href: "/dashboard/parent",
              cta: "Open parent view",
            },
            {
              icon: BarChart3,
              title: "Built on insight",
              desc: "Realistic analytics, clear charts, and focused recommendations — no clutter, no noise.",
              href: "/dashboard/student",
              cta: "Explore",
            },
          ].map((r) => (
            <Card key={r.title} className="transition-shadow hover:shadow-md">
              <CardContent className="p-6">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-accent-foreground">
                  <r.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-base font-semibold tracking-tight">{r.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{r.desc}</p>
                <Button asChild variant="link" className="mt-2 h-auto p-0 text-sm">
                  <Link to={r.href}>
                    {r.cta} <ArrowRight className="ml-1 h-3.5 w-3.5" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-10 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Target className="h-3.5 w-3.5" />
          Phase 1 frontend preview · Mock data · Auth and test flow coming next
        </div>
      </section>
    </div>
  );
}
