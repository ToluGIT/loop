// ============================================================
// Mock RGU Module Data for Demo
// ============================================================
// Realistic Robert Gordon University Computing modules
// These will be pre-seeded for the hackathon demo
// ============================================================

export const RGU_MODULES = [
  {
    code: "CMM525",
    name: "Software Development 3",
    credits: 15,
    level: 5,
    assessments: [
      { name: "Coursework 1 - Web App", weight: 0.5, dueDate: "2025-11-15" },
      { name: "Coursework 2 - Group Project", weight: 0.5, dueDate: "2026-01-24" },
    ],
  },
  {
    code: "CMM526",
    name: "Database Systems",
    credits: 15,
    level: 5,
    assessments: [
      { name: "Coursework - Schema Design", weight: 0.4, dueDate: "2025-12-06" },
      { name: "Final Exam", weight: 0.6, dueDate: "2026-04-22" },
    ],
  },
  {
    code: "CMM527",
    name: "Interaction Design",
    credits: 15,
    level: 5,
    assessments: [
      { name: "UX Portfolio", weight: 0.6, dueDate: "2026-01-17" },
      { name: "Exam", weight: 0.4, dueDate: "2026-04-28" },
    ],
  },
  {
    code: "CMM528",
    name: "Network Security",
    credits: 15,
    level: 6,
    assessments: [
      { name: "Coursework - Penetration Testing Report", weight: 0.5, dueDate: "2026-02-14" },
      { name: "Final Exam", weight: 0.5, dueDate: "2026-05-06" },
    ],
  },
  {
    code: "CMM529",
    name: "Cloud Computing",
    credits: 15,
    level: 6,
    assessments: [
      { name: "Coursework - Cloud Architecture", weight: 0.6, dueDate: "2026-02-20" },
      { name: "Final Exam", weight: 0.4, dueDate: "2026-05-12" },
    ],
  },
  {
    code: "CMM530",
    name: "Artificial Intelligence",
    credits: 15,
    level: 6,
    assessments: [
      { name: "Coursework - ML Project", weight: 0.5, dueDate: "2026-03-13" },
      { name: "Final Exam", weight: 0.5, dueDate: "2026-05-19" },
    ],
  },
  {
    code: "CMM507",
    name: "Computing Research Methods",
    credits: 15,
    level: 6,
    assessments: [
      { name: "Literature Review", weight: 0.3, dueDate: "2025-11-29" },
      { name: "Research Proposal", weight: 0.4, dueDate: "2026-03-06" },
      { name: "Statistical Analysis", weight: 0.3, dueDate: "2026-04-10" },
    ],
  },
  {
    code: "CMM531",
    name: "Honours Project",
    credits: 30,
    level: 6,
    assessments: [
      { name: "Dissertation", weight: 0.7, dueDate: "2026-04-17" },
      { name: "Presentation", weight: 0.15, dueDate: "2026-05-01" },
      { name: "Viva", weight: 0.15, dueDate: "2026-05-08" },
    ],
  },
];

