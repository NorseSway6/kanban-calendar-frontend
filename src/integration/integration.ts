// src/integration/integration.ts
export interface PlatformAPI {
  saveWidgetConfig: (config: WidgetConfig) => Promise<void>;
  sendWebSocket?: (message: any) => void;
  subscribeToMessages?: (callback: (message: any) => void) => () => void;
}

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
  saveConfig?: (config: Partial<WidgetConfig['config']>) => Promise<void>;
  subscribe?: (callback: (message: any) => void) => () => void;
  sendMessage?: (message: any) => void;
}

export const getInfo = (widgetInfo: WidgetConfig, platformAPI?: PlatformAPI): Record<string, any> => {
  return {
    label: widgetInfo.config.label || 'Календарь',
    apiBaseUrl: widgetInfo.config.apiBaseUrl,
    events: widgetInfo.config.events || [],
    isPinned: widgetInfo.config.isPinned || false,
    widgetConfig: widgetInfo,

    saveConfig: async (updatedConfig: Partial<WidgetConfig['config']>) => {
      if (!platformAPI?.saveWidgetConfig) {
        console.warn('Функция saveWidgetConfig не предоставлена платформой');
        return;
      }
      
      const fullConfig: WidgetConfig = {
        ...widgetInfo,
        config: {
          ...widgetInfo.config,
          ...updatedConfig
        }
      };
      
      try {
        await platformAPI.saveWidgetConfig(fullConfig);
        console.log('✅ Конфиг сохранен:', fullConfig);
      } catch (error) {
        console.error('❌ Ошибка сохранения конфига:', error);
        throw error;
      }
    },
    
    onEventCreate: async (event: any) => {},
    
    onEventDelete: async (eventId: number) => {},
    
    onEventUpdate: async (eventId: number, event: any) => {},
    
    onResize: (size: { width: number; height: number }) => {},
    
    onPinToggle: (isPinned: boolean) => {},

    subscribe: platformAPI?.subscribeToMessages,
    
    sendMessage: platformAPI?.sendWebSocket,
  };
};