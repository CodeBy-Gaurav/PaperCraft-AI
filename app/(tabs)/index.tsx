import { useMemo } from 'react';
import { Alert, Image, Pressable, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import {
  ArrowRight,
  Building2,
  ChevronRight,
  Clock3,
  FileText,
  Plus,
  Sparkles,
  Trash2
} from 'lucide-react-native';
import { usePaperStore } from '@/src/store/usePaperStore';
import { AppFooter } from '@/src/components/AppFooter';

export default function DashboardScreen(): React.JSX.Element {
  const { savedPapers, instituteProfile, setActivePaper, removePaper } = usePaperStore();
  const totalQuestions = useMemo(
    () =>
      savedPapers.reduce(
        (sum, paper) =>
          sum + paper.sections.reduce((sectionSum, section) => sectionSum + section.questions.length, 0),
        0
      ),
    [savedPapers]
  );

  const handleDeletePaper = (paperId: string, title: string): void => {
    Haptics.notificationAsync?.(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      'Delete Question Paper?',
      `Are you sure you want to delete "${title}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            removePaper(paperId);
            Haptics.notificationAsync?.(Haptics.NotificationFeedbackType.Success);
          }
        }
      ]
    );
  };

  return (
    <ScrollView
      className="flex-1 bg-canvas"
      contentContainerStyle={{ padding: 20, paddingTop: 64, paddingBottom: 36 }}
    >
      <View className="mb-7 flex-row items-start justify-between">
        <View className="flex-1 pr-4">
          <Text className="text-sm font-semibold uppercase tracking-widest text-primary">PaperCraft AI</Text>
          <Text className="mt-2 text-3xl font-bold text-ink">Good morning, teacher.</Text>
          <Text className="mt-2 text-base leading-6 text-muted">Build a balanced, print-ready paper in minutes.</Text>
        </View>
        <Image
          source={require('@/assets/icon.png')}
          className="h-14 w-14 rounded-2xl border border-indigo-200"
          resizeMode="cover"
        />
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Create new question paper"
        onPress={() => {
          usePaperStore.getState().resetDraft();
          router.push('/create/step1-syllabus');
        }}
        className="rounded-3xl bg-primary p-5 shadow-sm active:opacity-90"
      >
        <View className="flex-row items-center justify-between">
          <View className="h-11 w-11 items-center justify-center rounded-2xl bg-white/20">
            <Sparkles color="#FFFFFF" size={22} />
          </View>
          <ArrowRight color="#FFFFFF" size={22} />
        </View>
        <Text className="mt-5 text-2xl font-bold text-white">Create New Question Paper</Text>
        <Text className="mt-1 text-sm text-indigo-100">Syllabus to A4 PDF in under 60 seconds</Text>
      </Pressable>

      {/* Institution Branding Setup Reminder */}
      {instituteProfile.schoolName === 'Delhi Public School, R.K. Puram' && (
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/(tabs)/profile')}
          className="mt-5 flex-row items-center justify-between rounded-2xl border border-indigo-200 bg-indigo-50/70 p-4 active:bg-indigo-100"
        >
          <View className="h-10 w-10 items-center justify-center rounded-xl bg-primary">
            <Building2 color="#FFFFFF" size={20} />
          </View>
          <View className="ml-3 flex-1">
            <Text className="text-xs font-bold text-ink">Personalize School Header & Crest</Text>
            <Text className="mt-0.5 text-[11px] text-muted">
              Add your school name, board affiliation & emblem for official printouts.
            </Text>
          </View>
          <ChevronRight color="#4F46E5" size={18} />
        </Pressable>
      )}

      <View className="mt-6 flex-row gap-3">
        <StatCard label="Papers made" value={String(savedPapers.length)} icon={<FileText color="#0D9488" size={18} />} />
        <StatCard label="Questions ready" value={String(totalQuestions)} icon={<Clock3 color="#D97706" size={18} />} />
      </View>

      <View className="mt-8 flex-row items-center justify-between">
        <Text className="text-lg font-bold text-ink">Recent papers</Text>
        {savedPapers.length > 0 && <Text className="text-sm font-semibold text-primary">{savedPapers.length} saved</Text>}
      </View>

      {savedPapers.length === 0 ? (
        <View className="mt-3 items-center rounded-3xl border border-dashed border-line bg-white px-6 py-10">
          <View className="h-14 w-14 items-center justify-center rounded-full bg-slate-100">
            <Plus color="#64748B" size={24} />
          </View>
          <Text className="mt-4 text-base font-semibold text-ink">Your workspace is ready</Text>
          <Text className="mt-2 text-center leading-5 text-muted">
            Your generated papers and quick re-export actions will appear here.
          </Text>
        </View>
      ) : (
        savedPapers.map((paper) => (
          <View
            key={paper.id}
            className="mt-3 flex-row items-center justify-between rounded-2xl border border-line bg-white p-4"
          >
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                setActivePaper(paper);
                router.push('/create/step4-preview');
              }}
              className="flex-1 flex-row items-center active:opacity-75"
            >
              <View className="h-11 w-11 items-center justify-center rounded-xl bg-indigo-50">
                <FileText color="#4F46E5" size={20} />
              </View>
              <View className="ml-3 flex-1 pr-2">
                <Text className="font-bold text-ink" numberOfLines={1}>
                  {paper.examTitle}
                </Text>
                <Text className="mt-1 text-sm text-muted">
                  {paper.className} • {paper.subject} • {paper.totalMarks} marks
                </Text>
              </View>
            </Pressable>

            <Pressable
              accessibilityLabel={`Delete ${paper.examTitle}`}
              accessibilityRole="button"
              onPress={() => handleDeletePaper(paper.id, paper.examTitle)}
              className="h-10 w-10 items-center justify-center rounded-xl border border-rose-100 bg-rose-50 active:bg-rose-100"
            >
              <Trash2 color="#EF4444" size={17} />
            </Pressable>
          </View>
        ))
      )}
      <Text className="mt-8 text-center text-xs text-slate-400">
        {instituteProfile.schoolName} • Offline drafts enabled
      </Text>
      <AppFooter className="mt-4 mb-6" />
    </ScrollView>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }): React.JSX.Element {
  return (
    <View className="flex-1 rounded-2xl border border-line bg-white p-4">
      <View className="flex-row items-center justify-between">
        <Text className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</Text>
        {icon}
      </View>
      <Text className="mt-3 text-2xl font-bold text-ink">{value}</Text>
    </View>
  );
}
