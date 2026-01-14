// src/integration/defaultPlatform.ts
import { WidgetConfig, FlowNode, CalendarWidgetData, FlowNodeUpdate } from './integration';

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

const defaultEventEmitter = new DefaultEventEmitter();

/**
 * Сохранение полной ноды на платформу
 * @param widgetConfig - полный конфиг виджета
 * @param nodeUpdates - частичные обновления ноды
 */
export const defaultSaveConfig = async (
  widgetConfig: WidgetConfig,
  nodeUpdates: FlowNodeUpdate
): Promise<void> => {
  
  // 1. Создаем обновленную ноду (глубокое слияние)
  const updatedNode: FlowNode = {
    ...widgetConfig.config,
    // Основные поля
    ...(nodeUpdates.id && { id: nodeUpdates.id }),
    ...(nodeUpdates.type && { type: nodeUpdates.type }),
    ...(nodeUpdates.dragHandle && { dragHandle: nodeUpdates.dragHandle }),
    ...(nodeUpdates.sourcePosition && { sourcePosition: nodeUpdates.sourcePosition }),
    ...(nodeUpdates.targetPosition && { targetPosition: nodeUpdates.targetPosition }),
    
    // Вложенные объекты
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
    // Используем fetch без await - запрос выполняется в фоне
    fetch(`${platformApiUrl}/widget/${widgetConfig.widgetId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        config: updatedNode,
        board: widgetConfig.board,
        userId: widgetConfig.userId,
        role: widgetConfig.role
      }),
    })
    .then(response => {
      if (!response.ok) {
        // Получаем текст ошибки асинхронно
        return response.text().then(errorText => {
          throw new Error(`Error ${response.status}: ${errorText}`);
        });
      }
      console.log('Config save and send on platform');
      return response.json();
    })
    .then(data => {})
    .catch(error => {
      console.error('Error sending sonfig', error.message);
  });
  } else {
    console.log('Config save in local storage');
  }

  // 5. Отправляем системные сообщения о изменениях
  if (nodeUpdates.position) {
    defaultBroadcastMessage({
      type: 'POSITION_UPDATED',
      widgetId: widgetConfig.widgetId,
      position: nodeUpdates.position,
      timestamp: new Date().toISOString()
    });
  }
  
  if (nodeUpdates.data?.isPinned !== undefined) {
    defaultBroadcastMessage({
      type: 'WIDGET_PINNED',
      widgetId: widgetConfig.widgetId,
      isPinned: nodeUpdates.data.isPinned,
      timestamp: new Date().toISOString()
    });
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
  console.log('[Defaultplatform] size updating:', { width, height });
};

// Дефолтный обработчик изменения состояния закрепления
export const defaultOnPinToggle = (isPinned: boolean) => {
  console.log('[Defaultplatfor] pin updateing:', isPinned);
};

/**
 * Создание полного набора функций платформы для виджета
 * @param widgetConfig - полный конфиг виджета
 */
export const createDefaultPlatformFunctions = (widgetConfig: WidgetConfig) => {
  // Функция сохранения конфига - используем FlowNodeUpdate
  const saveConfig = async (nodeUpdates: FlowNodeUpdate) => {
    try {
      // Сохраняем в дефолтную систему
      await defaultSaveConfig(widgetConfig, nodeUpdates);
      console.log('Config save in localStorage and send on platform');
    } catch (error) {
      console.error('Save config error:', error);
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