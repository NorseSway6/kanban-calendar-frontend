// src/integration/integration.ts
import { createStandaloneCallbacks } from './standalone';
import { createDefaultPlatformFunctions } from './defaultPlatform';
import { Position } from '@xyflow/react';

// Полная структура ноды, которую хранит платформа (как на фото)
export interface FlowNode {
  id: string;
  type: string;
  dragHandle?: string;
  data: CalendarWidgetData;
  position: { x: number; y: number };
  sourcePosition?: Position;
  targetPosition?: Position;
  style: Record<string, any>;
  selected?: boolean;
  dragging?: boolean;
  connectable?: boolean;
  [key: string]: any;
}

// Кастомные данные вашего виджета (хранятся в data)
export interface CalendarWidgetData {
  // Основные поля
  label?: string;
  apiBaseUrl?: string;
  platformApiUrl?: string;
  
  // Состояние виджета
  isPinned?: boolean;
  events?: any[];
  currentView?: 'month' | 'week' | 'day' | 'agenda';
  currentDate?: string;
  
  // Любые другие кастомные поля
  width?: number;
  height?: number;
  showWeekends?: boolean;
  showCompleted?: boolean;
  widgetType?: 'calendar';
  
  [key: string]: any;
}

// Структура, которую получает виджет от платформы
export interface WidgetConfig {
  widgetId: number;
  userId: number;
  role: string;
  config: FlowNode;  // ВАЖНО: поле называется config, а не node
  board: {
    id: number;
    name: string;
    parentId: number;
  };
}

// Данные, которые передаются в CalendarNode (App компоненту)
export interface CalendarNodeData {
  // Данные из config.data
  label?: string;
  apiBaseUrl?: string;
  platformApiUrl?: string;
  isPinned?: boolean;
  events?: any[];
  currentView?: string;
  currentDate?: string;
  
  // Ссылка на весь конфиг
  widgetConfig?: WidgetConfig;
  
  // Колбэки событий календаря (всегда из standalone)
  onEventCreate?: (event: any) => Promise<void>;
  onEventDelete?: (eventId: number) => Promise<void>;
  onEventUpdate?: (eventId: number, event: any) => Promise<void>;
  
  // Функции платформы (всегда дефолтные)
  saveConfig?: (nodeUpdates: Partial<FlowNode>) => Promise<void>;
  subscribe?: (callback: (message: any) => void) => () => void;
  sendMessage?: (message: any) => void;
  onResize?: (width: number, height: number) => void;
  onPinToggle?: (isPinned: boolean) => void;
  
  [key: string]: any;
}

// 🔧 Основная функция для получения данных виджета
export const getInfo = (
  widgetInfo: WidgetConfig
): CalendarNodeData => {
  const apiUrl = widgetInfo.config.data?.apiBaseUrl || 'http://localhost:8080/api';
  
  // Всегда используем standalone для событий календаря
  const calendarCallbacks = createStandaloneCallbacks(apiUrl);
  
  // Создаем дефолтные платформенные функции
  const platformFunctions = createDefaultPlatformFunctions(widgetInfo);
  
  // Извлекаем данные из config.data
  const widgetData = widgetInfo.config.data || {};
  
  return {
    // Данные из config.data
    label: widgetData.label || 'Календарь',
    apiBaseUrl: widgetData.apiBaseUrl || apiUrl,
    platformApiUrl: widgetData.platformApiUrl,
    isPinned: widgetData.isPinned || false,
    events: widgetData.events || [],
    currentView: widgetData.currentView || 'month',
    currentDate: widgetData.currentDate || new Date().toISOString(),
    
    // Сохраняем ссылку на весь конфиг
    widgetConfig: widgetInfo,
    
    // События календаря - всегда из standalone
    onEventCreate: calendarCallbacks.onEventCreate,
    onEventDelete: calendarCallbacks.onEventDelete,
    onEventUpdate: calendarCallbacks.onEventUpdate,
    
    // Платформенные функции - всегда дефолтные
    ...platformFunctions
  };
};