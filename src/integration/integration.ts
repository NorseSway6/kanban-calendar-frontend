// src/integration/integration.ts
import { createStandaloneCallbacks } from './standalone';
import { createDefaultPlatformFunctions } from './defaultPlatform';
import { Position } from '@xyflow/react';
import { getCalendarConfig } from '../config';

export interface FlowNodeStyle {
  display?: string;
  justifyContent?: string;
  color?: string;
  fontSize?: string;
  fontWeight?: string;
  background?: string;
  [key: string]: any;
}

export interface FlowNode {
  id: string;
  type: string;
  dragHandle?: string;
  data: CalendarWidgetData;
  position: { x: number; y: number };
  sourcePosition?: Position;
  targetPosition?: Position;
  style: FlowNodeStyle;
  [key: string]: any;
}

export interface FlowNodeUpdate {
  id?: string;
  type?: string;
  dragHandle?: string;
  data?: Partial<CalendarWidgetData>;
  position?: { x: number; y: number };
  sourcePosition?: Position;
  targetPosition?: Position;
  style?: Partial<FlowNodeStyle>;
  [key: string]: any;
}

export interface CalendarWidgetData {
  label?: string;
  apiBaseUrl: string;
  platformApiUrl?: string;
  isPinned?: boolean;
  events?: any[];
  currentView?: 'month' | 'week' | 'day' | 'agenda';
  currentDate?: string;
  width?: number;
  height?: number;
  widgetType?: 'calendar';
  statsModuleToken?: string;
  [key: string]: any;
}

export interface WidgetConfig {
  widgetId: number;
  userId: number;
  role: string;
  config: FlowNode;
  board: {
    id: number;
    name: string;
    parentId: number;
  };
}

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
  
  // Колбэки событий календаря
  onEventCreate?: (event: any) => Promise<void>;
  onEventDelete?: (eventId: number) => Promise<void>;
  onEventUpdate?: (eventId: number, event: any) => Promise<void>;
  
  // Функции платформы
  saveConfig?: (updateObj: { nodeUpdates: FlowNodeUpdate }) => Promise<void>;
  subscribe?: (callback: (message: any) => void) => () => void;
  sendMessage?: (message: any) => void;
  onResize?: (width: number, height: number) => void;
  onPinToggle?: (isPinned: boolean) => void;
  
  // Функция для сохранения позиции (добавляется в CalendarNode)
  savePosition?: (position: { x: number; y: number }) => Promise<void>;
  
  [key: string]: any;
}

/**
 * 🔧 ОСНОВНАЯ ФУНКЦИЯ: Получает конфиг от платформы и преобразует его в данные виджета
 * Эта функция вызывается при создании/монтировании виджета
 * 
 * @param widgetConfig - конфигурация виджета от платформы (приходит извне)
 * @returns данные для рендеринга виджета CalendarNode
 */
// integration.ts - исправленная функция getInfo
export const getInfo = (widgetConfig: WidgetConfig): CalendarNodeData => {
  if (!widgetConfig) {
    throw new Error('WidgetConfig is required');
  }

  console.log('🔧 [getInfo] Получен конфиг от платформы:', {
    widgetId: widgetConfig.widgetId,
    userId: widgetConfig.userId,
    nodeType: widgetConfig.config.type
  });

  const widgetData = widgetConfig.config.data || {};
  
  // Берем apiBaseUrl из widgetData или используем значение по умолчанию
  const apiUrl = widgetData.apiBaseUrl || 'http://localhost:8080/api';
  const platformApiUrl = widgetData.platformApiUrl;

  // 1. Создаем колбэки для работы с событиями календаря
  const calendarCallbacks = createStandaloneCallbacks(apiUrl);
  
  // 2. Создаем платформенные функции
  console.log('🛠️ [getInfo] Создаем платформенные функции для виджета:', widgetConfig.widgetId);
  const platformFunctions = createDefaultPlatformFunctions(widgetConfig);
  
  // 3. Формируем данные для виджета
  const calendarNodeData: CalendarNodeData = {
    // Данные виджета из платформы
    label: widgetData.label || `Календарь ${widgetConfig.widgetId}`,
    apiBaseUrl: apiUrl,
    platformApiUrl: platformApiUrl,
    isPinned: widgetData.isPinned || false,
    events: widgetData.events || [],
    currentView: widgetData.currentView || 'month',
    currentDate: widgetData.currentDate || new Date().toISOString(),
    
    // Сохраняем ссылку на полный конфиг платформы
    widgetConfig: widgetConfig,
    
    // Колбэки для работы с событиями календаря
    ...calendarCallbacks,
    
    // Функции платформы
    ...platformFunctions
  };

  return calendarNodeData;
};