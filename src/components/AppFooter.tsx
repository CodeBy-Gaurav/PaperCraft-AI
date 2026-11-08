import React from 'react';
import { View, Text } from 'react-native';
import { Sparkles } from 'lucide-react-native';

interface AppFooterProps {
  className?: string;
}

export function AppFooter({ className = '' }: AppFooterProps): React.JSX.Element {
  return (
    <View className={`items-center justify-center py-6 ${className}`}>
      <View className="flex-row items-center rounded-full border border-indigo-100/80 bg-white/95 px-4 py-2 shadow-xs">
        <Sparkles size={13} color="#4F46E5" />
        <Text className="ml-2 text-xs font-medium text-slate-600">
          Crafted with{' '}
          <Text className="text-rose-500 font-bold">♥</Text> by{' '}
          <Text className="font-bold text-indigo-950">Gaurav Tiwari</Text>
        </Text>
      </View>
      <View className="mt-2.5 flex-row items-center">
        <View className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        <Text className="ml-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          PaperCraft AI v1.0.1 • Precision Exam Studio
        </Text>
      </View>
    </View>
  );
}
