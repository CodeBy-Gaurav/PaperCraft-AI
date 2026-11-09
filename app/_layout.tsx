import '../global.css';
import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar, View } from 'react-native';
import { UpdateModal } from '@/src/components/UpdateModal';
import {
  performFullUpdateCheckAsync,
  RemoteVersionInfo
} from '@/src/services/updateService';

export default function RootLayout(): React.JSX.Element {
  const [modalVisible, setModalVisible] = useState(false);
  const [updateType, setUpdateType] = useState<'OTA' | 'MAJOR' | null>(null);
  const [majorInfo, setMajorInfo] = useState<RemoteVersionInfo | undefined>(undefined);

  useEffect(() => {
    // Non-intrusive delayed background update check after app mount
    const timer = setTimeout(async () => {
      try {
        const result = await performFullUpdateCheckAsync();
        if (result.hasMajorUpdate && result.majorUpdateInfo) {
          setMajorInfo(result.majorUpdateInfo);
          setUpdateType('MAJOR');
          setModalVisible(true);
        } else if (result.hasOtaUpdate && result.otaDownloaded) {
          setUpdateType('OTA');
          setModalVisible(true);
        }
      } catch (err) {
        // Offline / silent fallback
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View className="flex-1 bg-canvas">
      <StatusBar barStyle="dark-content" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#F8FAFC' } }} />
      <UpdateModal
        visible={modalVisible}
        type={updateType}
        majorInfo={majorInfo}
        onDismiss={() => setModalVisible(false)}
      />
    </View>
  );
}
