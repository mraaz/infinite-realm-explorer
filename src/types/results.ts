
export interface Architect {
  identity: string;
  system: string;
  proof: string;
  isCompleted?: boolean;
  completionDate?: string | Date;
  completionNotes?: string;
  streakWeeks?: ('gold' | 'silver' | 'grey')[];
  currentStreak?: number;
}

export interface FutureSelfArchitect extends Architect {
  mainFocus: string;
}

export interface FutureQuestionnaire {
    priorities: {
        mainFocus: string;
    };
    architect: Architect[];
}
