// ============================================================
// Loop - Type Definitions
// ============================================================

export interface User {
  id: string;
  name: string;
  email: string;
  course: string;
  year: number;
}

export interface Module {
  id: string;
  code: string;
  name: string;
  credits: number;
  level: number; // 5 or 6
  assessments: Assessment[];
}

export interface Assessment {
  id: string;
  name: string;
  weight: number; // 0.0 - 1.0
  moduleId: string;
  grade?: Grade;
}

export interface Grade {
  id: string;
  score: number; // 0 - 100
  assessmentId: string;
}

export interface SkillProfile {
  id: string;
  userId: string;
  canTeach: string[];
  needsHelp: string[];
  bio?: string;
  contact?: string;
  user?: User;
}

// ============================================================
// Classification Types
// ============================================================

export type Classification =
  | "First"
  | "Upper Second (2:1)"
  | "Lower Second (2:2)"
  | "Third"
  | "Fail"
  | "Insufficient Data";

export interface ClassificationResult {
  classification: Classification;
  weightedAverage: number;
  level5Average: number | null;
  level6Average: number | null;
  creditsCompleted: number;
  totalCredits: number;
  confidence: number; // 0-1 based on how many grades are entered
}

export interface WhatIfScenario {
  targetGrade: number;
  assessmentId: string;
  assessmentName: string;
  moduleName: string;
}

export interface ProjectionResult {
  currentClassification: ClassificationResult;
  scenarioClassification: ClassificationResult;
  gradeNeeded: number; // what you need on remaining assessments
  message: string;
}

// ============================================================
// Peer Matching Types
// ============================================================

export interface PeerMatch {
  user: User;
  profile: SkillProfile;
  relevanceScore: number; // 0-1
  matchReason: string;
}

// ============================================================
// Campus Stats Types
// ============================================================

export interface ModuleStats {
  moduleCode: string;
  moduleName: string;
  averageGrade: number;
  studentCount: number;
  classificationBreakdown: {
    first: number;
    upperSecond: number;
    lowerSecond: number;
    third: number;
    fail: number;
  };
}

export interface CampusStats {
  totalStudents: number;
  overallClassificationBreakdown: {
    first: number;
    upperSecond: number;
    lowerSecond: number;
    third: number;
  };
  moduleStats: ModuleStats[];
  trendData: { week: string; averageStress: number }[];
}
