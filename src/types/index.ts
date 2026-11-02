export interface DistrictData {
  id: string;
  shapeName: string;
  displayName: string;
  bnName: string;
  division: string;
  color: string;
  famousFor: string;
  area: string;
  population: string;
  isCapital?: boolean;
  centroid: [number, number];
  bbox: [number, number, number, number];
  path: string;
}

export type ViewMode = "explore" | "quiz";

export type Language = "en" | "bn";

export type SeterraAttemptResult = 1 | 2 | 3 | 0; // 1: 1st try, 2: 2nd try, 3: 3rd try, 0: missed (3 fails)

export interface QuizResults {
  scorePercent: number;
  timeSeconds: number;
  firstTryCount: number;
  secondTryCount: number;
  thirdTryCount: number;
  missedCount: number;
  totalQuestions: number;
}
