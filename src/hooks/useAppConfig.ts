export const useAppConfig = () => {
  return {
    apiBaseUrl: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api',
    telegramBotUrl: process.env.REACT_APP_TELEGRAM_BOT_URL || 'https://web.telegram.org/k/#@my_test_1234567890_bo_bot',
    statsQueueMaxSize: parseInt(process.env.REACT_APP_STATS_QUEUE_MAX_SIZE || '20', 10),
    platformApiUrl: process.env.REACT_APP_PLATFORM_API_URL,
  };
};