// src/config.ts

/**
 * Конфигурация виджета календаря.
 * Разработчики должны инициализировать этот объект перед использованием модуля.
 */
export interface CalendarWidgetConfig {
  /**
   * Базовый URL API календаря (бэкенд)
   * @default 'http://localhost:8080/api'
   */
  apiBaseUrl: string;
  
  /**
   * Ссылка на Telegram бота для напоминаний
   * @default 'https://web.telegram.org/k/#@my_test_1234567890_bo_bot'
   */
  telegramBotUrl: string;
  
  /**
   * Максимальный размер очереди событий для статистики
   * @default 20
   */
  statsQueueMaxSize: number;
  
  /**
   * Базовый URL платформы заказчика
   * Используется для сохранения конфигурации виджета
   * @default undefined (сохранение только локально)
   */
  platformApiUrl: string;
}

/**
 * Экземпляр конфигурации, который должен быть инициализирован разработчиком
 */
export let calendarConfig: CalendarWidgetConfig = {
  apiBaseUrl: 'http://localhost:8080/api',
  telegramBotUrl: 'https://web.telegram.org/k/#@my_test_1234567890_bo_bot',
  statsQueueMaxSize: 20,
  platformApiUrl: 'http://localhost:8080/api',
};

/**
 * Функция инициализации конфигурации.
 * Должна вызываться разработчиком перед использованием модуля.
 * @param config - Пользовательская конфигурация
 */
export function initCalendarConfig(config: Partial<CalendarWidgetConfig> = {}): void {
  calendarConfig = {
    ...calendarConfig,
    ...config,
  };
  
  console.log('📋 Конфигурация календаря инициализирована:', calendarConfig);
}