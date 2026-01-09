// src/integration/integration.ts
import { createStandaloneCallbacks } from './standalone';
import { createDefaultPlatformFunctions } from './defaultPlatform';

export interface WidgetConfig {
  widgetId: number;
  userId: number;
  role: string;
  config: {
    apiBaseUrl?: string;
    label?: string;
    events?: any[];
    width?: number;
    height?: number;
    isPinned?: boolean;
    [key: string]: any;
  };
  board: {
    id: number;
    name: string;
    parentId: number;
  };
}

export interface CalendarNodeData {
  // Основные данные
  label?: string;
  apiBaseUrl?: string;
  events?: any[];
  isPinned?: boolean;
  widgetConfig?: WidgetConfig;
  
  // Колбэки (всегда из standalone)
  onEventCreate?: (event: any) => Promise<void>;
  onEventDelete?: (eventId: number) => Promise<void>;
  onEventUpdate?: (eventId: number, event: any) => Promise<void>;
  
  // Функции платформы
  onResize?: (width: number, height: number) => void;
  onPinToggle?: (isPinned: boolean) => void;
  saveConfig?: (config: Partial<WidgetConfig['config']>) => Promise<void>;
  subscribe?: (callback: (message: any) => void) => () => void;
  sendMessage?: (message: any) => void;
  
  [key: string]: any;
}

// 🔧 Упрощенная версия - всегда используем standalone + дефолтные платформенные функции
export const getInfo = (
  widgetInfo: WidgetConfig
): CalendarNodeData => {
  const apiUrl = widgetInfo.config.apiBaseUrl || 'http://localhost:8080/api';
  
  // Всегда используем standalone для событий календаря
  const calendarCallbacks = createStandaloneCallbacks(apiUrl);
  
  // Создаем дефолтные платформенные функции
  const platformFunctions = createDefaultPlatformFunctions(widgetInfo.widgetId, widgetInfo);
  
  return {
    label: widgetInfo.config.label || 'Календарь',
    apiBaseUrl: apiUrl,
    events: widgetInfo.config.events || [],
    isPinned: widgetInfo.config.isPinned || false,
    widgetConfig: widgetInfo,
    
    // События календаря - всегда из standalone
    onEventCreate: calendarCallbacks.onEventCreate,
    onEventDelete: calendarCallbacks.onEventDelete,
    onEventUpdate: calendarCallbacks.onEventUpdate,
    
    // Платформенные функции - всегда дефолтные
    ...platformFunctions
  };
};