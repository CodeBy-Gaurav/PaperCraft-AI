import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ArrowLeft, BookOpen, ChevronDown, Compass, Plus, Scale, Sparkles, Trash2, Zap } from 'lucide-react-native';
import { usePaperStore } from '@/src/store/usePaperStore';
import type { BlueprintSection, QuestionSource, QuestionType } from '@/src/types/paper';

interface Preset {
  title: string;
  subtitle: string;
  duration: number;
  gradeTier: 'PRIMARY' | 'MIDDLE' | 'SECONDARY' | 'SENIOR' | 'ALL';
  sections: BlueprintSection[];
}

const allPresets: Preset[] = [
  // Primary (Classes 1–5)
  {
    title: '20M Primary Unit Test',
    subtitle: 'MCQs & Short Questions • 35 mins',
    duration: 35,
    gradeTier: 'PRIMARY',
    sections: [
      { id: 'p1', sectionTitle: 'Section A - Objective Questions', questionType: 'MCQ', marksPerQuestion: 1, count: 8, difficulty: 'EASY', includeInternalChoices: false },
      { id: 'p2', sectionTitle: 'Section B - Fill in / Short Answer', questionType: 'SHORT', marksPerQuestion: 2, count: 6, difficulty: 'MEDIUM', includeInternalChoices: true }
    ]
  },
  {
    title: '40M Primary Term Exam',
    subtitle: 'Balanced Evaluation • 60 mins',
    duration: 60,
    gradeTier: 'PRIMARY',
    sections: [
      { id: 'p3', sectionTitle: 'Section A - Multiple Choice & Match', questionType: 'MCQ', marksPerQuestion: 1, count: 12, difficulty: 'EASY', includeInternalChoices: false },
      { id: 'p4', sectionTitle: 'Section B - Short Descriptive', questionType: 'SHORT', marksPerQuestion: 2, count: 9, difficulty: 'MEDIUM', includeInternalChoices: true },
      { id: 'p5', sectionTitle: 'Section C - Long / Application', questionType: 'LONG', marksPerQuestion: 5, count: 2, difficulty: 'MEDIUM', includeInternalChoices: true }
    ]
  },
  // Middle (Classes 6–8)
  {
    title: '40M Periodic Assessment',
    subtitle: 'Balanced • 60 mins',
    duration: 60,
    gradeTier: 'MIDDLE',
    sections: [
      { id: 'm1', sectionTitle: 'Section A - Objective / MCQs', questionType: 'MCQ', marksPerQuestion: 1, count: 10, difficulty: 'EASY', includeInternalChoices: false },
      { id: 'm2', sectionTitle: 'Section B - Short Answer', questionType: 'SHORT', marksPerQuestion: 2, count: 5, difficulty: 'MEDIUM', includeInternalChoices: false },
      { id: 'm3', sectionTitle: 'Section C - Long Questions', questionType: 'LONG', marksPerQuestion: 4, count: 5, difficulty: 'HARD', includeInternalChoices: true }
    ]
  },
  {
    title: '50M Half-Yearly Exam',
    subtitle: 'Sections A–D • 90 mins',
    duration: 90,
    gradeTier: 'MIDDLE',
    sections: [
      { id: 'm4', sectionTitle: 'Section A - 1 Mark Questions', questionType: 'MCQ', marksPerQuestion: 1, count: 14, difficulty: 'EASY', includeInternalChoices: false },
      { id: 'm5', sectionTitle: 'Section B - 2 Mark Questions', questionType: 'SHORT', marksPerQuestion: 2, count: 6, difficulty: 'MEDIUM', includeInternalChoices: false },
      { id: 'm6', sectionTitle: 'Section C - 3 Mark Questions', questionType: 'SHORT', marksPerQuestion: 3, count: 4, difficulty: 'MEDIUM', includeInternalChoices: true },
      { id: 'm7', sectionTitle: 'Section D - 6 Mark Long Answers', questionType: 'LONG', marksPerQuestion: 6, count: 2, difficulty: 'HARD', includeInternalChoices: true }
    ]
  },
  // Secondary / Senior (Classes 9–12)
  {
    title: 'CBSE 80M Board Pattern',
    subtitle: 'Sections A–E (38 Qs) • 180 mins',
    duration: 180,
    gradeTier: 'SECONDARY',
    sections: [
      { id: 'b1', sectionTitle: 'Section A - Multiple Choice (1M)', questionType: 'MCQ', marksPerQuestion: 1, count: 20, difficulty: 'MEDIUM', includeInternalChoices: false },
      { id: 'b2', sectionTitle: 'Section B - Very Short Answer (2M)', questionType: 'SHORT', marksPerQuestion: 2, count: 5, difficulty: 'MEDIUM', includeInternalChoices: true },
      { id: 'b3', sectionTitle: 'Section C - Short Answer (3M)', questionType: 'SHORT', marksPerQuestion: 3, count: 6, difficulty: 'MEDIUM', includeInternalChoices: true },
      { id: 'b4', sectionTitle: 'Section D - Long Answer (5M)', questionType: 'LONG', marksPerQuestion: 5, count: 4, difficulty: 'HARD', includeInternalChoices: true },
      { id: 'b5', sectionTitle: 'Section E - Case-Based / Source (4M)', questionType: 'CASE_STUDY', marksPerQuestion: 4, count: 3, difficulty: 'HARD', includeInternalChoices: true }
    ]
  },
  {
    title: '70M Science Theory Pattern',
    subtitle: 'Physics/Chem/Bio (33 Qs) • 180 mins',
    duration: 180,
    gradeTier: 'SENIOR',
    sections: [
      { id: 's1', sectionTitle: 'Section A - 16 MCQs / Assertion Reason', questionType: 'MCQ', marksPerQuestion: 1, count: 16, difficulty: 'MEDIUM', includeInternalChoices: false },
      { id: 's2', sectionTitle: 'Section B - 5 Very Short (2M)', questionType: 'SHORT', marksPerQuestion: 2, count: 5, difficulty: 'MEDIUM', includeInternalChoices: true },
      { id: 's3', sectionTitle: 'Section C - 7 Short Answer (3M)', questionType: 'SHORT', marksPerQuestion: 3, count: 7, difficulty: 'MEDIUM', includeInternalChoices: true },
      { id: 's4', sectionTitle: 'Section D - 2 Case Studies (4M)', questionType: 'CASE_STUDY', marksPerQuestion: 4, count: 2, difficulty: 'HARD', includeInternalChoices: true },
      { id: 's5', sectionTitle: 'Section E - 3 Long Answer (5M)', questionType: 'LONG', marksPerQuestion: 5, count: 3, difficulty: 'HARD', includeInternalChoices: true }
    ]
  },
  {
    title: '25M Weekly Coaching Test',
    subtitle: 'Rapid Topic Test • 45 mins',
    duration: 45,
    gradeTier: 'ALL',
    sections: [
      { id: 'c1', sectionTitle: 'Section A - Objective Type', questionType: 'MCQ', marksPerQuestion: 1, count: 10, difficulty: 'EASY', includeInternalChoices: false },
      { id: 'c2', sectionTitle: 'Section B - Numerical & Concept', questionType: 'SHORT', marksPerQuestion: 3, count: 5, difficulty: 'MEDIUM', includeInternalChoices: true }
    ]
  }
];

