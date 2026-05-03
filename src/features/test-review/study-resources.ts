/**
 * Mock curated study resources keyed by subject + topic.
 * In production this would come from a CMS or AI-generated suggestions.
 * The lookup is best-effort: we fall back to subject-level resources, then
 * to a generic set, so every topic always shows something useful.
 */

export interface StudyResource {
  type: "video" | "article" | "practice" | "notes";
  title: string;
  source: string;
  url: string;
  durationMin?: number;
}

const GENERIC: StudyResource[] = [
  {
    type: "video",
    title: "Khan Academy — search this topic",
    source: "Khan Academy",
    url: "https://www.khanacademy.org/search",
  },
  {
    type: "article",
    title: "BYJU'S concept explainer",
    source: "BYJU'S",
    url: "https://byjus.com/",
  },
  {
    type: "practice",
    title: "More practice questions",
    source: "TestWest",
    url: "/test/new",
  },
];

const RESOURCES: Record<string, Record<string, StudyResource[]>> = {
  Mathematics: {
    "Linear Equations": [
      {
        type: "video",
        title: "Solving linear equations in one variable",
        source: "Khan Academy",
        url: "https://www.khanacademy.org/math/algebra/x2f8bb11595b61c86:solve-equations-inequalities",
        durationMin: 12,
      },
      {
        type: "notes",
        title: "Linear Equations — concept notes",
        source: "BYJU'S",
        url: "https://byjus.com/maths/linear-equations/",
      },
      {
        type: "practice",
        title: "Practice: 10 mixed linear equations",
        source: "TestWest",
        url: "/test/new",
      },
    ],
    Polynomials: [
      {
        type: "video",
        title: "Intro to polynomials",
        source: "Khan Academy",
        url: "https://www.khanacademy.org/math/algebra/x2f8bb11595b61c86:poly-arithmetic",
        durationMin: 9,
      },
      {
        type: "notes",
        title: "Polynomials — definitions & degree",
        source: "BYJU'S",
        url: "https://byjus.com/maths/polynomial/",
      },
    ],
    Operations: [
      {
        type: "video",
        title: "Adding & subtracting fractions",
        source: "Khan Academy",
        url: "https://www.khanacademy.org/math/arithmetic/fraction-arithmetic",
        durationMin: 8,
      },
      {
        type: "practice",
        title: "Fraction operations practice",
        source: "TestWest",
        url: "/test/new",
      },
    ],
  },
  Science: {
    "Laws of Motion": [
      {
        type: "video",
        title: "Newton's three laws explained",
        source: "Khan Academy",
        url: "https://www.khanacademy.org/science/physics/forces-newtons-laws",
        durationMin: 11,
      },
      {
        type: "notes",
        title: "Newton's Laws — quick notes",
        source: "BYJU'S",
        url: "https://byjus.com/physics/newtons-laws-of-motion/",
      },
    ],
    Kinematics: [
      {
        type: "video",
        title: "Equations of motion derivation",
        source: "Khan Academy",
        url: "https://www.khanacademy.org/science/physics/one-dimensional-motion",
        durationMin: 14,
      },
    ],
  },
  Physics: {
    Kinematics: [
      {
        type: "video",
        title: "Equations of motion derivation",
        source: "Khan Academy",
        url: "https://www.khanacademy.org/science/physics/one-dimensional-motion",
        durationMin: 14,
      },
      {
        type: "notes",
        title: "Kinematics formulas",
        source: "BYJU'S",
        url: "https://byjus.com/physics/equations-of-motion/",
      },
    ],
    "Laws of Motion": [
      {
        type: "video",
        title: "Newton's three laws explained",
        source: "Khan Academy",
        url: "https://www.khanacademy.org/science/physics/forces-newtons-laws",
        durationMin: 11,
      },
    ],
  },
  Chemistry: {
    "Bohr's Model": [
      {
        type: "video",
        title: "Bohr model of the atom",
        source: "Khan Academy",
        url: "https://www.khanacademy.org/science/chemistry/electronic-structure-of-atoms",
        durationMin: 10,
      },
      {
        type: "notes",
        title: "Bohr's postulates",
        source: "BYJU'S",
        url: "https://byjus.com/chemistry/bohrs-model/",
      },
    ],
  },
  Biology: {
    "Cell Structure": [
      {
        type: "video",
        title: "Prokaryotic vs eukaryotic cells",
        source: "Khan Academy",
        url: "https://www.khanacademy.org/science/biology/structure-of-a-cell",
        durationMin: 9,
      },
    ],
  },
  English: {
    "Parts of Speech": [
      {
        type: "article",
        title: "Parts of speech — overview",
        source: "Grammarly",
        url: "https://www.grammarly.com/blog/parts-of-speech/",
      },
    ],
  },
};

export function resourcesFor(subject: string, topic: string): StudyResource[] {
  const subj = RESOURCES[subject];
  if (subj && subj[topic]) return subj[topic]!;
  // fall back to any first-listed topic for that subject
  if (subj) {
    const first = Object.values(subj)[0];
    if (first) return first;
  }
  return GENERIC;
}
