export type HeaderStyle = 'classic_boxed' | 'modern_minimal' | 'compact_coaching';
export type FontSizePreset = 'compact' | 'standard' | 'large';
export type Board = 'CBSE' | 'ICSE' | 'STATE_BOARD' | 'OTHER';
export type QuestionType = 'MCQ' | 'ASSERTION_REASON' | 'SHORT' | 'LONG' | 'CASE_STUDY';
export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';
export type QuestionSource = 'TEXTBOOK_EXERCISE' | 'OUTSIDE_EXEMPLAR' | 'BALANCED_MIX';

export interface InstituteProfile {
  schoolName: string;
  subtitle: string;
  affiliationNumber?: string;
  sessionYear?: string;
  logoUri: string | null;
  watermarkText: string;
  headerStyle: HeaderStyle;
  defaultColumns: 1 | 2;
  defaultFontSize: FontSizePreset;
}

export interface QuestionOptions {
  A: string;
  B: string;
  C: string;
  D: string;
}

export interface QuestionItem {
  id: string;
  syllabusCode: string;
  chapterName: string;
  questionType: QuestionType;
  difficulty: Difficulty;
  marks: number;
  questionLatex: string;
  options: QuestionOptions | null;
  answerKeyLatex: string;
  diagramSvg?: string;
  orChoiceQuestion?: QuestionItem;
}

export interface BlueprintSection {
  id: string;
  sectionTitle: string;
  questionType: QuestionType;
  marksPerQuestion: number;
  count: number;
  difficulty: Difficulty;
  includeInternalChoices: boolean;
}

export interface GeneratedSection {
  section: BlueprintSection;
  questions: QuestionItem[];
}

export interface GeneratedPaper {
  id: string;
  examTitle: string;
  board: Board;
  customBoardName?: string;
  className: string;
  subject: string;
  durationMinutes: number;
  totalMarks: number;
  questionSource?: QuestionSource;
  generalInstructions: string[];
  sections: GeneratedSection[];
  createdAt: string;
}

export interface SyllabusChapter {
  code: string;
  title: string;
}

export interface SyllabusSubject {
  name: string;
  icon: string;
  chapters: SyllabusChapter[];
}

export type SyllabusTree = Record<string, Record<string, SyllabusSubject[]>>;

export interface DifficultyMix {
  easy: number;
  medium: number;
  hard: number;
}