// Pre-seeded demo students with partial grades
export const DEMO_STUDENTS = [
  {
    name: "Alex Chen",
    email: "a.chen@rgu.ac.uk",
    course: "BSc (Hons) Computer Science",
    year: 3,
    modules: ["CMM525", "CMM526", "CMM527", "CMM528", "CMM529", "CMM530"],
    grades: {
      CMM525: { "Coursework 1 - Web App": 72, "Coursework 2 - Group Project": 68 },
      CMM526: { "Coursework - Schema Design": 65 },
      CMM527: { "UX Portfolio": 58 },
      CMM528: { "Coursework - Penetration Testing Report": 71 },
      CMM529: { "Coursework - Cloud Architecture": 62 },
      CMM530: {},
    },
    skillProfile: {
      canTeach: ["CMM525", "CMM528", "Python", "React"],
      needsHelp: ["CMM527", "CMM530", "UX Design"],
      bio: "3rd year CS student, strong in web dev and security",
      contact: "alexc#4521",
    },
  },
  {
    name: "Sarah MacDonald",
    email: "s.macdonald@rgu.ac.uk",
    course: "BSc (Hons) Cyber Security",
    year: 3,
    modules: ["CMM525", "CMM526", "CMM528", "CMM529", "CMM530", "CMM507"],
    grades: {
      CMM525: { "Coursework 1 - Web App": 55, "Coursework 2 - Group Project": 61 },
      CMM526: { "Coursework - Schema Design": 78 },
      CMM528: { "Coursework - Penetration Testing Report": 82 },
      CMM529: { "Coursework - Cloud Architecture": 74 },
      CMM530: { "Coursework - ML Project": 45 },
      CMM507: { "Literature Review": 68 },
    },
    skillProfile: {
      canTeach: ["CMM528", "CMM526", "SQL", "Network Security"],
      needsHelp: ["CMM530", "CMM525", "Machine Learning"],
      bio: "Cyber security focused, love databases and networking",
      contact: "sarahm_rgu",
    },
  },
  {
    name: "Jamie Wilson",
    email: "j.wilson@rgu.ac.uk",
    course: "BSc (Hons) Digital Media",
    year: 3,
    modules: ["CMM525", "CMM527", "CMM529", "CMM530", "CMM507", "CMM531"],
    grades: {
      CMM525: { "Coursework 1 - Web App": 48, "Coursework 2 - Group Project": 52 },
      CMM527: { "UX Portfolio": 85, "Exam": 76 },
      CMM529: {},
      CMM530: {},
      CMM507: { "Literature Review": 42 },
      CMM531: {},
    },
    skillProfile: {
      canTeach: ["CMM527", "Figma", "UX Research", "Prototyping"],
      needsHelp: ["CMM525", "CMM507", "Academic Writing", "Python"],
      bio: "Design-focused, great at UX but struggling with code-heavy modules",
      contact: "jamie.designs",
    },
  },
  {
    name: "Priya Sharma",
    email: "p.sharma@rgu.ac.uk",
    course: "BSc (Hons) Computer Science",
    year: 3,
    modules: ["CMM525", "CMM526", "CMM528", "CMM529", "CMM530", "CMM531"],
    grades: {
      CMM525: { "Coursework 1 - Web App": 88, "Coursework 2 - Group Project": 92 },
      CMM526: { "Coursework - Schema Design": 85, "Final Exam": 79 },
      CMM528: { "Coursework - Penetration Testing Report": 76 },
      CMM529: { "Coursework - Cloud Architecture": 81 },
      CMM530: { "Coursework - ML Project": 73 },
      CMM531: { "Dissertation": 78 },
    },
    skillProfile: {
      canTeach: ["CMM525", "CMM526", "CMM530", "Java", "Python", "React", "Machine Learning"],
      needsHelp: ["CMM531", "Dissertation Writing"],
      bio: "Strong across the board, happy to help anyone. Particularly good with programming.",
      contact: "priya.dev",
    },
  },
  {
    name: "Calum Fraser",
    email: "c.fraser@rgu.ac.uk",
    course: "BSc (Hons) Computer Science",
    year: 3,
    modules: ["CMM525", "CMM526", "CMM527", "CMM528", "CMM529", "CMM507"],
    grades: {
      CMM525: { "Coursework 1 - Web App": 62, "Coursework 2 - Group Project": 58 },
      CMM526: { "Coursework - Schema Design": 55 },
      CMM527: { "UX Portfolio": 51 },
      CMM528: {},
      CMM529: {},
      CMM507: {},
    },
    skillProfile: {
      canTeach: ["CMM525", "JavaScript", "Git"],
      needsHelp: ["CMM526", "CMM527", "CMM528", "SQL", "Networking", "UX"],
      bio: "Decent at coding, struggling with theory-heavy modules. Need study partners!",
      contact: "calumf99",
    },
  },
];

// Campus-wide anonymous stats for the stats dashboard
export const CAMPUS_STATS = {
  totalStudents: 247,
  overallBreakdown: {
    first: 0.18,
    upperSecond: 0.34,
    lowerSecond: 0.31,
    third: 0.12,
    fail: 0.05,
  },
  moduleStats: [
    { code: "CMM525", name: "Software Development 3", avg: 63.2, students: 189, firstPct: 0.22 },
    { code: "CMM526", name: "Database Systems", avg: 59.8, students: 167, firstPct: 0.15 },
    { code: "CMM527", name: "Interaction Design", avg: 61.5, students: 142, firstPct: 0.19 },
    { code: "CMM528", name: "Network Security", avg: 57.3, students: 134, firstPct: 0.12 },
    { code: "CMM529", name: "Cloud Computing", avg: 62.1, students: 128, firstPct: 0.17 },
    { code: "CMM530", name: "Artificial Intelligence", avg: 54.6, students: 156, firstPct: 0.09 },
    { code: "CMM507", name: "Computing Research Methods", avg: 58.9, students: 178, firstPct: 0.14 },
    { code: "CMM531", name: "Honours Project", avg: 64.7, students: 95, firstPct: 0.24 },
  ],
  weeklyTrend: [
    { week: "W1", avgConfidence: 72 },
    { week: "W2", avgConfidence: 68 },
    { week: "W3", avgConfidence: 65 },
    { week: "W4", avgConfidence: 58 },
    { week: "W5", avgConfidence: 52 },
    { week: "W6", avgConfidence: 48 },
    { week: "W7", avgConfidence: 55 },
    { week: "W8", avgConfidence: 61 },
  ],
};
