
import { create } from 'zustand';
import { produce } from 'immer';
import { questions, Question, Pillar } from '@/data/questions';

type Answers = Record<string, any>;

type QuestionnaireState = {
  questionFlow: Question[];
  currentQuestionIndex: number;
  answers: Answers;
  futureQuestionnaire?: any;
  actions: {
    startRetake: () => void;
    answerQuestion: (questionId: string, answer: any) => void;
    setAnswer: (questionId: string, answer: any) => void;
    nextQuestion: () => void;
    previousQuestion: () => void;
    getCurrentQuestion: () => Question | undefined;
    getProgress: () => { total: number, answered: number, overallPercentage: number, pillarPercentages: Record<Pillar, number> };
    setFutureQuestionnaire: (data: any) => void;
  }
};

const initialQuestions = questions.filter(q => !q.id.endsWith('_follow_up'));

export const useQuestionnaireStore = create<QuestionnaireState>((set, get) => ({
  questionFlow: [...initialQuestions],
  currentQuestionIndex: 0,
  answers: {},
  futureQuestionnaire: undefined,
  actions: {
    startRetake: () => {
      set({ currentQuestionIndex: 0 });
    },
    answerQuestion: (questionId, answer) => {
      set(produce((state: QuestionnaireState) => {
        state.answers[questionId] = answer;
        
        // Handle follow-up questions
        let newFlow = [...initialQuestions];
        const answeredQuestions: Record<string, any> = state.answers;

        const addFollowUp = (triggerId: string, triggerAnswer: string | string[], followUpId: string) => {
          if (Array.isArray(triggerAnswer) ? triggerAnswer.includes(answeredQuestions[triggerId]) : answeredQuestions[triggerId] === triggerAnswer) {
            const followUpQuestion = questions.find(q => q.id === followUpId);
            if (followUpQuestion) {
              const triggerIndex = newFlow.findIndex(q => q.id === triggerId);
              if (triggerIndex !== -1 && !newFlow.some(q => q.id === followUpId)) {
                newFlow.splice(triggerIndex + 1, 0, followUpQuestion);
              }
            }
          }
        };

        addFollowUp('career_situation', 'Self-Employed/Freelancer', 'career_challenge_follow_up');
        addFollowUp('financial_situation', 'Living paycheque to paycheque', 'financial_reason_follow_up');
        if (answeredQuestions['health_activity'] <= 1) {
            addFollowUp('health_activity', answeredQuestions['health_activity'], 'health_barrier_follow_up');
        }
        if (answeredQuestions['connections_belonging'] < 5) {
            addFollowUp('connections_belonging', answeredQuestions['connections_belonging'], 'connections_priority_follow_up');
        }

        state.questionFlow = newFlow;
      }));
    },
    setAnswer: (questionId, answer) => {
      set(produce((state: QuestionnaireState) => {
        state.answers[questionId] = answer;
      }));
    },
    nextQuestion: () => {
      set(state => ({
        currentQuestionIndex: Math.min(state.currentQuestionIndex + 1, state.questionFlow.length),
      }));
    },
    previousQuestion: () => {
      set(state => ({
        currentQuestionIndex: Math.max(state.currentQuestionIndex - 1, 0),
      }));
    },
    getCurrentQuestion: () => {
      const { questionFlow, currentQuestionIndex } = get();
      return questionFlow[currentQuestionIndex];
    },
    getProgress: () => {
      const { questionFlow, answers } = get();
      const answeredCount = Object.keys(answers).filter(id => questionFlow.some(q => q.id === id)).length;
      
      const pillarTotals: Record<Pillar, number> = { Career: 0, Finances: 0, Health: 0, Connections: 0 };
      const pillarAnswered: Record<Pillar, number> = { Career: 0, Finances: 0, Health: 0, Connections: 0 };

      questionFlow.forEach(q => {
        if (q.pillar !== 'Basics') {
          pillarTotals[q.pillar]++;
          if (answers[q.id] !== undefined) {
            pillarAnswered[q.pillar]++;
          }
        }
      });

      const pillarPercentages = Object.fromEntries(
        Object.keys(pillarTotals).map(p => [
          p as Pillar,
          pillarTotals[p as Pillar] > 0 ? (pillarAnswered[p as Pillar] / pillarTotals[p as Pillar]) * 100 : 0
        ])
      ) as Record<Pillar, number>;

      return {
        total: questionFlow.length,
        answered: answeredCount,
        overallPercentage: questionFlow.length > 0 ? (answeredCount / questionFlow.length) * 100 : 0,
        pillarPercentages
      };
    },
    setFutureQuestionnaire: (data: any) => {
      set({ futureQuestionnaire: data });
    },
  }
}));
