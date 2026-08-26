import { create } from 'zustand';
import { Test, Question } from '../types';

interface TestDraft extends Partial<Test> {
  questions: Question[];
}

interface TestState {
  draft: TestDraft | null;
  setDraft: (test: Partial<Test>) => void;
  updateDraft: (updates: Partial<Test>) => void;
  addQuestions: (questions: Question[]) => void;
  clearDraft: () => void;
}

export const useTestStore = create<TestState>((set) => ({
  draft: null,
  setDraft: (test) => set({ draft: { ...test, questions: [] } }),
  updateDraft: (updates) => set((state) => ({ 
    draft: state.draft ? { ...state.draft, ...updates } : null 
  })),
  addQuestions: (questions) => set((state) => ({
    draft: state.draft ? { ...state.draft, questions: [...state.draft.questions, ...questions] } : null
  })),
  clearDraft: () => set({ draft: null })
}));