const questionTypes: { label: string; value: QuestionType }[] = [
  { label: 'MCQ', value: 'MCQ' },
  { label: 'Assertion / Reason', value: 'ASSERTION_REASON' },
  { label: 'Short Answer', value: 'SHORT' },
  { label: 'Long Answer', value: 'LONG' },
  { label: 'Case Study', value: 'CASE_STUDY' }
];

export default function BlueprintStepScreen(): React.JSX.Element {
  const { draft, updateDraft } = usePaperStore();
  const [newInstruction, setNewInstruction] = useState('');
  const [customInstructions, setCustomInstructions] = useState<string[]>(
    draft.generalInstructions && draft.generalInstructions.length > 0
      ? draft.generalInstructions
      : [
          'All questions are compulsory unless internal choice is specified.',
          'Use of calculators or mobile devices is strictly prohibited.',
          'Write your Roll Number neatly in the box provided at the top.'
        ]
  );

  const classNum = parseInt(draft.selectedClass, 10);
  const relevantPresets = useMemo(() => {
    if (!Number.isNaN(classNum)) {
      if (classNum <= 5) return allPresets.filter((p) => p.gradeTier === 'PRIMARY' || p.gradeTier === 'ALL');
      if (classNum <= 8) return allPresets.filter((p) => p.gradeTier === 'MIDDLE' || p.gradeTier === 'ALL');
      if (classNum <= 10) return allPresets.filter((p) => p.gradeTier === 'SECONDARY' || p.gradeTier === 'ALL');
      return allPresets.filter((p) => p.gradeTier === 'SENIOR' || p.gradeTier === 'SECONDARY' || p.gradeTier === 'ALL');
    }
    return allPresets;
  }, [classNum]);

  const totalQuestions = useMemo(
    () => draft.blueprintSections.reduce((sum, section) => sum + section.count, 0),
    [draft.blueprintSections]
  );

  const totalMarks = useMemo(
    () => draft.blueprintSections.reduce((sum, section) => sum + section.count * section.marksPerQuestion, 0),
    [draft.blueprintSections]
  );

  const setQuestionSource = (source: QuestionSource): void => {
    Haptics.selectionAsync();
    updateDraft({ questionSource: source });
  };

  const applyPreset = (preset: Preset): void => {
    Haptics.selectionAsync();
    updateDraft({
      blueprintSections: preset.sections,
      durationMinutes: preset.duration,
      examTitle: preset.title
    });
  };

  const setDifficultyPreset = (easy: number, medium: number, hard: number): void => {
    Haptics.selectionAsync();
    updateDraft({ difficultyMix: { easy, medium, hard } });
  };

  const updateSection = (id: string, patch: Partial<BlueprintSection>): void => {
    updateDraft({
      blueprintSections: draft.blueprintSections.map((s) => (s.id === id ? { ...s, ...patch } : s))
    });
  };

  const addSection = (): void => {
    Haptics.selectionAsync();
    const nextChar = String.fromCharCode(65 + draft.blueprintSections.length);
    const newSec: BlueprintSection = {
      id: `section-${Date.now()}`,
      sectionTitle: `Section ${nextChar} - New Section`,
      questionType: 'SHORT',
      marksPerQuestion: 2,
      count: 5,
      difficulty: 'MEDIUM',
      includeInternalChoices: true
    };
    updateDraft({ blueprintSections: [...draft.blueprintSections, newSec] });
  };

  const removeSection = (id: string): void => {
    Haptics.selectionAsync();
    updateDraft({ blueprintSections: draft.blueprintSections.filter((s) => s.id !== id) });
  };

  const addCustomInstruction = (): void => {
    if (!newInstruction.trim()) return;
    setCustomInstructions((prev) => [...prev, newInstruction.trim()]);
    setNewInstruction('');
  };

  const removeInstruction = (index: number): void => {
    Haptics.selectionAsync();
    setCustomInstructions((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <View className="flex-1 bg-canvas">
      {/* Header */}
      <View className="bg-canvas px-5 pb-3 pt-14">
        <View className="flex-row items-center justify-between">
          <Pressable
            accessibilityLabel="Go back"
            accessibilityRole="button"
            onPress={() => router.back()}
            className="h-11 w-11 items-center justify-center rounded-xl border border-line bg-white active:bg-slate-50"
          >
            <ArrowLeft color="#0F172A" size={20} />
          </Pressable>
          <View className="items-center">
            <Text className="text-xs font-bold uppercase tracking-wider text-muted">Step 2 of 4</Text>
            <Text className="text-xs font-semibold text-primary">Blueprint & Layout</Text>
          </View>
          <View className="w-11" />
        </View>

        {/* Progress Bar */}
        <View className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-200">
          <View className="h-full w-2/4 rounded-full bg-primary" />
        </View>

        <Text className="mt-4 text-2xl font-bold text-ink">Design Exam Blueprint</Text>
        <Text className="mt-1 text-xs text-muted">
          Configure question sources, sections, timing, marks, and difficulty level.
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 140 }}
      >
        {/* Exam Title & Timing Inputs */}
        <View className="mt-4 flex-row gap-3">
          <View className="flex-1">
            <Text className="mb-1 text-xs font-bold uppercase text-muted">Exam Heading / Title</Text>
            <TextInput
              accessibilityLabel="Exam title"
              value={draft.examTitle}
              onChangeText={(examTitle) => updateDraft({ examTitle })}
              placeholder="e.g. Pre-Board Examination 2026-27"
              placeholderTextColor="#94A3B8"
              className="h-11 rounded-xl border border-line bg-white px-3 text-sm font-semibold text-ink"
            />
          </View>
          <View className="w-28">
            <Text className="mb-1 text-xs font-bold uppercase text-muted">Duration</Text>
            <View className="h-11 flex-row items-center rounded-xl border border-line bg-white px-3">
              <TextInput
                accessibilityLabel="Time allowed in minutes"
                keyboardType="number-pad"
                value={String(draft.durationMinutes)}
                onChangeText={(val) => updateDraft({ durationMinutes: Number(val) || 1 })}
                className="flex-1 text-sm font-bold text-ink"
              />
              <Text className="text-xs text-muted">mins</Text>
            </View>
          </View>
        </View>

        {/* NEW REQUIREMENT: Question Source Mode Selection */}
        <View className="mt-6">
          <Text className="mb-2 text-xs font-bold uppercase tracking-wider text-muted">
            Question Source Selection
          </Text>
          <View className="flex-row gap-2">
            <Pressable
              accessibilityRole="radio"
              accessibilityState={{ checked: draft.questionSource === 'TEXTBOOK_EXERCISE' }}
              onPress={() => setQuestionSource('TEXTBOOK_EXERCISE')}
              className={`flex-1 rounded-xl border p-3 ${
                draft.questionSource === 'TEXTBOOK_EXERCISE'
                  ? 'border-primary bg-indigo-50'
                  : 'border-line bg-white'
              }`}
            >
              <BookOpen color={draft.questionSource === 'TEXTBOOK_EXERCISE' ? '#4F46E5' : '#64748B'} size={18} />
              <Text className="mt-2 text-xs font-bold text-ink">Textbook Exercises</Text>
              <Text className="mt-1 text-[10px] text-muted">NCERT in-text & back exercises</Text>
            </Pressable>

            <Pressable
              accessibilityRole="radio"
              accessibilityState={{ checked: draft.questionSource === 'OUTSIDE_EXEMPLAR' }}
              onPress={() => setQuestionSource('OUTSIDE_EXEMPLAR')}
              className={`flex-1 rounded-xl border p-3 ${
                draft.questionSource === 'OUTSIDE_EXEMPLAR'
                  ? 'border-primary bg-indigo-50'
                  : 'border-line bg-white'
              }`}
            >
              <Compass color={draft.questionSource === 'OUTSIDE_EXEMPLAR' ? '#4F46E5' : '#64748B'} size={18} />
              <Text className="mt-2 text-xs font-bold text-ink">Outside / Exemplar</Text>
              <Text className="mt-1 text-[10px] text-muted">PYQs, HOTS & Competency tests</Text>
            </Pressable>

            <Pressable
              accessibilityRole="radio"
              accessibilityState={{ checked: draft.questionSource === 'BALANCED_MIX' }}
              onPress={() => setQuestionSource('BALANCED_MIX')}
              className={`flex-1 rounded-xl border p-3 ${
                draft.questionSource === 'BALANCED_MIX'
                  ? 'border-primary bg-indigo-50'
                  : 'border-line bg-white'
              }`}
            >
              <Scale color={draft.questionSource === 'BALANCED_MIX' ? '#4F46E5' : '#64748B'} size={18} />
              <Text className="mt-2 text-xs font-bold text-ink">Balanced Mix</Text>
              <Text className="mt-1 text-[10px] text-muted">60% Core + 40% Application</Text>
            </Pressable>
          </View>
        </View>

        {/* Exam Presets Carousel */}
        <View className="mt-6">
          <Text className="mb-2 text-xs font-bold uppercase tracking-wider text-muted">
            1-Tap Preset Templates
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-1">
            <View className="flex-row gap-2.5 px-1">
              {relevantPresets.map((preset) => (
                <Pressable
                  key={preset.title}
                  accessibilityRole="button"
                  onPress={() => applyPreset(preset)}
                  className="w-56 rounded-2xl border border-line bg-white p-3.5 active:border-primary"
                >
                  <Text className="font-bold text-ink">{preset.title}</Text>
                  <Text className="mt-1.5 text-xs text-muted leading-4">{preset.subtitle}</Text>
                  <View className="mt-3 flex-row items-center">
                    <Zap color="#F59E0B" size={14} />
                    <Text className="ml-1 text-xs font-semibold text-amber-600">Apply Template</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Difficulty Mix Controls */}
        <View className="mt-6">
          <View className="mb-2 flex-row items-center justify-between">
            <Text className="text-xs font-bold uppercase tracking-wider text-muted">Difficulty Mix</Text>
            <View className="flex-row gap-1.5">
              <Pressable
                onPress={() => setDifficultyPreset(50, 40, 10)}
                className="rounded-md bg-emerald-50 px-2 py-1"
              >
                <Text className="text-[10px] font-bold text-emerald-700">Beginner</Text>
              </Pressable>
              <Pressable
                onPress={() => setDifficultyPreset(30, 50, 20)}
                className="rounded-md bg-amber-50 px-2 py-1"
              >
                <Text className="text-[10px] font-bold text-amber-700">Balanced</Text>
              </Pressable>
              <Pressable
                onPress={() => setDifficultyPreset(15, 45, 40)}
                className="rounded-md bg-rose-50 px-2 py-1"
              >
                <Text className="text-[10px] font-bold text-rose-700">Rigorous</Text>
              </Pressable>
            </View>
          </View>

          <View className="rounded-2xl border border-line bg-white p-4">
            {/* Visual Bar */}
            <View className="h-3 flex-row overflow-hidden rounded-full">
              <View style={{ width: `${draft.difficultyMix.easy}%` }} className="bg-emerald-500" />
              <View style={{ width: `${draft.difficultyMix.medium}%` }} className="bg-amber-400" />
              <View style={{ width: `${draft.difficultyMix.hard}%` }} className="bg-rose-500" />
            </View>

            <View className="mt-3 flex-row justify-between">
              <View className="w-[31%]">
                <Text className="text-[11px] font-bold text-emerald-600">Easy ({draft.difficultyMix.easy}%)</Text>
                <Text className="text-[10px] text-muted">Foundational Recall</Text>
              </View>
              <View className="w-[31%]">
                <Text className="text-[11px] font-bold text-amber-600">Medium ({draft.difficultyMix.medium}%)</Text>
                <Text className="text-[10px] text-muted">Analytical / Calc</Text>
              </View>
              <View className="w-[31%]">
                <Text className="text-[11px] font-bold text-rose-600">Hard / HOTS ({draft.difficultyMix.hard}%)</Text>
                <Text className="text-[10px] text-muted">Critical Thinking</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Section Cards */}
        <View className="mt-7">
          <View className="mb-2 flex-row items-center justify-between">
            <Text className="text-xs font-bold uppercase tracking-wider text-muted">
              Sections & Mark Allocation
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={addSection}
              className="h-8 flex-row items-center rounded-lg bg-indigo-50 px-3 active:bg-indigo-100"
            >
              <Plus color="#4F46E5" size={15} />
              <Text className="ml-1 text-xs font-bold text-primary">Add Section</Text>
            </Pressable>
          </View>

          {draft.blueprintSections.map((sec, idx) => (
            <View key={sec.id} className="mb-3 rounded-2xl border border-line bg-white p-3.5">
              <View className="flex-row items-center">
                <View className="h-7 w-7 items-center justify-center rounded-lg bg-indigo-50">
                  <Text className="font-bold text-primary text-xs">{String.fromCharCode(65 + idx)}</Text>
                </View>
                <TextInput
                  accessibilityLabel={`Section ${idx + 1} Title`}
                  value={sec.sectionTitle}
                  onChangeText={(val) => updateSection(sec.id, { sectionTitle: val })}
                  placeholder="Section Title (e.g. Section A - Objective)"
                  placeholderTextColor="#94A3B8"
                  className="ml-2 flex-1 font-bold text-ink text-xs"
                />
                {draft.blueprintSections.length > 1 && (
                  <Pressable
                    accessibilityLabel="Delete Section"
                    onPress={() => removeSection(sec.id)}
                    className="h-8 w-8 items-center justify-center"
                  >
                    <Trash2 color="#EF4444" size={15} />
                  </Pressable>
                )}
              </View>

              <View className="mt-3 flex-row gap-2">
                <SelectField
                  label="Question Type"
                  value={questionTypes.find((t) => t.value === sec.questionType)?.label ?? 'MCQ'}
                  options={questionTypes.map((t) => t.label)}
                  onSelect={(lbl) => {
                    const match = questionTypes.find((t) => t.label === lbl);
                    if (match) updateSection(sec.id, { questionType: match.value });
                  }}
                />
                <NumberField
                  label="Count"
                  value={sec.count}
                  onChange={(count) => updateSection(sec.id, { count })}
                />
                <NumberField
                  label="Marks each"
                  value={sec.marksPerQuestion}
                  onChange={(marksPerQuestion) => updateSection(sec.id, { marksPerQuestion })}
                />
              </View>

              <View className="mt-3 flex-row items-center justify-between border-t border-slate-100 pt-2.5">
                <Text className="text-xs text-muted">Internal Choice (“OR” Question)</Text>
                <Pressable
                  accessibilityRole="switch"
                  accessibilityState={{ checked: sec.includeInternalChoices }}
                  onPress={() => updateSection(sec.id, { includeInternalChoices: !sec.includeInternalChoices })}
                  className={`h-6 w-11 justify-center rounded-full p-0.5 ${
                    sec.includeInternalChoices ? 'bg-primary' : 'bg-slate-200'
                  }`}
                >
                  <View
                    className={`h-5 w-5 rounded-full bg-white shadow-sm ${
                      sec.includeInternalChoices ? 'ml-5' : ''
                    }`}
                  />
                </Pressable>
              </View>
            </View>
          ))}
        </View>

        {/* General Instructions Box with Custom Input */}
        <View className="mt-6">
          <Text className="mb-2 text-xs font-bold uppercase tracking-wider text-muted">
            General Instructions for Candidates
          </Text>
          <View className="rounded-2xl border border-line bg-white p-3.5">
            {customInstructions.map((inst, i) => (
              <View key={i} className="mb-2 flex-row items-center justify-between rounded-lg bg-slate-50 px-2.5 py-1.5 border border-slate-100">
                <View className="flex-1 flex-row items-start mr-2">
                  <Text className="text-xs font-bold text-muted mr-1.5">{i + 1}.</Text>
                  <Text className="flex-1 text-xs text-ink leading-4">{inst}</Text>
                </View>
                <Pressable
                  accessibilityLabel={`Remove instruction ${i + 1}`}
                  onPress={() => removeInstruction(i)}
                  className="p-1"
                >
                  <Trash2 color="#94A3B8" size={14} />
                </Pressable>
              </View>
            ))}

            {/* Custom instruction input */}
            <View className="mt-2.5 flex-row gap-2">
              <TextInput
                value={newInstruction}
                onChangeText={setNewInstruction}
                placeholder="➕ Write your own custom instruction..."
                placeholderTextColor="#94A3B8"
                className="h-9 flex-1 rounded-lg border border-line bg-slate-50 px-2.5 text-xs text-ink"
              />
              <Pressable
                onPress={addCustomInstruction}
                disabled={!newInstruction.trim()}
                className={`h-9 items-center justify-center rounded-lg px-3 ${
                  newInstruction.trim() ? 'bg-primary' : 'bg-slate-200'
                }`}
              >
                <Text className={`text-xs font-bold ${newInstruction.trim() ? 'text-white' : 'text-slate-400'}`}>
                  Add
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Action Bar */}
      <View className="absolute bottom-0 left-0 right-0 border-t border-line bg-white/95 px-5 py-4">
        <View className="mb-2 flex-row justify-between">
          <Text className="text-xs font-semibold text-muted">{totalQuestions} Total Questions</Text>
          <Text className="text-sm font-bold text-primary">{totalMarks} Maximum Marks</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            updateDraft({ generalInstructions: customInstructions });
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            router.push('/create/step3-review');
          }}
          className="h-12 flex-row items-center justify-center rounded-xl bg-primary"
        >
          <Sparkles color="#FFFFFF" size={18} />
          <Text className="ml-2 font-bold text-white">Generate Question Paper</Text>
        </Pressable>
      </View>
    </View>
  );
}

