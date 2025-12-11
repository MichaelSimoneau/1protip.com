import { Tabs } from 'expo-router';
import { Hash, Settings } from 'lucide-react-native';
import { Text } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      initialRouteName="feed"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#0066cc',
        tabBarInactiveTintColor: '#666666',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
        },
      }}
    >
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ size, color }) => <Settings size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="feed"
        options={{
          title: '#',
          tabBarIcon: ({ size, color }) => <Hash size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="ms"
        options={{
          title: 'MS',
          tabBarIcon: ({ size, color }) => (
            <Text style={{ fontSize: size * 0.7, fontWeight: '700', color }}>MS</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
