import '../global.css';
import { Stack } from 'expo-router';
import { StatusBar, View } from 'react-native';

export default function RootLayout(): React.JSX.Element {
  return (
    <View className="flex-1 bg-canvas">
      <StatusBar barStyle="dark-content" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#F8FAFC' } }} />
    </View>
  );
}
