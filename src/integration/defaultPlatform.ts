// src/integration/defaultPlatform.ts
import { WidgetConfig, FlowNode, CalendarWidgetData } from './integration';

// Простой EventEmitter для подписок
class DefaultEventEmitter {
  private listeners: Map<string, Set<(message: any) => void>> = new Map();

  // Подписка на сообщения для конкретного виджета
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

  // Отправка сообщения конкретному виджету
  sendMessage(widgetId: string, message: any) {
    const widgetListeners = this.listeners.get(widgetId);
    if (widgetListeners) {
      widgetListeners.forEach(callback => callback(message));
    }
  }

  // Рассылка сообщения всем виджетам
  broadcast(message: any) {
    this.listeners.forEach(listeners => {
      listeners.forEach(callback => callback(message));
    });
  }
}

// Глобальный экземпляр для standalone режима
const defaultEventEmitter = new DefaultEventEmitter();

/**
 * Сохранение полной ноды на платформу
 * @param widgetConfig - полный конфиг виджета
 * @param nodeUpdates - частичные обновления ноды
 */
export const defaultSaveConfig = async (
  widgetConfig: WidgetConfig,
  nodeUpdates: Partial<FlowNode>
): Promise<void> => {
  console.log('💾 [Default] Сохраняем конфиг для виджета', widgetConfig.widgetId, nodeUpdates);
  
  // 1. Создаем обновленную ноду (глубокое слияние)
  const updatedNode: FlowNode = {
    ...widgetConfig.config,
    ...nodeUpdates,
    // Глубокое слияние для вложенных объектов
    data: {
      ...widgetConfig.config.data,
      ...(nodeUpdates.data || {})
    },
    position: {
      ...widgetConfig.config.position,
      ...(nodeUpdates.position || {})
    },
    style: {
      ...widgetConfig.config.style,
      ...(nodeUpdates.style || {})
    }
  };

  // 2. Сохраняем в localStorage для кэша
  const storageKey = `calendar_widget_${widgetConfig.widgetId}`;
  localStorage.setItem(storageKey, JSON.stringify(updatedNode));
  
  // 3. Обновляем локальный конфиг
  widgetConfig.config = updatedNode;
  
  // 4. Отправляем на платформу (если URL указан)
  const platformApiUrl = widgetConfig.config.data?.platformApiUrl;
  
  if (platformApiUrl) {
    console.log(`📤 Отправляем конфиг на платформу: ${platformApiUrl}/widget/${widgetConfig.widgetId}`);
    
    // ЗАКОММЕНТИРОВАНО для демо-режима. В реальной интеграции раскомментировать:
    /*
    try {
      const response = await fetch(`${platformApiUrl}/widget/${widgetConfig.widgetId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedNode),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Ошибка сохранения конфига: ${response.status} ${errorText}`);
      }
      
      console.log('✅ Конфиг успешно отправлен на платформу');
    } catch (error) {
      console.error('❌ Ошибка отправки ноды на платформу:', error);
      throw error;
    }
    */
  } else {
    console.log('🔄 Конфиг сохранен локально (platformApiUrl не указан)');
  }
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

// Дефолтный обработчик изменения размера
export const defaultOnResize = (width: number, height: number) => {
  console.log('📏 [Default] Изменение размера:', { width, height });
};

// Дефолтный обработчик изменения состояния закрепления
export const defaultOnPinToggle = (isPinned: boolean) => {
  console.log('📌 [Default] Изменение закрепления:', isPinned);
};

/**
 * Создание полного набора функций платформы для виджета
 * @param widgetConfig - полный конфиг виджета
 */
export const createDefaultPlatformFunctions = (widgetConfig: WidgetConfig) => {
  // Функция сохранения конфига
  const saveConfig = async (nodeUpdates: Partial<FlowNode>) => {
    try {
      // Сохраняем в дефолтную систему
      await defaultSaveConfig(widgetConfig, nodeUpdates);
      console.log('✅ Конфиг обновлен локально и отправлен на платформу');
    } catch (error) {
      console.error('❌ Ошибка сохранения конфига:', error);
      throw error;
    }
  };
  
  // Функция подписки на сообщения
  const subscribe = (callback: (message: any) => void) => {
    return defaultSubscribe(`calendar-${widgetConfig.widgetId}`, callback);
  };
  
  // Функция отправки сообщения
  const sendMessage = (message: any) => {
    defaultSendMessage(`calendar-${widgetConfig.widgetId}`, message);
  };
  
  return {
    saveConfig,
    subscribe,
    sendMessage,
    onResize: defaultOnResize,
    onPinToggle: defaultOnPinToggle,
  };
};