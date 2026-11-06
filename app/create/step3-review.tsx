import { useEffect, useMemo, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import {
  ArrowLeft,
  Camera,
  ChevronDown,
  ChevronUp,
  Edit3,
  FileText,
  GitBranch,
  Hash,
  Plus,
  RefreshCw,
  Trash2,
  TrendingDown,
  TrendingUp,
  X,
  Zap
} from 'lucide-react-native';
import { getSubjectsForClass } from '@/src/constants/syllabusTree';
import {
  adjustQuestionDifficulty,
  extractQuestionFromCameraImage,
  generateInternalOrChoice,
  generatePaper,
  generateSingleQuestion,
  mutateNumericalValues,
  swapQuestion
} from '@/src/services/questionEngine';
import { usePaperStore } from '@/src/store/usePaperStore';
import type { GeneratedPaper, QuestionItem } from '@/src/types/paper';
import { formatDisplayLatex } from '@/src/utils/textFormatter';

export default function ReviewStepScreen(): React.JSX.Element {
  const { draft, savePaper, setActivePaper } = usePaperStore();
  const [paper, setPaper] = useState<GeneratedPaper | null>(null);
  const [isGenerating, setIsGenerating] = useState(true);
  const [workingId, setWorkingId] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const [editing, setEditing] = useState<QuestionItem | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  // Derive active chapters from syllabus + custom chapters
  const syllabusChapters = useMemo(() => {
    const subjects = getSubjectsForClass(draft.selectedBoard, draft.selectedClass);
    const activeSub = subjects.find((s) => s.name === draft.selectedSubject);
    const officialChapters = activeSub?.chapters ?? [];
    const allChapters = [...officialChapters, ...draft.customChapters];
    const filtered = allChapters.filter((ch) => draft.selectedChapters.includes(ch.code));
    return filtered.length > 0 ? filtered : allChapters.slice(0, 3);
  }, [draft]);

  useEffect(() => {
    let mounted = true;
    setIsGenerating(true);
    void generatePaper({
      examTitle: draft.examTitle,
      board: draft.selectedBoard,
      customBoardName: draft.customBoardName,
      className: draft.selectedClass,
      customClassName: draft.customClassName,
      subject: draft.selectedSubject,
      customSubjectName: draft.customSubjectName,
      durationMinutes: draft.durationMinutes,
      questionSource: draft.questionSource,
      chapters: syllabusChapters,
      sections: draft.blueprintSections,
      generalInstructions: draft.generalInstructions
    })
      .then((generated) => {
        if (mounted) {
          setPaper(generated);
          savePaper(generated);
          setActivePaper(generated);
        }
      })
      .catch(() => {
        if (mounted) Alert.alert('Generation notice', 'Fallback questions loaded for offline test.');
      })
      .finally(() => {
        if (mounted) setIsGenerating(false);
      });

    return () => {
      mounted = false;
    };
  }, [draft, savePaper, setActivePaper, syllabusChapters]);

  const updateQuestion = (questionId: string, updater: (question: QuestionItem) => QuestionItem): void => {
    setPaper((current) => {
      if (!current) return current;
      const updated = {
        ...current,
        sections: current.sections.map((sec) => ({
          ...sec,
          questions: sec.questions.map((q) => (q.id === questionId ? updater(q) : q))
        }))
      };
      return updated;
    });
  };

  const deleteQuestion = (sectionId: string, questionId: string, questionNum: number): void => {
    Alert.alert(
      `Delete Question ${questionNum}?`,
      'Are you sure you want to remove this question from the paper?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Haptics.notificationAsync?.(Haptics.NotificationFeedbackType.Warning);
            setPaper((current) => {
              if (!current) return current;
              const updatedSections = current.sections.map((sec) => {
                if (sec.section.id !== sectionId) return sec;
                return {
                  ...sec,
                  questions: sec.questions.filter((q) => q.id !== questionId)
                };
              });
              const newTotalMarks = updatedSections.reduce(
                (sum, sec) => sum + sec.questions.reduce((s, q) => s + q.marks, 0),
                0
              );
              return {
                ...current,
                sections: updatedSections,
                totalMarks: newTotalMarks
              };
            });
          }
        }
      ]
    );
  };

  const handleAddQuestionToSection = async (sectionId: string): Promise<void> => {
    if (!paper) return;
    const targetSection = paper.sections.find((s) => s.section.id === sectionId);
    if (!targetSection) return;

    Haptics.impactAsync?.(Haptics.ImpactFeedbackStyle.Light);
    const chapter = syllabusChapters[0] ?? {
      code: `${paper.board}_GENERAL`,
      title: `${paper.subject} Core Topics`
    };

    try {
      const newQuestion = await generateSingleQuestion(
        targetSection.section,
        chapter,
        draft.selectedClass,
        draft.questionSource
      );

      setPaper((current) => {
        if (!current) return current;
        const updatedSections = current.sections.map((sec) => {
          if (sec.section.id !== sectionId) return sec;
          return {
            ...sec,
            questions: [...sec.questions, newQuestion]
          };
        });
        const newTotalMarks = updatedSections.reduce(
          (sum, sec) => sum + sec.questions.reduce((s, q) => s + q.marks, 0),
          0
        );
        return {
          ...current,
          sections: updatedSections,
          totalMarks: newTotalMarks
        };
      });
      Haptics.notificationAsync?.(Haptics.NotificationFeedbackType.Success);
    } catch {
      Alert.alert('Notice', 'Could not generate an additional question.');
    }
  };

  // Sync state to persistent store safely outside React render/reducer loops
  useEffect(() => {
    if (paper) {
      savePaper(paper);
      setActivePaper(paper);
    }
  }, [paper, savePaper, setActivePaper]);

  const runQuestionAction = async (question: QuestionItem, action: () => Promise<QuestionItem>): Promise<void> => {
    setWorkingId(question.id);
    Haptics.impactAsync?.(Haptics.ImpactFeedbackStyle.Light);
    try {
      const replacement = await action();
      updateQuestion(question.id, () => replacement);
      Haptics.notificationAsync?.(Haptics.NotificationFeedbackType.Success);
    } catch {
      Alert.alert('Action notice', 'The question could not be updated.');
    } finally {
      setWorkingId(null);
    }
  };

  const saveEdit = (updated: QuestionItem): void => {
    updateQuestion(updated.id, () => updated);
    setEditing(null);
  };

  const shiftAllDifficulty = async (direction: 'HARDER' | 'EASIER'): Promise<void> => {
    if (!paper) return;
    Haptics.notificationAsync?.(Haptics.NotificationFeedbackType.Warning);
    setIsGenerating(true);
    try {
      const updatedSections = await Promise.all(
        paper.sections.map(async (sec) => {
          const updatedQs = await Promise.all(
            sec.questions.map((q) => adjustQuestionDifficulty(q, direction))
          );
          return { ...sec, questions: updatedQs };
        })
      );
      const updatedPaper = { ...paper, sections: updatedSections };
      setPaper(updatedPaper);
    } catch {
      Alert.alert('Notice', 'Could not rebalance paper difficulty.');
    } finally {
      setIsGenerating(false);
    }
  };

  const captureQuestion = async (): Promise<void> => {
    Alert.alert('Snap Question from Book', 'Choose photo source:', [
      { text: 'Camera', onPress: () => void openCapture('camera') },
      { text: 'Photo Library', onPress: () => void openCapture('library') },
      { text: 'Cancel', style: 'cancel' }
    ]);
  };

  const openCapture = async (source: 'camera' | 'library'): Promise<void> => {
    if (isCapturing) return;
    setIsCapturing(true);
    try {
      const result =
        source === 'camera'
          ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], allowsEditing: false, base64: true, quality: 0.75 })
          : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: false, base64: true, quality: 0.75 });

      const base64 = result.assets?.[0]?.base64;
      if (!result.canceled && base64 && paper) {
        const extracted = await extractQuestionFromCameraImage(base64);
        const updated = {
          ...paper,
          sections: paper.sections.map((sec, idx) =>
            idx === 0 ? { ...sec, questions: [...sec.questions, extracted] } : sec
          )
        };
        setPaper(updated);
        Haptics.notificationAsync?.(Haptics.NotificationFeedbackType.Success);
      }
    } catch {
      Alert.alert('Capture notice', 'Please take a clear picture of the textbook question.');
    } finally {
      setIsCapturing(false);
    }
  };

  let runningNumber = 0;

  return (
    <View className="flex-1 bg-canvas">
      {/* Top Header */}
      <View className="bg-canvas px-5 pb-3 pt-14 border-b border-line">
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
            <Text className="text-xs font-bold uppercase tracking-wider text-muted">Step 3 of 4</Text>
            <Text className="text-xs font-semibold text-primary">Review & Refine</Text>
          </View>
          <Pressable
            accessibilityLabel="Open preview"
            accessibilityRole="button"
            onPress={() => {
              if (paper) setActivePaper(paper);
              router.push('/create/step4-preview');
            }}
            className="h-11 w-11 items-center justify-center rounded-xl border border-primary bg-indigo-50 active:bg-indigo-100"
          >
            <FileText color="#4F46E5" size={20} />
          </Pressable>
        </View>

        {/* Progress Bar */}
        <View className="mt-3.5 h-1.5 overflow-hidden rounded-full bg-slate-200">
          <View className="h-full w-3/4 rounded-full bg-primary" />
        </View>

        <Text className="mt-3.5 text-2xl font-bold text-ink">Review & Adjust Questions</Text>
        <Text className="mt-0.5 text-xs text-muted">
          Continuous numbering, 1-tap difficulty shifts, numerical mutation & question swaps.
        </Text>

        {/* Global Paper Difficulty Rebalancing Bar */}
        {!isGenerating && paper && (
          <View className="mt-3 flex-row gap-2">
            <Pressable
              onPress={() => void shiftAllDifficulty('EASIER')}
              className="flex-1 min-h-9 flex-row items-center justify-center rounded-lg border border-line bg-white px-2 py-1 active:bg-slate-50"
            >
              <TrendingDown color="#10B981" size={14} />
              <Text className="ml-1.5 text-[11px] font-bold text-emerald-700">Make Entire Paper Easier</Text>
            </Pressable>
            <Pressable
              onPress={() => void shiftAllDifficulty('HARDER')}
              className="flex-1 min-h-9 flex-row items-center justify-center rounded-lg border border-line bg-white px-2 py-1 active:bg-slate-50"
            >
              <TrendingUp color="#EF4444" size={14} />
              <Text className="ml-1.5 text-[11px] font-bold text-rose-700">Make Entire Paper Harder</Text>
            </Pressable>
          </View>
        )}
      </View>

      {isGenerating ? (
        <GenerationLoading />
      ) : paper ? (
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120, paddingTop: 14 }}
        >
          {paper.sections.map((section) => {
            const sectionTotalMarks = section.questions.length * section.section.marksPerQuestion;
            return (
              <View key={section.section.id} className="mb-6">
                <View className="mb-2.5 flex-row items-center justify-between">
                  <Text className="text-sm font-bold text-ink">{section.section.sectionTitle}</Text>
                  <Text className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-primary">
                    {section.questions.length} Qs • {sectionTotalMarks} Marks
                  </Text>
                </View>

                {section.questions.map((question) => {
                  runningNumber += 1;
                  const currentNumber = runningNumber;
                  const isExpanded = expandedIds.includes(question.id);
                  const isBusy = workingId === question.id;

                  return (
                    <QuestionCard
                      key={question.id}
                      question={question}
                      number={currentNumber}
                      expanded={isExpanded}
                      busy={isBusy}
                      onToggle={() =>
                        setExpandedIds((ids) =>
                          ids.includes(question.id) ? ids.filter((id) => id !== question.id) : [...ids, question.id]
                        )
                      }
                      onSwap={() => void runQuestionAction(question, () => swapQuestion(question))}
                      onHarder={() => void runQuestionAction(question, () => adjustQuestionDifficulty(question, 'HARDER'))}
                      onEasier={() => void runQuestionAction(question, () => adjustQuestionDifficulty(question, 'EASIER'))}
                      onMutate={() => void runQuestionAction(question, () => mutateNumericalValues(question))}
                      onOr={() =>
                        void runQuestionAction(question, async () => ({
                          ...question,
                          orChoiceQuestion: await generateInternalOrChoice(question)
                        }))
                      }
                      onEdit={() => setEditing(question)}
                      onDelete={() => deleteQuestion(section.section.id, question.id, currentNumber)}
                    />
                  );
                })}

                {/* Micro-Action: Add Question to this Section */}
                <Pressable
                  accessibilityRole="button"
                  onPress={() => void handleAddQuestionToSection(section.section.id)}
                  className="mt-1 h-10 flex-row items-center justify-center rounded-xl border border-dashed border-primary/40 bg-indigo-50/40 active:bg-indigo-100/60"
                >
                  <Plus color="#4F46E5" size={15} />
                  <Text className="ml-1.5 text-xs font-semibold text-primary">
                    Add Question to {section.section.sectionTitle.split('-')[0]?.trim() || 'Section'}
                  </Text>
                </Pressable>
              </View>
            );
          })}

          {/* Snap from Textbook OCR Button */}
          <Pressable
            accessibilityRole="button"
            onPress={captureQuestion}
            className="mb-4 h-13 min-h-[48px] flex-row items-center justify-center rounded-2xl border border-primary bg-indigo-50/60 active:bg-indigo-100"
          >
            <Camera color="#4F46E5" size={18} />
            <Text className="ml-2 text-xs font-bold text-primary">
              {isCapturing ? 'Extracting Question with AI Vision…' : '📷 Snap Question from Textbook (OCR)'}
            </Text>
          </Pressable>
        </ScrollView>
      ) : (
        <View className="flex-1 items-center justify-center p-8">
          <Text className="text-base font-bold text-ink">No Questions Generated</Text>
          <Text className="mt-1 text-center text-xs text-muted">
            Go back and check your syllabus and blueprint section selections.
          </Text>
        </View>
      )}

      {/* Sticky Bottom Bar */}
      {!isGenerating && paper && (
        <View className="absolute bottom-0 left-0 right-0 border-t border-line bg-white/95 px-5 py-4">
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              setActivePaper(paper);
              router.push('/create/step4-preview');
            }}
            className="h-12 flex-row items-center justify-center rounded-xl bg-primary active:bg-indigo-700"
          >
            <Text className="text-sm font-bold text-white">Continue to Print-Ready A4 Preview</Text>
            <FileText color="#FFFFFF" size={18} className="ml-2" />
          </Pressable>
        </View>
      )}

      {/* Manual Edit Modal */}
      <Modal visible={editing !== null} transparent animationType="slide" onRequestClose={() => setEditing(null)}>
        {editing && <EditModal question={editing} onCancel={() => setEditing(null)} onSave={saveEdit} />}
      </Modal>
    </View>
  );
}

