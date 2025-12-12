import React, { useRef, useState, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import PagerView from 'react-native-pager-view';
import { TabPanelProvider } from '@/contexts/TabPanelContext';
import { CustomTabBar } from '@/components/CustomTabBar';
import ScreenAL from '../ScreenAL';
import ScreenAR from '../ScreenAR';
import AccountTab from './settings';
import FeedTab from './feed';
import MSTab from './MichaelSimoneau';
import { useLinkedInAuth } from '@/features/auth/hooks/useLinkedInAuth';

// Use a simplified navigation context for the pager
// Since we're not using Expo Router's Tabs anymore for the main layout
export default function PagerLayout() {
  const pagerRef = useRef<PagerView>(null);
  const [pageIndex, setPageIndex] = useState(2); // Start at Feed (index 2)
  const { profile } = useLinkedInAuth();
  
  // Custom navigation object to pass to CustomTabBar
  // This mocks the necessary parts of the navigation prop
  const navigation = {
    navigate: (screenName: string) => {
      // Map screen names to page indices
      const map: Record<string, number> = {
        'settings': 1,
        'feed': 2,
        'ms': 3,
      };
      const index = map[screenName];
      if (index !== undefined) {
        pagerRef.current?.setPage(index);
      }
    },
    emit: () => ({ defaultPrevented: false }),
  };

  // Mock state and descriptors for CustomTabBar
  const state = {
    index: pageIndex === 0 ? -1 : pageIndex === 4 ? -1 : pageIndex - 1, // Map 1->0, 2->1, 3->2 for the visible tabs
    routes: [
      { key: 'settings', name: 'settings' },
      { key: 'feed', name: 'feed' },
      { key: 'ms', name: 'ms' }, // Mapped to MichaelSimoneau
    ],
  };

  const descriptors = {
    'settings': { options: { tabBarIcon: () => null } },
    'feed': { options: { tabBarIcon: () => null } },
    'ms': { options: { tabBarIcon: () => null } },
  };

  return (
    <TabPanelProvider>
      <View style={styles.container}>
        <PagerView
          ref={pagerRef}
          style={styles.pagerView}
          initialPage={2}
          onPageSelected={(e) => setPageIndex(e.nativeEvent.position)}
        >
          <View key="0">
            <ScreenAL />
          </View>
          <View key="1">
            <AccountTab />
          </View>
          <View key="2">
            <FeedTab />
          </View>
          <View key="3">
            <MSTab />
          </View>
          <View key="4">
            <ScreenAR />
          </View>
        </PagerView>

        {/* Overlay Tab Bar */}
        <View style={styles.tabBarContainer}>
          <CustomTabBar
            state={state as any}
            descriptors={descriptors as any}
            navigation={navigation as any}
            // Pass extra prop to handle manual page setting
            onTabPress={(index) => pagerRef.current?.setPage(index + 1)} 
            // Correct index mapping: Tab 0 -> Page 1, Tab 1 -> Page 2, Tab 2 -> Page 3
          />
        </View>
      </View>
    </TabPanelProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  pagerView: {
    flex: 1,
  },
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
});
