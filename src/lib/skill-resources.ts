// ============================================================
// Skill → Learning Resource Mapping
// ============================================================
// Maps skills and module codes to free/open-source learning
// resources so students know where to level up.
// ============================================================

export interface SkillResource {
  name: string;
  url: string;
  type: "course" | "docs" | "tool" | "community";
}

const SKILL_RESOURCES: Record<string, SkillResource[]> = {
  // --- Programming Languages ---
  Python: [
    { name: "Python.org Tutorial", url: "https://docs.python.org/3/tutorial/", type: "docs" },
    { name: "freeCodeCamp Python", url: "https://www.freecodecamp.org/learn/scientific-computing-with-python/", type: "course" },
  ],
  Java: [
    { name: "Dev.java Tutorial", url: "https://dev.java/learn/", type: "docs" },
    { name: "MOOC.fi Java", url: "https://java-programming.mooc.fi/", type: "course" },
  ],
  JavaScript: [
    { name: "MDN JavaScript", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide", type: "docs" },
    { name: "javascript.info", url: "https://javascript.info/", type: "course" },
  ],
  React: [
    { name: "React Docs", url: "https://react.dev/learn", type: "docs" },
    { name: "freeCodeCamp React", url: "https://www.freecodecamp.org/learn/front-end-development-libraries/#react", type: "course" },
  ],

  // --- Tools ---
  Git: [
    { name: "Git Handbook", url: "https://guides.github.com/introduction/git-handbook/", type: "docs" },
    { name: "Learn Git Branching", url: "https://learngitbranching.js.org/", type: "tool" },
  ],
  Figma: [
    { name: "Figma Learn", url: "https://help.figma.com/hc/en-us/categories/360002051613", type: "docs" },
    { name: "Figma Community", url: "https://www.figma.com/community", type: "community" },
  ],

  // --- Domains ---
  SQL: [
    { name: "SQLBolt", url: "https://sqlbolt.com/", type: "course" },
    { name: "Mode SQL Tutorial", url: "https://mode.com/sql-tutorial/", type: "course" },
  ],
  "Network Security": [
    { name: "TryHackMe", url: "https://tryhackme.com/", type: "course" },
    { name: "OWASP Top 10", url: "https://owasp.org/www-project-top-ten/", type: "docs" },
  ],
  Networking: [
    { name: "Cisco Networking Academy", url: "https://www.netacad.com/", type: "course" },
    { name: "Computer Networking (Stanford)", url: "https://www.youtube.com/playlist?list=PLoCMsyE1cvdWKsLVyf6cPwCLDIZnOj0NS", type: "course" },
  ],
  "Machine Learning": [
    { name: "fast.ai", url: "https://www.fast.ai/", type: "course" },
    { name: "Google ML Crash Course", url: "https://developers.google.com/machine-learning/crash-course", type: "course" },
  ],
  "UX Design": [
    { name: "NN/g UX Articles", url: "https://www.nngroup.com/articles/", type: "docs" },
    { name: "Google UX Design", url: "https://grow.google/certificates/ux-design/", type: "course" },
  ],
  "UX Research": [
    { name: "NN/g Research Methods", url: "https://www.nngroup.com/articles/which-ux-research-methods/", type: "docs" },
    { name: "Maze UX Research", url: "https://maze.co/guides/ux-research/", type: "docs" },
  ],
  Prototyping: [
    { name: "Figma Prototyping", url: "https://help.figma.com/hc/en-us/articles/360040314193", type: "docs" },
    { name: "InVision Guides", url: "https://www.invisionapp.com/defined/prototyping", type: "docs" },
  ],
  UX: [
    { name: "NN/g UX Articles", url: "https://www.nngroup.com/articles/", type: "docs" },
    { name: "Laws of UX", url: "https://lawsofux.com/", type: "docs" },
  ],
  "Academic Writing": [
    { name: "Purdue OWL", url: "https://owl.purdue.edu/owl/", type: "docs" },
    { name: "RGU Library Guides", url: "https://libguides.rgu.ac.uk/", type: "docs" },
  ],
  "Dissertation Writing": [
    { name: "Purdue OWL", url: "https://owl.purdue.edu/owl/", type: "docs" },
    { name: "Thesis Whisperer", url: "https://thesiswhisperer.com/", type: "community" },
  ],

  // --- Module-specific resources ---
  CMM525: [
    { name: "MDN Web Docs", url: "https://developer.mozilla.org/", type: "docs" },
    { name: "The Odin Project", url: "https://www.theodinproject.com/", type: "course" },
  ],
  CMM526: [
    { name: "SQLBolt", url: "https://sqlbolt.com/", type: "course" },
    { name: "PostgreSQL Tutorial", url: "https://www.postgresqltutorial.com/", type: "docs" },
  ],
  CMM527: [
    { name: "NN/g UX Articles", url: "https://www.nngroup.com/articles/", type: "docs" },
    { name: "Laws of UX", url: "https://lawsofux.com/", type: "docs" },
  ],
  CMM528: [
    { name: "TryHackMe", url: "https://tryhackme.com/", type: "course" },
    { name: "Hack The Box", url: "https://www.hackthebox.com/", type: "course" },
  ],
  CMM529: [
    { name: "AWS Free Tier", url: "https://aws.amazon.com/free/", type: "tool" },
    { name: "Cloud Computing 101", url: "https://www.cloudflare.com/learning/cloud/what-is-cloud-computing/", type: "docs" },
  ],
  CMM530: [
    { name: "fast.ai", url: "https://www.fast.ai/", type: "course" },
    { name: "Kaggle Learn", url: "https://www.kaggle.com/learn", type: "course" },
  ],
  CMM507: [
    { name: "Purdue OWL", url: "https://owl.purdue.edu/owl/", type: "docs" },
    { name: "RGU Library Guides", url: "https://libguides.rgu.ac.uk/", type: "docs" },
  ],
  CMM531: [
    { name: "Thesis Whisperer", url: "https://thesiswhisperer.com/", type: "community" },
    { name: "Overleaf LaTeX", url: "https://www.overleaf.com/learn", type: "tool" },
  ],
};

export function getSkillResources(skill: string): SkillResource[] {
  return SKILL_RESOURCES[skill] ?? [];
}

export function getResourceTypeIcon(type: SkillResource["type"]): string {
  switch (type) {
    case "course": return "graduation-cap";
    case "docs": return "book-open";
    case "tool": return "wrench";
    case "community": return "users";
  }
}
