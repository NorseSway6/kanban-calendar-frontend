// src/lib/config.ts
export interface CalendarWidgetConfig {
  apiBaseUrl: string;
  telegramBotUrl: string;
  statsQueueMaxSize: number;
  platformApiUrl?: string;
}

// Конфигурация из переменных окружения
const envConfig: CalendarWidgetConfig = {
  apiBaseUrl: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api',
  telegramBotUrl: process.env.REACT_APP_TELEGRAM_BOT_URL || 'https://web.telegram.org/',
  statsQueueMaxSize: parseInt(process.env.REACT_APP_STATS_QUEUE_MAX_SIZE || '20', 10),
  platformApiUrl: process.env.REACT_APP_PLATFORM_API_URL || undefined,
};

export function getCalendarConfig(): CalendarWidgetConfig {
  return envConfig;
}

// Функция для обратной совместимости (оставьте, если где-то используется)
export function initCalendarConfig(config: Partial<CalendarWidgetConfig> = {}): void {
  console.warn('⚠️ initCalendarConfig устарел. Используйте переменные окружения (.env)');
  // Можно оставить логику слияния, если нужно
  Object.assign(envConfig, config);
}

// Экспортируем константу для удобства
export const calendarConfig = envConfig;