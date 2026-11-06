import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import {
  ArrowLeft,
  Columns,
  Download,
  Droplet,
  Edit3,
  FileText,
  Layout,
  Printer,
  Type
} from 'lucide-react-native';
import { WebView } from 'react-native-webview';
import {
  generateA4Html,
  printA4Pdf,
  shareA4PdfFile,
  type RenderMode
} from '@/src/services/pdfGenerator';
import { usePaperStore } from '@/src/store/usePaperStore';
import { generateAndShareDocx } from '@/src/services/docxGenerator';
import type { FontSizePreset, HeaderStyle } from '@/src/types/paper';

const modes: { value: RenderMode; label: string }[] = [
  { value: 'QUESTION_PAPER', label: '📄 Question Paper' },
  { value: 'ANSWER_KEY', label: '✅ Marking Scheme' },
  { value: 'OMR_SHEET', label: '🫧 OMR Bubble Sheet' }
];

export default function PreviewStepScreen(): React.JSX.Element {
  const { activePaper, instituteProfile, updateInstituteProfile } = usePaperStore();
  const [mode, setMode] = useState<RenderMode>('QUESTION_PAPER');
  const [showWatermark, setShowWatermark] = useState(true);
  const [busy, setBusy] = useState<'print' | 'share' | 'docx' | null>(null);

  const totalQuestions = useMemo(
    () => activePaper?.sections.reduce((sum, sec) => sum + sec.questions.length, 0) ?? 0,
    [activePaper]
  );
  const totalMarks = activePaper?.totalMarks ?? 0;

  const html = useMemo(
    () =>
      activePaper
        ? generateA4Html(activePaper, instituteProfile, mode, { showWatermark })
        : '<html><body style="font-family:sans-serif;padding:20px;text-align:center;"><h3>No active exam paper selected.</h3><p>Please return to Step 1 and generate a paper.</p></body></html>',
    [activePaper, instituteProfile, mode, showWatermark]
  );

  // 1. Direct Native System Print Spooler (includes 1-tap "Save as PDF" directly to Downloads, zero permissions required)
  const handlePrint = async (): Promise<void> => {
    if (!activePaper) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setBusy('print');
    try {
      await printA4Pdf(activePaper, instituteProfile, mode, { showWatermark });
      Haptics.notificationAsync?.(Haptics.NotificationFeedbackType.Success);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      Alert.alert('Print / PDF Notice', msg || 'Could not open print preview.');
    } finally {
      setBusy(null);
    }
  };

  // 2. Share PDF File directly via Share Sheet
  const handleSharePdf = async (): Promise<void> => {
    if (!activePaper) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setBusy('share');
    try {
      await shareA4PdfFile(activePaper, instituteProfile, mode, { showWatermark });
      Haptics.notificationAsync?.(Haptics.NotificationFeedbackType.Success);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      Alert.alert('Share PDF Notice', msg || 'Could not share PDF file.');
    } finally {
      setBusy(null);
    }
  };

  // 3. Export Word (.docx)
  const handleExportDocx = async (): Promise<void> => {
    if (!activePaper) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setBusy('docx');
    try {
      await generateAndShareDocx(activePaper, instituteProfile, mode === 'ANSWER_KEY');
      Haptics.notificationAsync?.(Haptics.NotificationFeedbackType.Success);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      Alert.alert('Word (.docx) Notice', msg || 'Could not create Word document.');
    } finally {
      setBusy(null);
    }
  };

  const toggleColumns = (): void => {
    Haptics.selectionAsync();
    updateInstituteProfile({ defaultColumns: instituteProfile.defaultColumns === 1 ? 2 : 1 });
  };

  const cycleFont = (): void => {
    Haptics.selectionAsync();
    const next: FontSizePreset =
      instituteProfile.defaultFontSize === 'compact'
        ? 'standard'
        : instituteProfile.defaultFontSize === 'standard'
        ? 'large'
        : 'compact';
    updateInstituteProfile({ defaultFontSize: next });
  };

  const cycleHeader = (): void => {
    Haptics.selectionAsync();
    const next: HeaderStyle =
      instituteProfile.headerStyle === 'classic_boxed'
        ? 'modern_minimal'
        : instituteProfile.headerStyle === 'modern_minimal'
        ? 'compact_coaching'
        : 'classic_boxed';
    updateInstituteProfile({ headerStyle: next });
  };

  const toggleWatermark = (): void => {
    Haptics.selectionAsync();
    setShowWatermark((prev) => !prev);
  };

  return (
    <View className="flex-1 bg-slate-900">
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
            <Text className="text-xs font-bold uppercase tracking-wider text-muted">Step 4 of 4</Text>
            <Text className="text-xs font-semibold text-primary">A4 Print & Export</Text>
          </View>
          <Pressable
            accessibilityLabel="Edit Questions"
            accessibilityRole="button"
            onPress={() => router.push('/create/step3-review')}
            className="h-11 w-11 items-center justify-center rounded-xl border border-primary bg-indigo-50 active:bg-indigo-100"
          >
            <Edit3 color="#4F46E5" size={18} />
          </Pressable>
        </View>

        <Text className="mt-3 text-2xl font-bold text-ink">Print-Ready A4 Preview</Text>
        <Text className="mt-0.5 text-xs text-muted">
          Pinch to zoom • Realistic physical sheet pagination & KaTeX equations.
        </Text>

        {/* Mode Selector */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-2.5 -mx-1">
          <View className="flex-row gap-2 px-1">
            {modes.map((item) => {
              const isSelected = mode === item.value;
              return (
                <Pressable
                  key={item.value}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: isSelected }}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setMode(item.value);
                  }}
                  className={`min-h-9 justify-center rounded-full border px-3.5 ${
                    isSelected ? 'border-primary bg-indigo-50' : 'border-line bg-white'
                  }`}
                >
                  <Text className={`text-xs font-bold ${isSelected ? 'text-primary' : 'text-muted'}`}>
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

        {/* Layout Adjustment Quick Actions */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-2 -mx-1">
          <View className="flex-row gap-2 px-1">
            <ToolButton
              icon={<Columns size={12} color="#475569" />}
              label={instituteProfile.defaultColumns === 1 ? '1-Column' : '2-Col Coaching'}
              onPress={toggleColumns}
            />
            <ToolButton
              icon={<Type size={12} color="#475569" />}
              label={`Font: ${instituteProfile.defaultFontSize}`}
              onPress={cycleFont}
            />
            <ToolButton
              icon={<Layout size={12} color="#475569" />}
              label={`Header: ${instituteProfile.headerStyle.replace('_', ' ')}`}
              onPress={cycleHeader}
            />
            <ToolButton
              icon={<Droplet size={12} color={showWatermark ? '#4F46E5' : '#94A3B8'} />}
              label={showWatermark ? 'Watermark: ON' : 'Watermark: OFF'}
              onPress={toggleWatermark}
            />
          </View>
        </ScrollView>
      </View>

      {/* Live A4 Sheet Preview Container */}
      <View className="flex-1 bg-slate-900">
        {/* Subtle Paper Details Bar */}
        <View className="flex-row items-center justify-between px-4 py-2 bg-slate-800/90 border-b border-slate-700/60">
          <View className="flex-row items-center">
            <View className="h-2 w-2 rounded-full bg-emerald-400 mr-2" />
            <Text className="text-[11px] font-semibold text-slate-200" numberOfLines={1}>
              {activePaper?.className ?? 'Exam'} • {activePaper?.subject ?? ''}
            </Text>
          </View>
          <Text className="text-[11px] font-bold text-indigo-300">
            {totalMarks} Marks • {totalQuestions} Questions
          </Text>
        </View>

        <View className="flex-1 overflow-hidden p-1.5">
          <View className="flex-1 overflow-hidden rounded-xl border border-slate-700 bg-slate-900 shadow-2xl">
            <WebView
              originWhitelist={['*']}
              source={{ html }}
              javaScriptEnabled
              domStorageEnabled
              scalesPageToFit
              showsVerticalScrollIndicator
              showsHorizontalScrollIndicator
              className="flex-1"
            />
          </View>
        </View>
      </View>

      {/* Bottom Export Bar */}
      <View className="border-t border-line bg-white px-4 py-3.5">
        <View className="flex-row gap-2">
          {/* Native Print / Save as PDF */}
          <Pressable
            disabled={busy !== null}
            accessibilityRole="button"
            onPress={() => void handlePrint()}
            className="h-11 flex-1 flex-row items-center justify-center rounded-xl bg-primary active:bg-indigo-700"
          >
            <Printer color="#FFFFFF" size={16} />
            <Text className="ml-1.5 text-xs font-bold text-white">
              {busy === 'print' ? 'Opening…' : 'Print / Save PDF'}
            </Text>
          </Pressable>

          {/* Share PDF file */}
          <Pressable
            disabled={busy !== null}
            accessibilityRole="button"
            onPress={() => void handleSharePdf()}
            className="h-11 flex-1 flex-row items-center justify-center rounded-xl border border-line bg-slate-50 active:bg-slate-100"
          >
            <Download color="#0F172A" size={16} />
            <Text className="ml-1.5 text-xs font-bold text-ink">
              {busy === 'share' ? 'Sharing…' : 'Share PDF'}
            </Text>
          </Pressable>

          {/* Export Word (.docx) */}
          <Pressable
            disabled={busy !== null}
            accessibilityRole="button"
            onPress={() => void handleExportDocx()}
            className="h-11 flex-1 flex-row items-center justify-center rounded-xl border border-primary bg-indigo-50/60 active:bg-indigo-100"
          >
            <FileText color="#4F46E5" size={16} />
            <Text className="ml-1.5 text-xs font-bold text-primary">
              {busy === 'docx' ? 'Creating…' : 'Word (.docx)'}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function ToolButton({
  icon,
  label,
  onPress
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
}): React.JSX.Element {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className="min-h-8 flex-row items-center justify-center rounded-lg border border-line bg-white px-2.5 active:bg-slate-50"
    >
      {icon}
      <Text numberOfLines={1} className="ml-1.5 text-[10px] font-bold text-slate-700">
        {label}
      </Text>
    </Pressable>
  );
}
