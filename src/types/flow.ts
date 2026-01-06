// src/types/flow.ts
import { Node } from '@xyflow/react';

export interface CalendarNodeData {
  label?: string;
  apiBaseUrl?: string;
  isPinned?: boolean;
  width?: number;
  height?: number;
  events?: any[];
  onEventCreate?: (event: any) => Promise<void>;
  onEventDelete?: (eventId: number) => Promise<void>;
  onEventUpdate?: (eventId: number, event: any) => Promise<void>;
  onResize?: (width: number, height: number) => void;
  onPinToggle?: (isPinned: boolean) => void;
  [key: string]: any; // Индексная сигнатура для совместимости с Record<string, unknown>
}

// Правильный тип для пропсов ноды
export interface CalendarNodeProps {
  data: CalendarNodeData;
  isConnectable?: boolean;
  selected?: boolean;
}

// Тип для ноды в React Flow
export type CalendarNodeType = Node<CalendarNodeData, 'calendarNode'>;