function QuestionCard({
  question,
  number,
  expanded,
  busy,
  onToggle,
  onSwap,
  onHarder,
  onEasier,
  onMutate,
  onOr,
  onEdit,
  onDelete
}: {
  question: QuestionItem;
  number: number;
  expanded: boolean;
  busy: boolean;
  onToggle: () => void;
  onSwap: () => void;
  onHarder: () => void;
  onEasier: () => void;
  onMutate: () => void;
  onOr: () => void;
  onEdit: () => void;
  onDelete: () => void;
}): React.JSX.Element {
  const diffBg =
    question.difficulty === 'EASY'
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : question.difficulty === 'HARD'
      ? 'bg-rose-50 text-rose-700 border-rose-200'
      : 'bg-amber-50 text-amber-700 border-amber-200';

  // CRITICAL USER FIX: formatDisplayLatex removes raw $ symbols around standalone numbers
  const displayQuestion = formatDisplayLatex(question.questionLatex);
  const displayAnswer = formatDisplayLatex(question.answerKeyLatex);

  return (
    <View className={`mb-3.5 rounded-2xl border border-line bg-white p-3.5 ${busy ? 'opacity-50' : 'opacity-100'}`}>
      {/* Top Meta Bar */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <View className="h-6 w-6 items-center justify-center rounded-full bg-slate-900">
            <Text className="text-[11px] font-bold text-white">{number}</Text>
          </View>
          <Text className="ml-2 text-[11px] font-semibold text-muted" numberOfLines={1}>
            {question.chapterName}
          </Text>
        </View>
        <View className="flex-row items-center gap-1.5">
          <View className={`rounded-md border px-2 py-0.5 ${diffBg}`}>
            <Text className="text-[10px] font-bold uppercase">{question.difficulty}</Text>
          </View>
          <View className="rounded-md bg-slate-100 px-2 py-0.5">
            <Text className="text-[10px] font-bold text-slate-800">[{question.marks}M]</Text>
          </View>
        </View>
      </View>

      {/* Clean Formatted Question Text */}
      <Text className="mt-2.5 text-xs font-semibold leading-5 text-ink">{displayQuestion}</Text>

      {/* MCQ Options Grid with Clean Formatted Text */}
      {question.options && (
        <View className="mt-2.5 flex-row flex-wrap gap-1.5">
          {Object.entries(question.options).map(([k, val]) => (
            <View key={k} className="min-w-[48%] flex-1 rounded-lg bg-slate-50 px-2.5 py-1.5 border border-slate-100">
              <Text className="text-[11px] text-ink leading-4">
                <Text className="font-bold text-primary">({k})</Text> {formatDisplayLatex(val)}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Internal Choice "OR" Question Container */}
      {question.orChoiceQuestion && (
        <View className="mt-3 rounded-xl border border-dashed border-indigo-200 bg-indigo-50/40 p-2.5">
          <Text className="text-center text-[10px] font-bold text-primary tracking-wider uppercase">— OR —</Text>
          <Text className="mt-1 text-xs font-semibold text-ink leading-5">
            {formatDisplayLatex(question.orChoiceQuestion.questionLatex)}
          </Text>
        </View>
      )}

      {/* Step-by-Step Marking Scheme Accordion */}
      <Pressable
        onPress={onToggle}
        className="mt-3 flex-row items-center justify-between rounded-lg bg-emerald-50/70 px-2.5 py-1.5"
      >
        <Text className="text-[11px] font-bold text-emerald-800">✅ Step-by-Step Marking Scheme</Text>
        {expanded ? <ChevronUp color="#065F46" size={14} /> : <ChevronDown color="#065F46" size={14} />}
      </Pressable>
      {expanded && (
        <View className="mt-1.5 rounded-lg border border-emerald-100 bg-white p-2.5">
          <Text className="text-[11px] text-emerald-950 leading-4">{displayAnswer}</Text>
        </View>
      )}

      {/* Micro-Action Bar */}
      <View className="mt-3 flex-row flex-wrap gap-1.5 border-t border-slate-100 pt-2.5">
        <ActionButton label="Swap" icon={<RefreshCw color="#4F46E5" size={12} />} onPress={onSwap} />
        <ActionButton label="Harder" icon={<TrendingUp color="#EF4444" size={12} />} onPress={onHarder} />
        <ActionButton label="Easier" icon={<TrendingDown color="#10B981" size={12} />} onPress={onEasier} />
        <ActionButton label="Numbers" icon={<Hash color="#D97706" size={12} />} onPress={onMutate} />
        {!question.orChoiceQuestion && (
          <ActionButton label="Add 'OR'" icon={<GitBranch color="#6366F1" size={12} />} onPress={onOr} />
        )}
        <ActionButton label="Edit" icon={<Edit3 color="#475569" size={12} />} onPress={onEdit} />
        <ActionButton label="Delete" icon={<Trash2 color="#EF4444" size={12} />} onPress={onDelete} />
      </View>
    </View>
  );
}

function ActionButton({
  label,
  icon,
  onPress
}: {
  label: string;
  icon: React.ReactNode;
  onPress: () => void;
}): React.JSX.Element {
  return (
    <Pressable
      onPress={onPress}
      className="min-h-8 flex-row items-center rounded-lg border border-line bg-slate-50 px-2.5 py-1 active:bg-slate-100"
    >
      {icon}
      <Text className="ml-1 text-[11px] font-semibold text-ink">{label}</Text>
    </Pressable>
  );
}

function EditModal({
  question,
  onCancel,
  onSave
}: {
  question: QuestionItem;
  onCancel: () => void;
  onSave: (q: QuestionItem) => void;
}): React.JSX.Element {
  const [stem, setStem] = useState(question.questionLatex);
  const [answerKey, setAnswerKey] = useState(question.answerKeyLatex);
  const [marks, setMarks] = useState(String(question.marks));

  return (
    <View className="flex-1 justify-end bg-black/50">
      <View className="max-h-[85%] rounded-t-3xl bg-white p-5">
        <View className="flex-row items-center justify-between">
          <Text className="text-base font-bold text-ink">Edit Question Content</Text>
          <Pressable onPress={onCancel}>
            <X color="#64748B" size={20} />
          </Pressable>
        </View>

        <ScrollView className="mt-3">
          <Text className="text-xs font-bold text-muted">Question Stem</Text>
          <TextInput
            multiline
            value={stem}
            onChangeText={setStem}
            className="mt-1 min-h-[90px] rounded-xl border border-line p-3 text-xs text-ink"
          />

          <Text className="mt-3 text-xs font-bold text-muted">Marking Scheme / Answer Key</Text>
          <TextInput
            multiline
            value={answerKey}
            onChangeText={setAnswerKey}
            className="mt-1 min-h-[80px] rounded-xl border border-line p-3 text-xs text-ink"
          />

          <Text className="mt-3 text-xs font-bold text-muted">Marks</Text>
          <TextInput
            keyboardType="number-pad"
            value={marks}
            onChangeText={setMarks}
            className="mt-1 h-10 w-24 rounded-xl border border-line px-3 text-xs font-bold text-ink"
          />
        </ScrollView>

        <View className="mt-4 flex-row gap-3">
          <Pressable
            onPress={onCancel}
            className="h-11 flex-1 items-center justify-center rounded-xl border border-line bg-white"
          >
            <Text className="text-xs font-bold text-ink">Cancel</Text>
          </Pressable>
          <Pressable
            onPress={() =>
              onSave({
                ...question,
                questionLatex: stem,
                answerKeyLatex: answerKey,
                marks: Number(marks) || question.marks
              })
            }
            className="h-11 flex-1 items-center justify-center rounded-xl bg-primary"
          >
            <Text className="text-xs font-bold text-white">Save Changes</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function GenerationLoading(): React.JSX.Element {
  return (
    <View className="flex-1 items-center justify-center p-8">
      <View className="h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 border border-primary">
        <Zap color="#4F46E5" size={28} />
      </View>
      <Text className="mt-4 text-base font-bold text-ink">Assembling Your Question Paper…</Text>
      <Text className="mt-1 text-center text-xs text-muted max-w-xs">
        Aligning NEP-2020 competency, KaTeX equations, and step-by-step marking schemes.
      </Text>
    </View>
  );
}
