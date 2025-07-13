// Additional types for future questionnaire components

export type ProgressState = "pending" | "current" | "completed";

export interface PillarProgress {
  [key: string]: ProgressState;
}