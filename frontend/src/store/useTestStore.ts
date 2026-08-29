import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Test, Question } from '../types';

interface TestDraft extends Omit<Partial<Test>, 'questions'> {
  questions: Question[];
  subjectName?: string;
  topicName?: string;
  subTopicName?: string;
}

interface TestState {
  draft: TestDraft | null;
  setDraft: (test: Partial<TestDraft>) => void;
  updateDraft: (updates: Partial<TestDraft>) => void;
  addQuestions: (questions: Question[]) => void;
  updateQuestion: (index: number, question: Question) => void;
  clearDraft: () => void;
}

export const useTestStore = create<TestState>()(
  persist(
    (set) => ({
      draft: null,
      setDraft: (test) => set({ draft: { ...test, questions: test.questions || [] } as TestDraft }),
      updateDraft: (updates) => set((state) => ({ 
        draft: state.draft ? { ...state.draft, ...updates } : null 
      })),
      addQuestions: (questions) => set((state) => ({
        draft: state.draft ? { ...state.draft, questions: [...state.draft.questions, ...questions] } : null
      })),
      updateQuestion: (index, updatedQuestion) => set((state) => {
        if (!state.draft) return state;
        const newQuestions = [...state.draft.questions];
        newQuestions[index] = updatedQuestion;
        return { draft: { ...state.draft, questions: newQuestions } };
      }),
      clearDraft: () => set({ draft: null })
    }),
    {
      name: 'test-draft-storage',
    }
  )
);
