
export interface SurveySession {
  id: string;
  user_id: string;
  status: 'in_progress' | 'completed';
  answers: Record<string, any>;
  created_at: string;
  updated_at: string;
  is_public?: boolean;
}

export const PENDING_ANSWERS_KEY = 'pendingAnswers';
export const PENDING_STEP_KEY = 'pendingStep';
