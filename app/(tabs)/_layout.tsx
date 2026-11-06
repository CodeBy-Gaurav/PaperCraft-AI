import { Tabs } from 'expo-router';
import { BookOpen, Settings2 } from 'lucide-react-native';

export default function TabLayout(): React.JSX.Element {
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: '#4F46E5', tabBarInactiveTintColor: '#64748B', tabBarStyle: { height: 70, paddingTop: 8, borderTopColor: '#E2E8F0' } }}>
      <Tabs.Screen name="index" options={{ title: 'Workspace', tabBarIcon: ({ color, size }) => <BookOpen color={color} size={size} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Institute', tabBarIcon: ({ color, size }) => <Settings2 color={color} size={size} /> }} />
    </Tabs>
  );
}
