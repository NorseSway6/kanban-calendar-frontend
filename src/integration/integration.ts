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
}

export const getInfo = (widgetInfo: WidgetConfig): Record<string, any> => {
  return {
    label: widgetInfo.config.label || 'Календарь',
    apiBaseUrl: widgetInfo.config.apiBaseUrl || 'http://localhost:8080/api',
    events: widgetInfo.config.events || [],
    widgetConfig: widgetInfo,
    
    onEventCreate: async (event: any) => {},
    
    onEventDelete: async (eventId: number) => {},
    
    onEventUpdate: async (eventId: number, event: any) => {},
    
    onResize: (size: { width: number; height: number }) => {},
    
    onPinToggle: (isPinned: boolean) => {}
  };
};