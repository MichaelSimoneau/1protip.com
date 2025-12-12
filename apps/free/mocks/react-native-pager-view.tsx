import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { View, ScrollView, NativeSyntheticEvent, NativeScrollEvent, StyleSheet, LayoutChangeEvent } from 'react-native';

const PagerView = forwardRef<any, any>(({ 
  children, 
  initialPage = 0, 
  onPageSelected,
  onPageScroll,
  onPageScrollStateChanged,
  scrollEnabled = true,
  style,
  ...props 
}, ref) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const [layoutWidth, setLayoutWidth] = useState(0);
  const [currentPage, setCurrentPage] = useState(initialPage);

  useImperativeHandle(ref, () => ({
    setPage: (index: number) => {
      if (scrollViewRef.current && layoutWidth > 0) {
        scrollViewRef.current.scrollTo({ x: index * layoutWidth, animated: true });
        // Don't set state here, let scroll event handle it? 
        // Or set it if we want immediate update.
        // onPageSelected is usually called after animation.
      }
    },
    setPageWithoutAnimation: (index: number) => {
      if (scrollViewRef.current && layoutWidth > 0) {
        scrollViewRef.current.scrollTo({ x: index * layoutWidth, animated: false });
      }
    },
    setScrollEnabled: () => {
        // No-op, driven by prop
    }
  }));

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (layoutWidth === 0) return;
    
    if (onPageScroll) {
       const position = Math.floor(e.nativeEvent.contentOffset.x / layoutWidth);
       const offset = (e.nativeEvent.contentOffset.x % layoutWidth) / layoutWidth;
       
       onPageScroll({
         nativeEvent: {
           position: position,
           offset: offset
         }
       });
    }
  };

  const handleMomentumScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (layoutWidth === 0) return;
    const page = Math.round(e.nativeEvent.contentOffset.x / layoutWidth);
    if (page !== currentPage) {
      setCurrentPage(page);
      if (onPageSelected) {
        onPageSelected({ nativeEvent: { position: page } });
      }
    }
  };

  const onLayout = (e: LayoutChangeEvent) => {
      const width = e.nativeEvent.layout.width;
      if (width !== layoutWidth) {
          setLayoutWidth(width);
          // Scroll to initial page if this is the first layout
          if (layoutWidth === 0 && initialPage > 0) {
               // Use a small timeout to ensure layout is applied
               setTimeout(() => {
                   scrollViewRef.current?.scrollTo({ x: initialPage * width, animated: false });
               }, 0);
          }
      }
  };

  return (
    <ScrollView
      ref={scrollViewRef}
      horizontal
      pagingEnabled
      scrollEnabled={scrollEnabled}
      onLayout={onLayout}
      onScroll={handleScroll}
      onMomentumScrollEnd={handleMomentumScrollEnd}
      scrollEventThrottle={16}
      showsHorizontalScrollIndicator={false}
      style={[styles.container, style]}
      contentContainerStyle={styles.contentContainer}
      {...props}
    >
      {React.Children.map(children, (child, index) => (
        <View style={{ width: layoutWidth > 0 ? layoutWidth : '100%', height: '100%' }}>
          {child}
        </View>
      ))}
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
});

export default PagerView;

