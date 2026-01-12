// src/services/StatService.ts
interface StatEvent {
  type: string;
  widgetId: number;
  userId: number;
  timestamp: string;
  metadata?: Record<string, any>;
}

class StatService {
  private moduleToken: string;
  private widgetId: number;
  private userId: number;
  
  // Храним счетчики событий
  private counters: Map<string, number> = new Map();
  
  // Храним последние события для отправки порциями
  private eventsQueue: StatEvent[] = [];
  private readonly MAX_QUEUE_SIZE = 2; // Уменьшим для демонстрации (можно поставить 50)
  
  // Флаг, чтобы избежать множественной отправки
  private isSending: boolean = false;

  constructor(
    moduleToken: string = '',
    widgetId: number = 0,
    userId: number = 0
  ) {
    this.moduleToken = moduleToken;
    this.widgetId = widgetId;
    this.userId = userId;
    
    // Восстанавливаем счетчики из localStorage
    this.loadCountersFromStorage();
    
    // Проверяем, не накопилось ли достаточно событий при загрузке
    if (this.eventsQueue.length >= this.MAX_QUEUE_SIZE) {
      setTimeout(() => this.flushQueue(), 1000);
    }
  }

  // Регистрация события
  trackEvent(eventType: string, metadata?: Record<string, any>): void {
    const event: StatEvent = {
      type: eventType,
      widgetId: this.widgetId,
      userId: this.userId,
      timestamp: new Date().toISOString(),
      metadata
    };

    // Добавляем в очередь
    this.eventsQueue.push(event);
    
    // Обновляем счетчик
    const currentCount = this.counters.get(eventType) || 0;
    this.counters.set(eventType, currentCount + 1);
    
    // Сохраняем в localStorage
    this.saveCountersToStorage();
    
    console.log('📊 Событие зарегистрировано. Очередь:', this.eventsQueue.length);
    
    // Проверяем, достигли ли лимита
    if (this.eventsQueue.length >= this.MAX_QUEUE_SIZE) {
      console.log(`✅ Достигнут лимит очереди (${this.MAX_QUEUE_SIZE}), отправляю...`);
      this.flushQueue();
    }
  }

  // Основная отправка (при достижении лимита)
  async flushQueue(): Promise<void> {
    if (this.isSending || this.eventsQueue.length === 0) {
      return;
    }

    this.isSending = true;
    
    try {
      const statsData = {
        widgetId: this.widgetId,
        userId: this.userId,
        events: [...this.eventsQueue], // Копируем массив
        counters: Object.fromEntries(this.counters),
        totalEvents: this.eventsQueue.length,
        lastUpdated: new Date().toISOString(),
        batchType: 'queue_limit_reached'
      };

      console.log(`📤 Отправляю порцию из ${this.eventsQueue.length} событий:`, statsData);
      console.log('✅ Отправлено на сервер статистики');
      
      // ЗАКОММЕНТИРОВАНО: реальная отправка
      /*
      if (this.moduleToken) {
        const response = await fetch('https://statservice.example.com/api/stats/module/metrics', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'X-Module-Token': this.moduleToken
          },
          body: JSON.stringify(statsData)
        });
        
        if (response.ok) {
          console.log(`✅ Статистика отправлена (${this.eventsQueue.length} событий)`);
          this.eventsQueue = []; // Очищаем очередь после успешной отправки
          this.saveCountersToStorage(); // Сохраняем изменения
        }
      }
      */
      
      // В демо-режиме просто очищаем очередь
      this.eventsQueue = [];
      this.saveCountersToStorage();
      
    } catch (error) {
      console.error('❌ Ошибка отправки статистики:', error);
    } finally {
      this.isSending = false;
    }
  }

  // Принудительная отправка (при закрытии страницы)
  forceFlush(): void {
    if (this.eventsQueue.length > 0) {
      console.log(`🔄 Принудительная отправка ${this.eventsQueue.length} событий`);
      this.flushQueue();
    }
  }

  // Сохранение в localStorage
  private saveCountersToStorage(): void {
    try {
      const storageKey = `stats_${this.widgetId}`;
      const data = {
        counters: Object.fromEntries(this.counters),
        eventsQueue: this.eventsQueue,
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem(storageKey, JSON.stringify(data));
    } catch (error) {
      console.warn('⚠️ Не удалось сохранить статистику:', error);
    }
  }

  // Загрузка из localStorage
  private loadCountersFromStorage(): void {
    try {
      const storageKey = `stats_${this.widgetId}`;
      const data = localStorage.getItem(storageKey);
      if (data) {
        const parsed = JSON.parse(data);
        this.counters = new Map(Object.entries(parsed.counters || {}));
        this.eventsQueue = parsed.eventsQueue || [];
        
        if (this.eventsQueue.length > 0) {
          console.log(`📂 Загружено ${this.eventsQueue.length} событий из localStorage`);
        }
      }
    } catch (error) {
      console.warn('⚠️ Не удалось загрузить статистику:', error);
    }
  }

  // Для отладки
  getStats() {
    return {
      widgetId: this.widgetId,
      totalEvents: this.eventsQueue.length,
      maxQueueSize: this.MAX_QUEUE_SIZE,
      counters: Object.fromEntries(this.counters),
      lastEvent: this.eventsQueue[this.eventsQueue.length - 1]
    };
  }
}

export default StatService;