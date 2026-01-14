// config.ts
interface CalendarWidgetConfig {
  apiBaseUrl: string;
  telegramBotUrl: string;
  statsQueueMaxSize: number;
  platformApiUrl: string;
}

// Внутренний объект, который не экспортируем напрямую
let _config: CalendarWidgetConfig = {
  apiBaseUrl: 'http://localhost:8080/api',
  telegramBotUrl: 'https://web.telegram.org',
  statsQueueMaxSize: 20,
  platformApiUrl: 'http://localhost:8080/api',
};

// Геттер, который всегда возвращает актуальный объект
export function getCalendarConfig(): CalendarWidgetConfig {
  return _config;
}

// Сеттер для инициализации
export function initCalendarConfig(config: Partial<CalendarWidgetConfig> = {}): void {
  _config = { ..._config, ...config };
  console.log('📋 Конфигурация инициализирована:', _config);
}

// ⚠️ НЕ ИСПОЛЬЗУЙТЕ эту переменную напрямую в компонентах!
// export const calendarConfig = _config; // Удалите эту строку