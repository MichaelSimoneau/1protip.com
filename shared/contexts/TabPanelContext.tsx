import { createContext, useContext, useState, ReactNode } from 'react';
import type { Tip } from '@/services/supabase/types';

type PanelType = 'comment' | 'tiles' | null;

interface TabPanelContextValue {
  panelType: PanelType;
  activePost: Tip | null;
  openCommentPanel: (post: Tip) => void;
  openTilesPanel: () => void;
  closePanel: () => void;
}

const TabPanelContext = createContext<TabPanelContextValue | null>(null);

export function TabPanelProvider({ children }: { children: ReactNode }) {
  const [panelType, setPanelType] = useState<PanelType>(null);
  const [activePost, setActivePost] = useState<Tip | null>(null);

  const openCommentPanel = (post: Tip) => {
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

  return (
    <TabPanelContext.Provider
      value={{
        panelType,
        activePost,
        openCommentPanel,
        openTilesPanel,
        closePanel,
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
