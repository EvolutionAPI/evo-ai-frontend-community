import React, { createContext, useContext, useReducer, useCallback } from 'react';

interface UIState {
  // UI State
  contactDrawerOpen: boolean;
  sidebarCollapsed: boolean;
}

type UIAction =
  | { type: 'SET_CONTACT_DRAWER'; payload: boolean }
  | { type: 'TOGGLE_CONTACT_DRAWER' }
  | { type: 'SET_SIDEBAR_COLLAPSED'; payload: boolean }
  | { type: 'TOGGLE_SIDEBAR' };

const initialState: UIState = {
  contactDrawerOpen: false,
  sidebarCollapsed: false,
};

function uiReducer(state: UIState, action: UIAction): UIState {
  switch (action.type) {
    case 'SET_CONTACT_DRAWER':
      return {
        ...state,
        contactDrawerOpen: action.payload,
      };

    case 'TOGGLE_CONTACT_DRAWER':
      return {
        ...state,
        contactDrawerOpen: !state.contactDrawerOpen,
      };

    case 'SET_SIDEBAR_COLLAPSED':
      return {
        ...state,
        sidebarCollapsed: action.payload,
      };

    case 'TOGGLE_SIDEBAR':
      return {
        ...state,
        sidebarCollapsed: !state.sidebarCollapsed,
      };

    default:
      return state;
  }
}

interface UIContextValue {
  state: UIState;

  // UI actions
  toggleContactDrawer: () => void;
  setContactDrawer: (open: boolean) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

const UIContext = createContext<UIContextValue | undefined>(undefined);

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(uiReducer, initialState);

  // UI actions
  const toggleContactDrawer = useCallback(() => {
    dispatch({ type: 'TOGGLE_CONTACT_DRAWER' });
  }, []);

  const setContactDrawer = useCallback((open: boolean) => {
    dispatch({ type: 'SET_CONTACT_DRAWER', payload: open });
  }, []);

  const toggleSidebar = useCallback(() => {
    dispatch({ type: 'TOGGLE_SIDEBAR' });
  }, []);

  const setSidebarCollapsed = useCallback((collapsed: boolean) => {
    dispatch({ type: 'SET_SIDEBAR_COLLAPSED', payload: collapsed });
  }, []);

  const contextValue: UIContextValue = {
    state,
    toggleContactDrawer,
    setContactDrawer,
    toggleSidebar,
    setSidebarCollapsed,
  };

  return <UIContext.Provider value={contextValue}>{children}</UIContext.Provider>;
}

export function useUI() {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
}
