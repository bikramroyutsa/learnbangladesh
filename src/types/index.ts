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

export interface QuizQuestion {
  targetDistrict: DistrictData;
  options: DistrictData[];
}

