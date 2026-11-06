# PaperCraft AI Architecture Plan

## Product Goal
PaperCraft AI helps Indian school teachers and coaching institutes create print-ready A4 Question Papers, Step-by-Step Marking Schemes, and editable Microsoft Word (`.docx`) files in under 60 seconds. The app is offline-first: local drafts and mock generation work without credentials, while Supabase and Gemini/Groq enhance generation coverage when configured.

## Architecture Highlights & Upgrades
- **Class 1 to Class 12 Full Spectrum**: Dynamic syllabus catalogs covering Primary (Classes 1–5), Middle (Classes 6–8), Secondary (Classes 9–10), and Senior Secondary (Classes 11–12) across CBSE, ICSE, State Boards, and Custom user boards.
- **Hierarchical Reactive Flow**: Board & Grade Selection -> Dynamically Filtered Subjects -> Subject Chapters -> Custom Chapters & Topics.
- **Universal "Other / Custom" Flexibility**: In every selection step (Board, Class, Subject, Chapters, Exam Presets, Instructions), users can select "Other / Custom" to enter their own custom preferences.
- **Question Source Mode**: Three generation modes:
  - *NCERT / Textbook Exercises*
  - *Outside / Exemplar / PYQs / HOTS*
  - *Balanced Mix (Standard Board Style)*
- **Pixel-Perfect A4 Print & PDF Engine**:
  - Official Indian school header formatting with school crest/logo, affiliation number, school code, academic session year, and candidate details box (Roll No character boxes, Name, Section, Date, Invigilator Sign).
  - Continuous question numbering across all sections (Q1 to Q38).
  - KaTeX math delimiters protected from HTML escaping for crisp equation rendering.
  - Strict zero orphan/widow page break prevention (`page-break-inside: avoid`).
  - Space-saver MCQ options grid (1x4 row, 2x2 grid, or vertical stack).
  - 1-Column and 2-Column coaching mode.
- **Interactive Review Workspace**:
  - Micro-actions per question: Swap Question, Make Harder, Make Easier, Mutate Numbers, Add Internal Choice ("OR"), Edit Modal, and Camera Textbook Snap OCR.
  - Global paper difficulty rebalancer ("Make Entire Paper Harder" / "Make Entire Paper Easier").

## File Tree
```text
app/
  _layout.tsx
  (tabs)/_layout.tsx
  (tabs)/index.tsx
  (tabs)/profile.tsx
  create/
    step1-syllabus.tsx
    step2-blueprint.tsx
    step3-review.tsx
    step4-preview.tsx
src/
  constants/syllabusTree.ts
  services/questionEngine.ts
  services/pdfGenerator.ts
  services/docxGenerator.ts
  store/usePaperStore.ts
  types/paper.ts
supabase/migrations/001_questions_schema.sql
global.css
metro.config.js
.cursorrules
ARCHITECTURE_PLAN.md
package.json
tsconfig.json
tailwind.config.js
.env.example
```

## Verification Record
- Strict TypeScript verification (`npm run typecheck`): **0 errors**.
- Dependencies aligned with Expo SDK 58 and React 19.
- Babel configured with `react-refresh` and `react-native-reanimated/plugin`.
- NativeWind v4 styled and integrated with Metro.
