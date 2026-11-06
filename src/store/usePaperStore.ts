import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { Board, BlueprintSection, DifficultyMix, GeneratedPaper, InstituteProfile, QuestionSource, SyllabusChapter } from '@/src/types/paper';

export interface PaperDraft {
  selectedBoard: Board;
  customBoardName?: string;
  selectedClass: string;
  customClassName?: string;
  selectedSubject: string;
  customSubjectName?: string;
  selectedChapters: string[];
  customChapters: SyllabusChapter[];
  blueprintSections: BlueprintSection[];
  difficultyMix: DifficultyMix;
  questionSource: QuestionSource;
  examTitle: string;
  durationMinutes: number;
  generalInstructions: string[];
}

interface PaperStore {
  instituteProfile: InstituteProfile;
  savedPapers: GeneratedPaper[];
  draft: PaperDraft;
  activePaper: GeneratedPaper | null;
  updateInstituteProfile: (patch: Partial<InstituteProfile>) => void;
  updateDraft: (patch: Partial<PaperDraft>) => void;
  setActivePaper: (paper: GeneratedPaper | null) => void;
  savePaper: (paper: GeneratedPaper) => void;
  removePaper: (id: string) => void;
  resetDraft: () => void;
}

export const defaultProfile: InstituteProfile = {
  schoolName: 'Delhi Public School, R.K. Puram',
  subtitle: 'Sector XII, R.K. Puram, New Delhi - 110022',
  affiliationNumber: 'CBSE Affiliation No. 2730017 • School Code: 25012',
  sessionYear: 'Academic Session 2026–2027',
  logoUri: null,
  watermarkText: 'PaperCraft AI',
  headerStyle: 'classic_boxed',
  defaultColumns: 1,
  defaultFontSize: 'standard'
};

export const defaultDraft: PaperDraft = {
  selectedBoard: 'CBSE',
  customBoardName: '',
  selectedClass: '10',
  customClassName: '',
  selectedSubject: 'Mathematics',
  customSubjectName: '',
  selectedChapters: [],
  customChapters: [],
  blueprintSections: [
    { id: 'section-a', sectionTitle: 'Section A - Multiple Choice Questions', questionType: 'MCQ', marksPerQuestion: 1, count: 10, difficulty: 'EASY', includeInternalChoices: false },
    { id: 'section-b', sectionTitle: 'Section B - Short Answer Type', questionType: 'SHORT', marksPerQuestion: 2, count: 5, difficulty: 'MEDIUM', includeInternalChoices: true },
    { id: 'section-c', sectionTitle: 'Section C - Long Answer Type', questionType: 'LONG', marksPerQuestion: 5, count: 4, difficulty: 'HARD', includeInternalChoices: true }
  ],
  difficultyMix: { easy: 30, medium: 50, hard: 20 },
  questionSource: 'BALANCED_MIX',
  examTitle: 'Pre-Board Examination',
  durationMinutes: 90,
  generalInstructions: [
    'All questions are compulsory unless internal choice is specified.',
    'Use of calculators or mobile devices is strictly prohibited.',
    'Write your Roll Number neatly in the box provided at the top.'
  ]
};

export const usePaperStore = create<PaperStore>()(
  persist(
    (set) => ({
      instituteProfile: defaultProfile,
      savedPapers: [],
      draft: defaultDraft,
      activePaper: null,
      updateInstituteProfile: (patch) => set((state) => ({ instituteProfile: { ...state.instituteProfile, ...patch } })),
      updateDraft: (patch) => set((state) => ({ draft: { ...state.draft, ...patch } })),
      setActivePaper: (paper) => set({ activePaper: paper }),
      savePaper: (paper) => set((state) => ({ savedPapers: [paper, ...state.savedPapers.filter((item) => item.id !== paper.id)].slice(0, 20), activePaper: paper })),
      removePaper: (id) => set((state) => ({ savedPapers: state.savedPapers.filter((paper) => paper.id !== id) })),
      resetDraft: () => set({ draft: defaultDraft })
    }),
    { name: 'papercraft-ai-storage-v2', storage: createJSONStorage(() => AsyncStorage), partialize: (state) => ({ instituteProfile: state.instituteProfile, savedPapers: state.savedPapers, draft: state.draft }) }
  )
);
