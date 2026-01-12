// src/contexts/StatContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import StatService from '../services/StatService';

interface StatContextType {
  statService: StatService | null;
  trackEvent: (eventType: string, metadata?: Record<string, any>) => void;
  getStats: () => any;
}

const StatContext = createContext<StatContextType>({
  statService: null,
  trackEvent: () => {},
  getStats: () => null
});

export const useStat = () => useContext(StatContext);

interface StatProviderProps {
  children: React.ReactNode;
  widgetId?: number;
  userId?: number;
  moduleToken?: string;
}

export const StatProvider: React.FC<StatProviderProps> = ({ 
  children, 
  widgetId = 0, 
  userId = 0,
  moduleToken
}) => {
  const [statService, setStatService] = useState<StatService | null>(null);

  useEffect(() => {
    const service = new StatService(moduleToken, widgetId, userId);
    setStatService(service);

    // Отправляем статистику при закрытии страницы
    const handleBeforeUnload = () => {
      service.flushQueue();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      service.flushQueue(); // Отправляем оставшиеся события
    };
  }, [widgetId, userId, moduleToken]);

  const trackEvent = (eventType: string, metadata?: Record<string, any>) => {
    if (statService) {
      statService.trackEvent(eventType, metadata);
    }
  };

  const getStats = () => {
    return statService?.getStats() || null;
  };

  return (
    <StatContext.Provider value={{ statService, trackEvent, getStats }}>
      {children}
    </StatContext.Provider>
  );
};