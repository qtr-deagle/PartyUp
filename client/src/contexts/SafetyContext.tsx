import React, { createContext, useContext, useState, useEffect } from 'react';

type SafetyUIStyle = 'floating' | 'edge';

interface SafetyContextType {
  uiStyle: SafetyUIStyle;
  setUIStyle: (style: SafetyUIStyle) => void;
  edgeTabEnabled: boolean;
  setEdgeTabEnabled: (enabled: boolean) => void;
  liveLocationEnabled: boolean;
  setLiveLocationEnabled: (enabled: boolean) => void;
  warningAlertEnabled: boolean;
  setWarningAlertEnabled: (enabled: boolean) => void;
  sosEnabled: boolean;
  setSosEnabled: (enabled: boolean) => void;
}

const SafetyContext = createContext<SafetyContextType | undefined>(undefined);

export function SafetyProvider({ children }: { children: React.ReactNode }) {
  const [uiStyle, setUIStyleState] = useState<SafetyUIStyle>(() => {
    // Load from localStorage
    const saved = localStorage.getItem('safetyUIStyle');
    return (saved as SafetyUIStyle) || 'floating';
  });

  const [edgeTabEnabled, setEdgeTabEnabledState] = useState<boolean>(() => {
    const saved = localStorage.getItem('edgeTabEnabled');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [liveLocationEnabled, setLiveLocationEnabledState] = useState<boolean>(() => {
    const saved = localStorage.getItem('liveLocationEnabled');
    return saved !== null ? JSON.parse(saved) : false;
  });

  const [warningAlertEnabled, setWarningAlertEnabledState] = useState<boolean>(() => {
    const saved = localStorage.getItem('warningAlertEnabled');
    return saved !== null ? JSON.parse(saved) : false;
  });

  const [sosEnabled, setSosEnabledState] = useState<boolean>(() => {
    const saved = localStorage.getItem('sosEnabled');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const setUIStyle = (style: SafetyUIStyle) => {
    setUIStyleState(style);
    localStorage.setItem('safetyUIStyle', style);
  };

  const setEdgeTabEnabled = (enabled: boolean) => {
    setEdgeTabEnabledState(enabled);
    localStorage.setItem('edgeTabEnabled', JSON.stringify(enabled));
  };

  const setLiveLocationEnabled = (enabled: boolean) => {
    setLiveLocationEnabledState(enabled);
    localStorage.setItem('liveLocationEnabled', JSON.stringify(enabled));
  };

  const setWarningAlertEnabled = (enabled: boolean) => {
    setWarningAlertEnabledState(enabled);
    localStorage.setItem('warningAlertEnabled', JSON.stringify(enabled));
  };

  const setSosEnabled = (enabled: boolean) => {
    setSosEnabledState(enabled);
    localStorage.setItem('sosEnabled', JSON.stringify(enabled));
  };

  return (
    <SafetyContext.Provider value={{ 
      uiStyle, 
      setUIStyle, 
      edgeTabEnabled, 
      setEdgeTabEnabled,
      liveLocationEnabled,
      setLiveLocationEnabled,
      warningAlertEnabled,
      setWarningAlertEnabled,
      sosEnabled,
      setSosEnabled
    }}>
      {children}
    </SafetyContext.Provider>
  );
}

export function useSafetyUI() {
  const context = useContext(SafetyContext);
  if (!context) {
    throw new Error('useSafetyUI must be used within SafetyProvider');
  }
  return context;
}
