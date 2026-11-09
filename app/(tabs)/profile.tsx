import { useState } from 'react';
import { Alert, Image, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import {
  ArrowUpCircle,
  Check,
  ImagePlus,
  LayoutTemplate,
  RefreshCw,
  Trash2
} from 'lucide-react-native';
import { usePaperStore } from '@/src/store/usePaperStore';
import { AppFooter } from '@/src/components/AppFooter';
import { UpdateModal } from '@/src/components/UpdateModal';
import {
  CURRENT_APP_VERSION,
  CURRENT_VERSION_CODE,
  performFullUpdateCheckAsync,
  RemoteVersionInfo
} from '@/src/services/updateService';
import type { HeaderStyle } from '@/src/types/paper';

const headerStyles: { value: HeaderStyle; title: string; description: string }[] = [
  { value: 'classic_boxed', title: 'Classic Boxed (Official Board)', description: 'Traditional Indian double border with candidate details box' },
  { value: 'modern_minimal', title: 'Modern Minimal', description: 'Clean indigo top-bar with spacious typography' },
  { value: 'compact_coaching', title: 'Compact Coaching', description: 'High-density 2-column header to save printable vertical space' }
];

export default function ProfileScreen(): React.JSX.Element {
  const { instituteProfile, updateInstituteProfile } = usePaperStore();
  const [isPicking, setIsPicking] = useState(false);
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [updateType, setUpdateType] = useState<'OTA' | 'MAJOR' | null>(null);
  const [majorInfo, setMajorInfo] = useState<RemoteVersionInfo | undefined>(undefined);

  const handleManualCheckUpdate = async (): Promise<void> => {
    if (isCheckingUpdate) return;
    setIsCheckingUpdate(true);
    try {
      const result = await performFullUpdateCheckAsync();
      if (result.hasMajorUpdate && result.majorUpdateInfo) {
        setMajorInfo(result.majorUpdateInfo);
        setUpdateType('MAJOR');
        setUpdateModalVisible(true);
      } else if (result.hasOtaUpdate && result.otaDownloaded) {
        setUpdateType('OTA');
        setUpdateModalVisible(true);
      } else {
        Alert.alert(
          'Up to Date! ✨',
          `PaperCraft AI is running the latest version (v${CURRENT_APP_VERSION}). No updates needed.`
        );
      }
    } catch (err) {
      Alert.alert('Notice', 'Unable to reach the update server. Please check your internet connection.');
    } finally {
      setIsCheckingUpdate(false);
    }
  };

  const pickLogo = async (): Promise<void> => {
    if (isPicking) return;
    setIsPicking(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8
      });
      const asset = result.assets?.[0];
      if (!result.canceled && asset) {
        updateInstituteProfile({ logoUri: asset.uri });
      }
    } catch {
      Alert.alert('Logo notice', 'Could not open photo library.');
    } finally {
      setIsPicking(false);
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-canvas"
      contentContainerStyle={{ padding: 20, paddingTop: 64, paddingBottom: 60 }}
    >
      <Text className="text-xs font-bold uppercase tracking-widest text-primary">Institution Setup</Text>
      <Text className="mt-1 text-2xl font-bold text-ink">School Branding & Crest</Text>
      <Text className="mt-1 text-xs text-muted leading-5">
        This branding is stamped onto every generated A4 Question Paper, Marking Scheme, and Word document.
      </Text>

      {/* Live Header Preview Card */}
      <View className="mt-5 overflow-hidden rounded-3xl border border-line bg-white p-4 shadow-sm">
        <View className="mb-3 flex-row items-center justify-between">
          <Text className="text-xs font-bold uppercase tracking-wider text-muted">Live Print Header Preview</Text>
          <LayoutTemplate color="#4F46E5" size={18} />
        </View>

        <View
          className={`rounded-xl p-3.5 ${
            instituteProfile.headerStyle === 'modern_minimal'
              ? 'border-b-2 border-primary bg-white'
              : instituteProfile.headerStyle === 'compact_coaching'
              ? 'bg-slate-50 border border-slate-200'
              : 'border-2 border-slate-900 bg-white'
          }`}
        >
          <View className="flex-row items-center justify-center gap-3">
            {instituteProfile.logoUri ? (
              <Image source={{ uri: instituteProfile.logoUri }} className="h-12 w-12 rounded-lg" resizeMode="contain" />
            ) : (
              <View className="h-12 w-12 items-center justify-center rounded-lg bg-indigo-50 border border-indigo-200">
                <ImagePlus color="#4F46E5" size={20} />
              </View>
            )}
            <View className="flex-1">
              <Text className="text-center text-sm font-bold text-ink" numberOfLines={1}>
                {instituteProfile.schoolName || 'Your School Name'}
              </Text>
              <Text className="mt-0.5 text-center text-[10px] text-muted" numberOfLines={1}>
                {instituteProfile.affiliationNumber || instituteProfile.subtitle || 'Affiliation • School Code'}
              </Text>
              <Text className="text-center text-[9px] font-semibold text-primary" numberOfLines={1}>
                {instituteProfile.sessionYear || 'Academic Session 2026–2027'}
              </Text>
            </View>
          </View>
          <View className="mt-2.5 flex-row justify-between border-t border-slate-200 pt-2">
            <Text className="text-[10px] text-muted">Watermark: {instituteProfile.watermarkText || 'None'}</Text>
            <Text className="text-[10px] font-bold text-ink">PRE-BOARD EXAMINATION</Text>
          </View>
        </View>
      </View>

      {/* Fields */}
      <Field
        label="School / Coaching Institute Name"
        value={instituteProfile.schoolName}
        onChangeText={(schoolName) => updateInstituteProfile({ schoolName })}
        placeholder="e.g. Delhi Public School, R.K. Puram"
      />
      <Field
        label="Affiliation Number & School Code"
        value={instituteProfile.affiliationNumber ?? ''}
        onChangeText={(affiliationNumber) => updateInstituteProfile({ affiliationNumber })}
        placeholder="e.g. CBSE Affiliation No. 2730017 • School Code 25012"
      />
      <Field
        label="Campus Subtitle / Address"
        value={instituteProfile.subtitle}
        onChangeText={(subtitle) => updateInstituteProfile({ subtitle })}
        placeholder="e.g. Sector XII, R.K. Puram, New Delhi - 110022"
      />
      <Field
        label="Academic Session Year"
        value={instituteProfile.sessionYear ?? ''}
        onChangeText={(sessionYear) => updateInstituteProfile({ sessionYear })}
        placeholder="e.g. Academic Session 2026–2027"
      />
      <Field
        label="Background Watermark Text"
        value={instituteProfile.watermarkText}
        onChangeText={(watermarkText) => updateInstituteProfile({ watermarkText })}
        placeholder="e.g. PaperCraft AI, CONFIDENTIAL, SAMPLE PAPER"
      />

      {/* Logo upload / remove actions */}
      <View className="mt-3 flex-row gap-2">
        <Pressable
          accessibilityRole="button"
          onPress={pickLogo}
          className="h-11 flex-1 flex-row items-center justify-center rounded-xl border border-primary bg-indigo-50/50 active:bg-indigo-100"
        >
          <ImagePlus color="#4F46E5" size={17} />
          <Text className="ml-2 text-xs font-bold text-primary">
            {instituteProfile.logoUri ? 'Change School Logo / Crest' : 'Upload School Logo / Crest'}
          </Text>
        </Pressable>
        {instituteProfile.logoUri && (
          <Pressable
            accessibilityRole="button"
            onPress={() => updateInstituteProfile({ logoUri: null })}
            className="h-11 w-11 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 active:bg-rose-100"
          >
            <Trash2 color="#EF4444" size={17} />
          </Pressable>
        )}
      </View>

      {/* Header Style Selector */}
      <Text className="mb-2.5 mt-7 text-xs font-bold uppercase tracking-wider text-muted">
        Header Layout Style
      </Text>
      {headerStyles.map((style) => (
        <Pressable
          key={style.value}
          accessibilityRole="radio"
          accessibilityState={{ checked: instituteProfile.headerStyle === style.value }}
          onPress={() => updateInstituteProfile({ headerStyle: style.value })}
          className={`mb-2.5 min-h-[58px] flex-row items-center rounded-2xl border p-3.5 ${
            instituteProfile.headerStyle === style.value ? 'border-primary bg-indigo-50' : 'border-line bg-white'
          }`}
        >
          <View
            className={`h-9 w-9 items-center justify-center rounded-xl ${
              instituteProfile.headerStyle === style.value ? 'bg-primary' : 'bg-slate-100'
            }`}
          >
            <LayoutTemplate
              color={instituteProfile.headerStyle === style.value ? '#FFFFFF' : '#64748B'}
              size={17}
            />
          </View>
          <View className="ml-3 flex-1">
            <Text className="text-xs font-bold text-ink">{style.title}</Text>
            <Text className="mt-0.5 text-[11px] text-muted">{style.description}</Text>
          </View>
          {instituteProfile.headerStyle === style.value && <Check color="#4F46E5" size={18} />}
        </Pressable>
      ))}

      {/* Software & Updates Section */}
      <Text className="mb-2.5 mt-7 text-xs font-bold uppercase tracking-wider text-muted">
        Software & Updates
      </Text>
      <View className="rounded-2xl border border-line bg-white p-4">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1 pr-2">
            <View className="h-10 w-10 items-center justify-center rounded-xl bg-indigo-50">
              <ArrowUpCircle color="#4F46E5" size={20} />
            </View>
            <View className="ml-3 flex-1">
              <Text className="text-xs font-bold text-ink">
                PaperCraft AI v{CURRENT_APP_VERSION}
              </Text>
              <Text className="mt-0.5 text-[11px] text-muted">
                Build #{CURRENT_VERSION_CODE} • Auto-Updates Active
              </Text>
            </View>
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={handleManualCheckUpdate}
            disabled={isCheckingUpdate}
            className="flex-row items-center rounded-xl border border-indigo-200 bg-indigo-50/70 px-3 py-2 active:bg-indigo-100"
          >
            <RefreshCw
              color="#4F46E5"
              size={13}
            />
            <Text className="ml-1.5 text-xs font-bold text-primary">
              {isCheckingUpdate ? 'Checking...' : 'Check Updates'}
            </Text>
          </Pressable>
        </View>
      </View>

      <AppFooter className="mt-8 mb-6" />

      <UpdateModal
        visible={updateModalVisible}
        type={updateType}
        majorInfo={majorInfo}
        onDismiss={() => setUpdateModalVisible(false)}
      />
    </ScrollView>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
}): React.JSX.Element {
  return (
    <View className="mt-4">
      <Text className="mb-1 text-xs font-bold text-ink">{label}</Text>
      <TextInput
        accessibilityLabel={label}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
        className="h-11 rounded-xl border border-line bg-white px-3 text-xs text-ink"
      />
    </View>
  );
}
