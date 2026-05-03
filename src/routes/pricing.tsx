import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Check, GraduationCap, ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — TestWest" },
      {
        name: "description",
        content:
          "Simple pricing for TestWest. Solo learners pay monthly or yearly. School students get yearly access through their school.",
      },
      { property: "og:title", content: "Pricing — TestWest" },
      {
        property: "og:description",
        content:
          "Monthly and yearly plans for solo learners. Yearly school plans for institutions and their students.",
      },
    ],
  }),
  component: Pricing,
});

type Cycle = "monthly" | "yearly";

const soloPlans = [
  {
    name: "Solo Free",
    monthly: 0,
    yearly: 0,
    desc: "Try TestWest with 5 tests per week.",
    features: ["5 auto tests / week", "Create your own tests", "Basic analytics", "Single device"],
    cta: "Get started",
    highlight: false,
  },
  {
    name: "Solo Plus",
    monthly: 299,
    yearly: 2499,
    desc: "Unlimited learning for serious students.",
    features: [
      "Unlimited auto tests",
      "Adaptive difficulty",
      "Advanced analytics & weak topics",
      "Parent progress reports",
      "Priority support",
    ],
    cta: "Start Plus",
    highlight: true,
  },
  {
    name: "Solo Pro",
    monthly: 499,
    yearly: 3999,
    desc: "Everything in Plus, plus 1-on-1 mentor reviews.",
    features: [
      "Everything in Plus",
      "Monthly mentor review",
      "Detailed feedback on short answers",
      "Goal tracking",
    ],
    cta: "Start Pro",
    highlight: false,
  },
];

const schoolPlans = [
  {
    name: "School Starter",
    yearly: 1499,
    desc: "Per student / year, billed to the school.",
    features: ["All test types", "Teacher assignments", "Class & topic analytics", "Email support"],
    cta: "Talk to sales",
  },
  {
    name: "School Standard",
    yearly: 2499,
    desc: "Per student / year — most popular for K-12.",
    features: [
      "Everything in Starter",
      "Custom groups & olympiad batches",
      "Parent dashboards included",
      "Onboarding & training",
    ],
    cta: "Talk to sales",
    highlight: true,
  },
  {
    name: "School Premium",
    yearly: 3999,
    desc: "Per student / year with white-glove service.",
    features: [
      "Everything in Standard",
      "Dedicated success manager",
      "Custom curriculum mapping",
      "SSO & advanced admin",
    ],
    cta: "Talk to sales",
  },
];

function Pricing() {
  const [cycle, setCycle] = useState<Cycle>("monthly");
  const [tab, setTab] = useState<"solo" | "school">("solo");

  return (
    <div className="min-h-screen bg-background">
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
        <Button asChild variant="ghost" size="sm">
          <Link to="/">
            <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to home
          </Link>
        </Button>
      </header>

      <section className="mx-auto max-w-7xl px-4 pb-20 pt-6 md:px-8">
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary-soft px-3 py-1 text-xs font-medium text-accent-foreground">
            <Sparkles className="h-3 w-3" />
            Simple, fair pricing
          </span>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
            Plans that grow with the learner
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground md:text-base">
            Solo learners can choose monthly or yearly billing. Schools partner with us for the full
            year so every student in the institution is covered.
          </p>
        </div>

        <Tabs
          value={tab}
          onValueChange={(v) => setTab(v as "solo" | "school")}
          className="mt-8 flex flex-col items-center"
        >
          <TabsList>
            <TabsTrigger value="solo">For solo learners</TabsTrigger>
            <TabsTrigger value="school">For schools</TabsTrigger>
          </TabsList>
        </Tabs>

        {tab === "solo" && (
          <div className="mt-6 flex justify-center">
            <div className="inline-flex items-center gap-1 rounded-full border bg-card p-1">
              <button
                onClick={() => setCycle("monthly")}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${cycle === "monthly" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
              >
                Monthly
              </button>
              <button
                onClick={() => setCycle("yearly")}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${cycle === "yearly" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
              >
                Yearly{" "}
                <span className="ml-1 rounded-full bg-success/20 px-1.5 py-0.5 text-[10px] text-success">
                  Save 30%
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Plans */}
        {tab === "solo" ? (
          <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
            {soloPlans.map((p) => {
              const price = cycle === "monthly" ? p.monthly : p.yearly;
              return (
                <Card key={p.name} className={p.highlight ? "border-primary shadow-md" : ""}>
                  <CardContent className="flex h-full flex-col p-6">
                    {p.highlight && (
                      <span className="mb-2 inline-flex w-fit items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-primary-foreground">
                        Most popular
                      </span>
                    )}
                    <h3 className="text-lg font-semibold">{p.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{p.desc}</p>
                    <div className="mt-4 flex items-baseline gap-1">
                      <span className="text-3xl font-semibold tabular-nums">
                        {price === 0 ? "Free" : `₹${price.toLocaleString("en-IN")}`}
                      </span>
                      {price > 0 && (
                        <span className="text-sm text-muted-foreground">
                          /{cycle === "monthly" ? "mo" : "yr"}
                        </span>
                      )}
                    </div>
                    <ul className="mt-5 space-y-2.5">
                      {p.features.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-sm">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      className="mt-6 w-full"
                      variant={p.highlight ? "default" : "outline"}
                      onClick={() =>
                        toast.success(`${p.name} selected`, {
                          description: price === 0 ? "Free plan activated." : `Billed ${cycle}.`,
                        })
                      }
                    >
                      {p.cta}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
            {schoolPlans.map((p) => (
              <Card key={p.name} className={p.highlight ? "border-primary shadow-md" : ""}>
                <CardContent className="flex h-full flex-col p-6">
                  {p.highlight && (
                    <span className="mb-2 inline-flex w-fit items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-primary-foreground">
                      Most popular
                    </span>
                  )}
                  <h3 className="text-lg font-semibold">{p.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{p.desc}</p>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-3xl font-semibold tabular-nums">
                      ₹{p.yearly.toLocaleString("en-IN")}
                    </span>
                    <span className="text-sm text-muted-foreground">/student/yr</span>
                  </div>
                  <ul className="mt-5 space-y-2.5">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="mt-6 w-full"
                    variant={p.highlight ? "default" : "outline"}
                    onClick={() =>
                      toast.success("Request received", {
                        description: "Our team will reach out within 1 business day.",
                      })
                    }
                  >
                    {p.cta}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <p className="mt-10 text-center text-xs text-muted-foreground">
          Schools subscribe yearly so every student in the institution gets continuous access. Solo
          learners can pick monthly or yearly anytime.
        </p>
      </section>
    </div>
  );
}
