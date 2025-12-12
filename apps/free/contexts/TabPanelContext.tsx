import { createContext, useContext, useState, ReactNode } from 'react';
import type { FeedPost } from '@/services/linkedin/feed';

type PanelType = 'comment' | 'tiles' | null;

interface TabPanelContextValue {
  panelType: PanelType;
  activePost: FeedPost | null;
  openCommentPanel: (post: FeedPost) => void;
  openTilesPanel: () => void;
  closePanel: () => void;
  onPostCreated: ((post: FeedPost) => void) | null;
  setPostCreatedCallback: (callback: (post: FeedPost) => void) => void;
}

const TabPanelContext = createContext<TabPanelContextValue | null>(null);

export function TabPanelProvider({ children }: { children: ReactNode }) {
  const [panelType, setPanelType] = useState<PanelType>(null);
  const [activePost, setActivePost] = useState<FeedPost | null>(null);
  const [onPostCreated, setOnPostCreated] = useState<((post: FeedPost) => void) | null>(null);

  const openCommentPanel = (post: FeedPost) => {
    setActivePost(post);
    setPanelType('comment');
  };

  const openTilesPanel = () => {
    setActivePost(null);
    setPanelType('tiles');
  };

  const closePanel = () => {
    setPanelType(null);
    setActivePost(null);
  };

  const setPostCreatedCallback = (callback: (post: FeedPost) => void) => {
    setOnPostCreated(() => callback);
  };

  return (
    <TabPanelContext.Provider
      value={{
        panelType,
        activePost,
        openCommentPanel,
        openTilesPanel,
        closePanel,
        onPostCreated,
        setPostCreatedCallback,
      }}
    >
      {children}
    </TabPanelContext.Provider>
  );
}

export function useTabPanel() {
  const context = useContext(TabPanelContext);
  if (!context) {
    throw new Error('useTabPanel must be used within TabPanelProvider');
  }
  return context;
}