function NumberField({
  label,
  value,
  onChange
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}): React.JSX.Element {
  return (
    <View className="flex-1">
      <Text className="mb-1 text-[10px] font-bold uppercase text-muted">{label}</Text>
      <TextInput
        accessibilityLabel={label}
        keyboardType="number-pad"
        value={String(value)}
        onChangeText={(text) => onChange(Math.max(1, Number(text) || 1))}
        className="h-9 rounded-lg bg-slate-50 px-2 text-xs font-semibold text-ink"
      />
    </View>
  );
}

function SelectField({
  label,
  value,
  options,
  onSelect
}: {
  label: string;
  value: string;
  options: string[];
  onSelect: (value: string) => void;
}): React.JSX.Element {
  return (
    <View className="flex-[1.6]">
      <Text className="mb-1 text-[10px] font-bold uppercase text-muted">{label}</Text>
      <Pressable
        accessibilityRole="button"
        onPress={() => {
          const current = options.indexOf(value);
          onSelect(options[(current + 1) % options.length] ?? options[0] ?? value);
        }}
        className="h-9 flex-row items-center justify-between rounded-lg bg-slate-50 px-2"
      >
        <Text numberOfLines={1} className="flex-1 text-xs font-semibold text-ink">
          {value}
        </Text>
        <ChevronDown color="#64748B" size={14} />
      </Pressable>
    </View>
  );
}
