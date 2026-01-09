// src/integration/defaultPlatform.ts
import { WidgetConfig } from './integration';

// Простой EventEmitter для подписок
class DefaultEventEmitter {
  private listeners: Map<string, Set<(message: any) => void>> = new Map();

  subscribe(widgetId: string, callback: (message: any) => void): () => void {
    if (!this.listeners.has(widgetId)) {
      this.listeners.set(widgetId, new Set());
    }
    this.listeners.get(widgetId)!.add(callback);
    
    return () => {
      const widgetListeners = this.listeners.get(widgetId);
      if (widgetListeners) {
        widgetListeners.delete(callback);
        if (widgetListeners.size === 0) {
          this.listeners.delete(widgetId);
        }
      }
    };
  }

  sendMessage(widgetId: string, message: any) {
    const widgetListeners = this.listeners.get(widgetId);
    if (widgetListeners) {
      widgetListeners.forEach(callback => callback(message));
    }
  }

  broadcast(message: any) {
    this.listeners.forEach(listeners => {
      listeners.forEach(callback => callback(message));
    });
  }
}

// Глобальный экземпляр для standalone режима
const defaultEventEmitter = new DefaultEventEmitter();

// Дефолтное сохранение конфига (в localStorage)
export const defaultSaveConfig = async (
  widgetId: number, 
  configUpdates: Partial<WidgetConfig['config']>
): Promise<void> => {
  console.log('💾 [Default] Сохраняем конфиг для виджета', widgetId, configUpdates);
  
  const storageKey = `calendar_widget_${widgetId}`;
  const currentConfig = JSON.parse(localStorage.getItem(storageKey) || '{}');
  const updatedConfig = { ...currentConfig, ...configUpdates };
  localStorage.setItem(storageKey, JSON.stringify(updatedConfig));
};

// Дефолтная подписка на сообщения
export const defaultSubscribe = (widgetId: string, callback: (message: any) => void) => {
  return defaultEventEmitter.subscribe(widgetId, callback);
};

// Дефолтная отправка сообщений
export const defaultSendMessage = (widgetId: string, message: any) => {
  defaultEventEmitter.sendMessage(widgetId, message);
};

// Дефолтная рассылка сообщений всем виджетам
export const defaultBroadcastMessage = (message: any) => {
  defaultEventEmitter.broadcast(message);
};

// Дефолтные обработчики (пустые, если не нужны)
export const defaultOnResize = (width: number, height: number) => {
  // Можно оставить пустым или добавить логирование
  console.log('📏 [Default] Изменение размера:', { width, height });
};

export const defaultOnPinToggle = (isPinned: boolean) => {
  console.log('📌 [Default] Изменение закрепления:', isPinned);
};

// Хелпер для создания полного набора дефолтных функций для виджета
export const createDefaultPlatformFunctions = (widgetId: number, widgetConfig: WidgetConfig) => ({
  saveConfig: async (configUpdates: Partial<WidgetConfig['config']>) => {
    await defaultSaveConfig(widgetId, configUpdates);
    // Обновляем переданный конфиг
    widgetConfig.config = { ...widgetConfig.config, ...configUpdates };
  },
  
  subscribe: (callback: (message: any) => void) => 
    defaultSubscribe(`calendar-${widgetId}`, callback),
    
  sendMessage: (message: any) => 
    defaultSendMessage(`calendar-${widgetId}`, message),
    
  onResize: defaultOnResize,
  onPinToggle: defaultOnPinToggle,
});