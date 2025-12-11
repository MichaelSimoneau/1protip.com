import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useState, useRef, useEffect } from 'react';

export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const [showPanel, setShowPanel] = useState<number | null>(null);
  const panelHeight = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(panelHeight, {
      toValue: showPanel !== null ? 300 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [showPanel]);

  const handleTabPress = (index: number) => {
    const isFocused = state.index === index;

    if (isFocused) {
      if (showPanel === index) {
        setShowPanel(null);
      } else {
        setShowPanel(index);
      }
    } else {
      setShowPanel(null);
      const event = navigation.emit({
        type: 'tabPress',
        target: state.routes[index].key,
        canPreventDefault: true,
      });

      if (!event.defaultPrevented) {
        navigation.navigate(state.routes[index].name);
      }
    }
  };

  const renderPanel = (routeName: string) => {
    switch (routeName) {
      case 'settings':
        return (
          <View style={styles.panelContent}>
            <Text style={styles.panelTitle}>Account Actions</Text>
            <Text style={styles.panelText}>Quick settings and account options</Text>
          </View>
        );
      case 'feed':
        return (
          <View style={styles.panelContent}>
            <Text style={styles.panelTitle}>Feed Actions</Text>
            <Text style={styles.panelText}>Filter, sort, and manage your feed</Text>
          </View>
        );
      case 'ms':
        return (
          <View style={styles.panelContent}>
            <Text style={styles.panelTitle}>MS Actions</Text>
            <Text style={styles.panelText}>Michael Simoneau quick actions</Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.panel, { height: panelHeight }]}>
        {showPanel !== null && renderPanel(state.routes[showPanel].name)}
      </Animated.View>

      <View style={styles.tabBar}>
        {state.routes.map((route, index) => {
          if (route.name === 'index') return null;

          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          const isPanelOpen = showPanel === index;

          return (
            <Pressable
              key={route.key}
              onPress={() => handleTabPress(index)}
              style={[
                styles.tab,
                isFocused && styles.tabActive,
                isPanelOpen && styles.tabWithPanel,
              ]}
            >
              {options.tabBarIcon &&
                options.tabBarIcon({
                  focused: isFocused,
                  color: isFocused ? '#ffffff' : '#666666',
                  size: 32,
                })}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  panel: {
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    overflow: 'hidden',
  },
  panelContent: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  panelTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  panelText: {
    fontSize: 16,
    color: '#666666',
  },
  tabBar: {
    flexDirection: 'row',
    height: 120,
    paddingBottom: 16,
    paddingTop: 16,
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginHorizontal: 8,
  },
  tabActive: {
    backgroundColor: '#0066cc',
  },
  tabWithPanel: {
    backgroundColor: '#0052a3',
  },
});
