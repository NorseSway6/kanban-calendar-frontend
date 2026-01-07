// src/integration/integration.ts
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
    [key: string]: any;
  };
  board: {
    id: number;
    name: string;
    parentId: number;
  };
}

export interface CalendarNodeData {
  label?: string;
  apiBaseUrl?: string;
  events?: any[];
  isPinned?: boolean;
  widgetConfig?: WidgetConfig;
  onEventCreate?: (event: any) => Promise<void>;
  onEventDelete?: (eventId: number) => Promise<void>;
  onEventUpdate?: (eventId: number, event: any) => Promise<void>;
  onResize?: (width: number, height: number) => void;
  onPinToggle?: (isPinned: boolean) => void;
  [key: string]: any; // Индексная сигнатура для совместимости
}

export const getInfo = (widgetInfo: WidgetConfig): Record<string, any> => {
  console.log('Получена конфигурация виджета:', widgetInfo);
  
  return {
    label: widgetInfo.config.label || 'Календарь',
    apiBaseUrl: widgetInfo.config.apiBaseUrl || 'http://localhost:8080/api',
    events: widgetInfo.config.events || [],
    widgetConfig: widgetInfo,
    
    onEventCreate: async (event: any) => {
      console.log('Создано событие:', event);
    },
    
    onEventDelete: async (eventId: number) => {
      console.log('Удалено событие:', eventId);
    },
    
    onEventUpdate: async (eventId: number, event: any) => {
      console.log('Обновлено событие:', eventId, event);
    },
    
    onResize: (size: { width: number; height: number }) => {
      console.log('Изменен размер виджета:', size);
    },
    
    onPinToggle: (isPinned: boolean) => {
      console.log('Изменено закрепление:', isPinned);
    }
  };
};