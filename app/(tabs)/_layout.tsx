import { Tabs } from 'expo-router';
import { Hash, User } from 'lucide-react-native';
import { Text } from 'react-native';
import { CustomTabBar } from '@/shared/components/CustomTabBar';
import { TabPanelProvider } from '@/shared/contexts/TabPanelContext';

export default function TabLayout() {
  return (
    <TabPanelProvider>
      <Tabs
        initialRouteName="feed"
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#0066cc',
          tabBarInactiveTintColor: '#666666',
        }}
      >
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Account',
          tabBarIcon: ({ size, color }) => <User size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="feed"
        options={{
          title: 'Feed',
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
    </TabPanelProvider>
  );
}
