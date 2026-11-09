import React from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import {
  ArrowUpCircle,
  CheckCircle2,
  Download,
  RotateCcw,
  Sparkles,
  X
} from 'lucide-react-native';
import {
  applyOtaUpdateAsync,
  launchApkUpdateDownload,
  RemoteVersionInfo
} from '@/src/services/updateService';

interface UpdateModalProps {
  visible: boolean;
  type: 'OTA' | 'MAJOR' | null;
  majorInfo?: RemoteVersionInfo;
  onDismiss: () => void;
}

export function UpdateModal({
  visible,
  type,
  majorInfo,
  onDismiss
}: UpdateModalProps): React.JSX.Element | null {
  if (!visible || !type) return null;

  // 1. Over-The-Air (OTA) Quick Update Dialog
  if (type === 'OTA') {
    return (
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={onDismiss}
      >
        <View className="flex-1 items-center justify-center bg-black/60 px-6">
          <View className="w-full max-w-sm rounded-3xl border border-indigo-100 bg-white p-6 shadow-2xl">
            <View className="mx-auto h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50">
              <Sparkles color="#4F46E5" size={28} />
            </View>

            <Text className="mt-4 text-center text-lg font-bold text-slate-900">
              Quick Update Ready!
            </Text>
            <Text className="mt-2 text-center text-xs leading-5 text-slate-500">
              New improvements, formatting refinements, and fixes have been downloaded in the background.
            </Text>

            <View className="mt-6 flex-row gap-3">
              <Pressable
                accessibilityRole="button"
                onPress={onDismiss}
                className="h-11 flex-1 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 active:bg-slate-100"
              >
                <Text className="text-xs font-semibold text-slate-600">Later</Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                onPress={() => applyOtaUpdateAsync()}
                className="h-11 flex-1 flex-row items-center justify-center rounded-xl bg-indigo-600 active:bg-indigo-700"
              >
                <RotateCcw color="#FFFFFF" size={15} />
                <Text className="ml-2 text-xs font-bold text-white">Restart Now</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  // 2. Major In-App Version Update Modal
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={() => {
        if (!majorInfo?.isCritical) onDismiss();
      }}
    >
      <View className="flex-1 items-center justify-center bg-black/65 px-5">
        <View className="w-full max-w-md overflow-hidden rounded-3xl border border-indigo-100 bg-white shadow-2xl">
          {/* Header Bar */}
          <View className="bg-indigo-900 px-6 py-5">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View className="h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                  <ArrowUpCircle color="#818CF8" size={24} />
                </View>
                <View className="ml-3">
                  <Text className="text-sm font-bold text-white">
                    Major Update Available
                  </Text>
                  <Text className="text-[11px] font-medium text-indigo-200">
                    Version {majorInfo?.latestVersion ?? '1.0.2'}
                  </Text>
                </View>
              </View>

              {!majorInfo?.isCritical && (
                <Pressable
                  accessibilityRole="button"
                  onPress={onDismiss}
                  className="h-8 w-8 items-center justify-center rounded-full bg-white/10 active:bg-white/20"
                >
                  <X color="#E0E7FF" size={16} />
                </Pressable>
              )}
            </View>
          </View>

          {/* Body Content */}
          <View className="p-6">
            <Text className="text-sm font-bold text-slate-800">
              {majorInfo?.title ?? 'PaperCraft AI Update'}
            </Text>

            {majorInfo?.releaseNotes && majorInfo.releaseNotes.length > 0 && (
              <View className="mt-4 rounded-2xl border border-slate-100 bg-slate-50/80 p-3.5">
                <Text className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  What's New:
                </Text>
                <ScrollView className="max-h-40">
                  {majorInfo.releaseNotes.map((note, index) => (
                    <View key={index} className="mb-1.5 flex-row items-start">
                      <CheckCircle2 color="#10B981" size={14} className="mt-0.5" />
                      <Text className="ml-2 flex-1 text-xs text-slate-600 leading-4">
                        {note}
                      </Text>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Action Buttons */}
            <View className="mt-6 flex-row gap-3">
              {!majorInfo?.isCritical && (
                <Pressable
                  accessibilityRole="button"
                  onPress={onDismiss}
                  className="h-12 flex-1 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 active:bg-slate-100"
                >
                  <Text className="text-xs font-semibold text-slate-600">Remind Later</Text>
                </Pressable>
              )}

              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  if (majorInfo?.downloadUrl) {
                    launchApkUpdateDownload(majorInfo.downloadUrl);
                    onDismiss();
                  }
                }}
                className="h-12 flex-1 flex-row items-center justify-center rounded-xl bg-indigo-600 active:bg-indigo-700 shadow-md"
              >
                <Download color="#FFFFFF" size={16} />
                <Text className="ml-2 text-xs font-bold text-white">
                  Update Now
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}
