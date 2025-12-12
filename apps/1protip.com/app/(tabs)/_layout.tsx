import { useEffect, useState } from 'react';
import { Tabs } from 'expo-router';
import { Hash, User } from 'lucide-react-native';
import { Text } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { CustomTabBar } from '@/components/CustomTabBar';
import { TabPanelProvider } from '@/contexts/TabPanelContext';
import { useLinkedInAuth } from '@/features/auth/hooks/useLinkedInAuth';

export default function TabLayout() {
  const { profile, getProfile } = useLinkedInAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const existingProfile = await getProfile();
        setIsAuthenticated(!!existingProfile);
      } catch (err) {
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, [getProfile]);

  // Update auth state when profile changes
  useEffect(() => {
    setIsAuthenticated(!!profile);
  }, [profile]);

  return (
    <TabPanelProvider>
      <Tabs
        initialRouteName="index"
        tabBar={(props) => (isAuthenticated ? <CustomTabBar {...props} /> : null)}
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#0066cc',
          tabBarInactiveTintColor: '#666666',
          tabBarStyle: isAuthenticated ? undefined : { display: 'none' },
        }}
      >
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Account',
          tabBarIcon: ({ size, color }: { size: number; color: string }) => <User size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="feed"
        options={{
          title: 'Feed',
          tabBarIcon: ({ size, color }: { size: number; color: string }) => <Hash size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="ms"
        options={{
          title: 'MS',
          tabBarIcon: ({ size, color }: { size: number; color: string }) => (
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
