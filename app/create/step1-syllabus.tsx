import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ArrowLeft, ArrowRight, Check, Plus, Search, Sparkles, X } from 'lucide-react-native';
import { boards, classes, getSubjectsForClass } from '@/src/constants/syllabusTree';
import { usePaperStore } from '@/src/store/usePaperStore';
import type { Board, SyllabusChapter, SyllabusSubject } from '@/src/types/paper';

export default function SyllabusStepScreen(): React.JSX.Element {
  const { draft, updateDraft } = usePaperStore();
  const [search, setSearch] = useState('');
  const [newCustomChapter, setNewCustomChapter] = useState('');
  const [showCustomSubjectInput, setShowCustomSubjectInput] = useState(false);
  const [customSubjectText, setCustomSubjectText] = useState('');

  // Dynamically derive subjects based on currently selected Board & Class
  const classSubjects = useMemo(() => {
    return getSubjectsForClass(draft.selectedBoard, draft.selectedClass);
  }, [draft.selectedBoard, draft.selectedClass]);

  // Active subject
  const activeSubject = useMemo(() => {
    if (draft.customSubjectName && draft.selectedSubject === draft.customSubjectName) {
      return {
        name: draft.customSubjectName,
        icon: '✎',
        chapters: draft.customChapters
      };
    }
    const found = classSubjects.find((s) => s.name === draft.selectedSubject);
    return found ?? classSubjects[0] ?? { name: 'General', icon: '★', chapters: [] };
  }, [classSubjects, draft.customSubjectName, draft.selectedSubject, draft.customChapters]);

  // Combined chapters: official + user-added custom chapters
  const allSubjectChapters = useMemo(() => {
    const official = activeSubject.chapters ?? [];
    const customForThisSubject = draft.customChapters.filter((c) => !official.some((o) => o.code === c.code));
    return [...official, ...customForThisSubject];
  }, [activeSubject, draft.customChapters]);

  // Filtered by search query
  const filteredChapters = useMemo(() => {
    if (!search.trim()) return allSubjectChapters;
    return allSubjectChapters.filter((chapter) =>
      chapter.title.toLowerCase().includes(search.trim().toLowerCase())
    );
  }, [allSubjectChapters, search]);

  const selectBoard = (board: Board): void => {
    Haptics.selectionAsync();
    updateDraft({ selectedBoard: board, selectedChapters: [] });
  };

  const selectClass = (selectedClass: string): void => {
    Haptics.selectionAsync();
    const newSubjects = getSubjectsForClass(draft.selectedBoard, selectedClass);
    const firstSubject = newSubjects[0]?.name ?? 'Mathematics';
    updateDraft({
      selectedClass,
      selectedSubject: firstSubject,
      selectedChapters: []
    });
  };

  const selectSubject = (subject: SyllabusSubject): void => {
    Haptics.selectionAsync();
    setShowCustomSubjectInput(false);
    updateDraft({ selectedSubject: subject.name, selectedChapters: [] });
  };

  const addCustomSubject = (): void => {
    if (!customSubjectText.trim()) return;
    const name = customSubjectText.trim();
    Haptics.selectionAsync();
    updateDraft({
      selectedSubject: name,
      customSubjectName: name,
      selectedChapters: []
    });
    setCustomSubjectText('');
    setShowCustomSubjectInput(false);
  };

  const toggleChapter = (chapter: SyllabusChapter): void => {
    Haptics.selectionAsync();
    const isSelected = draft.selectedChapters.includes(chapter.code);
    const updated = isSelected
      ? draft.selectedChapters.filter((code) => code !== chapter.code)
      : [...draft.selectedChapters, chapter.code];
    updateDraft({ selectedChapters: updated });
  };

  const addCustomChapter = (): void => {
    if (!newCustomChapter.trim()) return;
    Haptics.notificationAsync?.(Haptics.NotificationFeedbackType.Success);
    const code = `CUSTOM_${Date.now()}`;
    const chapter: SyllabusChapter = { code, title: newCustomChapter.trim() };
    updateDraft({
      customChapters: [...draft.customChapters, chapter],
      selectedChapters: [...draft.selectedChapters, code]
    });
    setNewCustomChapter('');
  };

  const selectAll = (): void => {
    Haptics.selectionAsync();
    updateDraft({ selectedChapters: allSubjectChapters.map((c) => c.code) });
  };

  const selectHalf = (): void => {
    Haptics.selectionAsync();
    const halfCount = Math.max(1, Math.ceil(allSubjectChapters.length / 2));
    updateDraft({ selectedChapters: allSubjectChapters.slice(0, halfCount).map((c) => c.code) });
  };

  const clearSelection = (): void => {
    Haptics.selectionAsync();
    updateDraft({ selectedChapters: [] });
  };

  const canContinue = draft.selectedChapters.length > 0;

  return (
    <View className="flex-1 bg-canvas">
      {/* Top Header */}
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
            <Text className="text-xs font-bold uppercase tracking-wider text-muted">Step 1 of 4</Text>
            <Text className="text-xs font-semibold text-primary">Syllabus Selection</Text>
          </View>
          <View className="w-11" />
        </View>

        {/* Progress Bar */}
        <View className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-200">
          <View className="h-full w-1/4 rounded-full bg-primary" />
        </View>

        <Text className="mt-4 text-2xl font-bold text-ink">Choose Class & Syllabus</Text>
        <Text className="mt-1 text-xs text-muted">
          Select your board, grade, subject and target chapters for this question paper.
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 130 }}
      >
        {/* Section 1: Board Selector */}
        <View className="mt-4">
          <Text className="mb-2 text-xs font-bold uppercase tracking-wider text-muted">Education Board</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-1">
            <View className="flex-row gap-2 px-1">
              {boards.map((b) => (
                <Pressable
                  key={b.value}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: draft.selectedBoard === b.value }}
                  onPress={() => selectBoard(b.value)}
                  className={`min-h-11 justify-center rounded-full border px-4 py-2 ${
                    draft.selectedBoard === b.value ? 'border-primary bg-indigo-50' : 'border-line bg-white'
                  }`}
                >
                  <Text
                    className={`text-xs font-bold ${
                      draft.selectedBoard === b.value ? 'text-primary' : 'text-muted'
                    }`}
                  >
                    {b.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>

          {/* Custom Board text input if OTHER is selected */}
          {draft.selectedBoard === 'OTHER' && (
            <View className="mt-3 rounded-xl border border-primary bg-indigo-50/50 p-3">
              <Text className="text-xs font-bold text-primary">Specify Custom Board / University Name</Text>
              <TextInput
                accessibilityLabel="Custom Board Name"
                value={draft.customBoardName ?? ''}
                onChangeText={(val) => updateDraft({ customBoardName: val })}
                placeholder="e.g. Maharashtra State Board, Cambridge CAIE..."
                placeholderTextColor="#94A3B8"
                className="mt-1 h-10 rounded-lg border border-line bg-white px-3 text-sm text-ink"
              />
            </View>
          )}
        </View>

        {/* Section 2: Class Selector (1 through 12 + Custom) */}
        <View className="mt-6">
          <View className="mb-2 flex-row items-center justify-between">
            <Text className="text-xs font-bold uppercase tracking-wider text-muted">Grade / Class</Text>
            <Text className="text-xs font-semibold text-primary">Class 1 to 12</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-1">
            <View className="flex-row gap-2 px-1">
              {classes.map((cls) => {
                const isSelected = draft.selectedClass === cls;
                return (
                  <Pressable
                    key={cls}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: isSelected }}
                    onPress={() => selectClass(cls)}
                    className={`min-h-11 min-w-[58px] items-center justify-center rounded-full border px-3 py-2 ${
                      isSelected ? 'border-primary bg-indigo-50' : 'border-line bg-white'
                    }`}
                  >
                    <Text className={`text-xs font-bold ${isSelected ? 'text-primary' : 'text-muted'}`}>
                      {cls === 'Custom' ? 'Custom' : `Cls ${cls}`}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>

          {/* Custom Class input if Custom is selected */}
          {draft.selectedClass === 'Custom' && (
            <View className="mt-3 rounded-xl border border-primary bg-indigo-50/50 p-3">
              <Text className="text-xs font-bold text-primary">Specify Custom Grade / Standard</Text>
              <TextInput
                accessibilityLabel="Custom Class Name"
                value={draft.customClassName ?? ''}
                onChangeText={(val) => updateDraft({ customClassName: val })}
                placeholder="e.g. LKG, Foundation Batch, Olympiad Group..."
                placeholderTextColor="#94A3B8"
                className="mt-1 h-10 rounded-lg border border-line bg-white px-3 text-sm text-ink"
              />
            </View>
          )}
        </View>

        {/* Section 3: Dynamically Loaded Subjects */}
        <View className="mt-6">
          <View className="mb-2 flex-row items-center justify-between">
            <Text className="text-xs font-bold uppercase tracking-wider text-muted">
              Subjects for Class {draft.selectedClass === 'Custom' ? (draft.customClassName || 'Custom') : draft.selectedClass}
            </Text>
            <Text className="text-xs text-muted">{classSubjects.length} Available</Text>
          </View>

          <View className="flex-row flex-wrap gap-2.5">
            {classSubjects.map((subject) => {
              const isSelected = draft.selectedSubject === subject.name;
              return (
                <Pressable
                  key={subject.name}
                  accessibilityRole="button"
                  onPress={() => selectSubject(subject)}
                  className={`min-h-[82px] w-[31%] rounded-xl border p-2.5 ${
                    isSelected ? 'border-primary bg-indigo-50' : 'border-line bg-white'
                  }`}
                >
                  <Text className="text-xl text-primary">{subject.icon}</Text>
                  <Text className="mt-1.5 text-xs font-bold text-ink" numberOfLines={2}>
                    {subject.name}
                  </Text>
                  <Text className="mt-0.5 text-[10px] text-muted">{subject.chapters.length} chs</Text>
                </Pressable>
              );
            })}

            {/* Custom Subject Card */}
            <Pressable
              accessibilityRole="button"
              onPress={() => setShowCustomSubjectInput((prev) => !prev)}
              className={`min-h-[82px] w-[31%] items-center justify-center rounded-xl border border-dashed p-2.5 ${
                showCustomSubjectInput ? 'border-primary bg-indigo-50' : 'border-slate-300 bg-white'
              }`}
            >
              <Plus color="#4F46E5" size={20} />
              <Text className="mt-1 text-center text-xs font-bold text-primary">Other Subject</Text>
            </Pressable>
          </View>

          {/* Custom Subject Input Field */}
          {showCustomSubjectInput && (
            <View className="mt-3 rounded-xl border border-primary bg-indigo-50/50 p-3">
              <Text className="text-xs font-bold text-primary">Enter Custom Subject Name</Text>
              <View className="mt-2 flex-row gap-2">
                <TextInput
                  accessibilityLabel="Custom Subject"
                  value={customSubjectText}
                  onChangeText={setCustomSubjectText}
                  placeholder="e.g. Sanskrit, German, Moral Science, Robotics..."
                  placeholderTextColor="#94A3B8"
                  className="h-10 flex-1 rounded-lg border border-line bg-white px-3 text-sm text-ink"
                />
                <Pressable
                  accessibilityRole="button"
                  onPress={addCustomSubject}
                  className="h-10 items-center justify-center rounded-lg bg-primary px-4"
                >
                  <Text className="text-xs font-bold text-white">Save</Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>

        {/* Section 4: Chapters Multi-Select */}
        <View className="mt-7">
          <View className="mb-2 flex-row items-center justify-between">
            <Text className="text-xs font-bold uppercase tracking-wider text-muted">
              Chapters & Topics ({activeSubject.name})
            </Text>
            <Text className="text-xs font-bold text-primary">
              {draft.selectedChapters.length} of {allSubjectChapters.length} Selected
            </Text>
          </View>

          {/* Search Bar */}
          <View className="h-11 flex-row items-center rounded-xl border border-line bg-white px-3">
            <Search color="#94A3B8" size={17} />
            <TextInput
              accessibilityLabel="Search chapters"
              value={search}
              onChangeText={setSearch}
              placeholder={`Search ${activeSubject.name} chapters...`}
              placeholderTextColor="#94A3B8"
              className="ml-2 flex-1 text-sm text-ink"
            />
            {search.length > 0 && (
              <Pressable onPress={() => setSearch('')}>
                <X color="#94A3B8" size={16} />
              </Pressable>
            )}
          </View>

          {/* Quick Select Actions */}
          <View className="mt-2.5 flex-row flex-wrap gap-2">
            <SmallAction label="Select All" onPress={selectAll} />
            <SmallAction label="Half-Yearly (First 50%)" onPress={selectHalf} />
            <SmallAction label="Clear Selection" onPress={clearSelection} />
          </View>

          {/* Add Custom Chapter/Topic Input Field */}
          <View className="mt-3 flex-row gap-2">
            <TextInput
              accessibilityLabel="Add custom chapter"
              value={newCustomChapter}
              onChangeText={setNewCustomChapter}
              placeholder="➕ Add your own chapter / topic..."
              placeholderTextColor="#94A3B8"
              className="h-11 flex-1 rounded-xl border border-dashed border-slate-300 bg-white px-3 text-xs text-ink"
            />
            <Pressable
              accessibilityRole="button"
              onPress={addCustomChapter}
              disabled={!newCustomChapter.trim()}
              className={`h-11 items-center justify-center rounded-xl px-4 ${
                newCustomChapter.trim() ? 'bg-primary' : 'bg-slate-200'
              }`}
            >
              <Text className={`text-xs font-bold ${newCustomChapter.trim() ? 'text-white' : 'text-slate-400'}`}>
                Add
              </Text>
            </Pressable>
          </View>

          {/* Chapter Items List */}
          <View className="mt-3 overflow-hidden rounded-2xl border border-line bg-white">
            {filteredChapters.length > 0 ? (
              filteredChapters.map((chapter) => {
                const checked = draft.selectedChapters.includes(chapter.code);
                return (
                  <Pressable
                    key={chapter.code}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked }}
                    onPress={() => toggleChapter(chapter)}
                    className="min-h-14 flex-row items-center border-b border-slate-100 px-4 py-2.5 active:bg-slate-50"
                  >
                    <View
                      className={`h-6 w-6 items-center justify-center rounded-md border ${
                        checked ? 'border-primary bg-primary' : 'border-slate-300 bg-white'
                      }`}
                    >
                      {checked && <Check color="#FFFFFF" size={14} />}
                    </View>
                    <View className="ml-3 flex-1">
                      <Text className="text-xs font-semibold leading-5 text-ink">{chapter.title}</Text>
                      <Text className="mt-0.5 text-[10px] text-muted">{chapter.code}</Text>
                    </View>
                  </Pressable>
                );
              })
            ) : (
              <View className="p-6">
                <Text className="text-center text-sm font-semibold text-ink">No matching chapters found</Text>
                <Text className="mt-1 text-center text-xs text-muted">
                  Use the field above to add your own custom topic or clear search.
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Action Bar */}
      <View className="absolute bottom-0 left-0 right-0 border-t border-line bg-white/95 px-5 py-4">
        <Pressable
          disabled={!canContinue}
          accessibilityRole="button"
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.push('/create/step2-blueprint');
          }}
          className={`h-12 flex-row items-center justify-center rounded-xl ${
            canContinue ? 'bg-primary' : 'bg-slate-200'
          }`}
        >
          <Sparkles color={canContinue ? '#FFFFFF' : '#94A3B8'} size={18} />
          <Text className={`ml-2 text-sm font-bold ${canContinue ? 'text-white' : 'text-slate-400'}`}>
            Continue to Blueprint ({draft.selectedChapters.length} chs)
          </Text>
          <ArrowRight color={canContinue ? '#FFFFFF' : '#94A3B8'} size={18} className="ml-2" />
        </Pressable>
      </View>
    </View>
  );
}

function SmallAction({ label, onPress }: { label: string; onPress: () => void }): React.JSX.Element {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className="min-h-8 justify-center rounded-lg bg-indigo-50 px-3 py-1.5 active:bg-indigo-100"
    >
      <Text className="text-[11px] font-semibold text-primary">{label}</Text>
    </Pressable>
  );
}
