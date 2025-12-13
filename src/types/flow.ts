// types/flow.ts
export type CalendarNodeData = {
  label?: string;
  initialEvents?: any[]; // any только для сложных вложенных типов
};

export type CalendarNodeProps = {
  data: CalendarNodeData;
  isConnectable?: boolean;
  selected?: boolean;
  [key: string]: any; // Остальные поля как any
};