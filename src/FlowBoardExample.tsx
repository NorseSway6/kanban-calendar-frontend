// src/FlowBoard.tsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ReactFlow, Background, Controls, MiniMap, Node, Edge } from '@xyflow/react';
import { useNodesState, useEdgesState } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import CalendarNode from './nodes/CalendarNode';
import { WidgetConfig } from './integration/integration';

// Типы для данных ноды
interface CalendarNodeFlowData {
  label?: string;
  apiBaseUrl?: string;
  widgetConfig?: WidgetConfig;
  onEventCreate?: (event: any) => Promise<void>;
  onEventDelete?: (eventId: number) => Promise<void>;
  onEventUpdate?: (eventId: number, event: any) => Promise<void>;
  isPinned?: boolean;
  width?: number;
  height?: number;
  [key: string]: any;
}

// Моковые WebSocket функции для тестирования интеграции
const mockWebSocketSend = (message: any) => {
  console.log('📤 [WebSocket Mock] Отправлено:', message);
  setTimeout(() => {
    console.log('📥 [WebSocket Mock] Получено:', { 
      status: 'success',
      message: 'Данные сохранены',
      timestamp: new Date().toISOString()
    });
  }, 100);
};

// Реальные функции для работы с вашим API
const API_BASE_URL = 'http://localhost:8080/api';

const nodeTypes = {
  calendarNode: CalendarNode,
};

// Константа для localStorage
const WIDGET_CONFIGS_KEY = 'widget_configs';

// Функция для создания конфига виджета
const createWidgetConfig = (
  widgetId: number, 
  label: string, 
  width: number = 900, 
  height: number = 700,
  isPinned: boolean = false
): WidgetConfig => ({
  widgetId,
  userId: 1,
  role: 'user',
  config: {
    label,
    apiBaseUrl: API_BASE_URL,
    width,
    height,
    isPinned,
    events: []
  },
  board: {
    id: 1,
    name: 'Демо доска',
    parentId: 0
  }
});

// Функция для сохранения конфигурации
const saveWidgetConfig = async (config: WidgetConfig) => {
  console.log('💾 Сохраняем конфиг виджета:', config);
  
  try {
    // 1. Сохраняем в localStorage для демонстрации
    const configs = JSON.parse(localStorage.getItem(WIDGET_CONFIGS_KEY) || '{}');
    configs[config.widgetId] = config;
    localStorage.setItem(WIDGET_CONFIGS_KEY, JSON.stringify(configs));
    
    // 2. Имитируем отправку на сервер
    console.log(`📤 Отправляем конфиг на сервер: ${API_BASE_URL}/widgets/${config.widgetId}/config`);
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // 3. Отправляем WebSocket сообщение
    mockWebSocketSend({
      type: 'WIDGET_CONFIG_UPDATED',
      widgetId: config.widgetId,
      config: config.config,
      timestamp: new Date().toISOString()
    });
    
    console.log('✅ Конфиг успешно сохранен');
    return config;
  } catch (error) {
    console.error('❌ Ошибка сохранения конфига:', error);
    throw error;
  }
};

// Создаем начальные ноды с правильными типами
const initialNodes: Node[] = [
  {
    id: 'calendar-1',
    type: 'calendarNode',
    position: { x: 100, y: 100 },
    data: {
      label: 'Календарь задач',
      apiBaseUrl: API_BASE_URL,
      widgetConfig: createWidgetConfig(1, 'Календарь задач', 900, 700, false),
      
      // РЕАЛЬНЫЕ функции для работы с вашим API
      onEventCreate: async (taskData: any) => {
        console.log('🎯 [FlowBoard] onEventCreate вызван:', taskData);
        
        try {
          const taskRequest: any = {
            title: taskData.title,
            description: taskData.description,
            status: taskData.status || 'todo',
            start_date: taskData.startDate.toISOString(),
            priority: taskData.priority || 'medium',
            assignee: taskData.assignee || ''
          };

          if (taskData.endDate) {
            taskRequest.end_date = taskData.endDate.toISOString();
            taskRequest.deadline = taskData.endDate.toISOString();
          }

          console.log('📤 [FlowBoard] Отправляем POST запрос на создание задачи:', taskRequest);
          const response = await fetch(`${API_BASE_URL}/tasks`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(taskRequest),
          });

          if (!response.ok) throw new Error('Ошибка создания задачи');
          
          const result = await response.json();
          console.log('✅ [FlowBoard] Задача создана успешно:', result);
          
          // Сохраняем событие в конфиг
          const configs = JSON.parse(localStorage.getItem(WIDGET_CONFIGS_KEY) || '{}');
          if (configs[1]) {
            configs[1].config.events = [...(configs[1].config.events || []), taskData];
            localStorage.setItem(WIDGET_CONFIGS_KEY, JSON.stringify(configs));
            
            mockWebSocketSend({
              type: 'EVENT_CREATE',
              widgetId: 1,
              event: taskData,
              timestamp: new Date().toISOString()
            });
          }
          
          return result;
        } catch (error) {
          console.error('❌ [FlowBoard] Ошибка создания задачи:', error);
          throw error;
        }
      },
      
      onEventDelete: async (taskId: number) => {
        console.log('🗑️ [FlowBoard] onEventDelete вызван:', taskId);
        
        try {
          console.log('📤 [FlowBoard] Отправляем DELETE запрос для задачи:', taskId);
          const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
            method: 'DELETE',
          });

          if (!response.ok) throw new Error('Ошибка удаления задачи');
          
          console.log('✅ [FlowBoard] Задача удалена успешно');
          
          // Удаляем событие из конфига
          const configs = JSON.parse(localStorage.getItem(WIDGET_CONFIGS_KEY) || '{}');
          if (configs[1] && configs[1].config.events) {
            configs[1].config.events = configs[1].config.events.filter((event: any) => event.id !== taskId);
            localStorage.setItem(WIDGET_CONFIGS_KEY, JSON.stringify(configs));
            
            mockWebSocketSend({
              type: 'EVENT_DELETE',
              widgetId: 1,
              eventId: taskId,
              timestamp: new Date().toISOString()
            });
          }
        } catch (error) {
          console.error('❌ [FlowBoard] Ошибка удаления задачи:', error);
          throw error;
        }
      },
      
      onEventUpdate: async (taskId: number, updatedData: any) => {
        console.log('✏️ [FlowBoard] onEventUpdate вызван:', taskId, updatedData);
        
        try {
          const taskRequest: any = {
            title: updatedData.title,
            description: updatedData.description,
            status: updatedData.status || 'todo',
            start_date: updatedData.startDate.toISOString(),
            priority: updatedData.priority || 'medium',
            assignee: updatedData.assignee || ''
          };

          if (updatedData.endDate) {
            taskRequest.end_date = updatedData.endDate.toISOString();
            taskRequest.deadline = updatedData.endDate.toISOString();
          }

          console.log('📤 [FlowBoard] Отправляем PUT запрос на обновление задачи:', taskRequest);
          const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(taskRequest),
          });

          if (!response.ok) throw new Error('Ошибка обновления задачи');
          
          const result = await response.json();
          console.log('✅ [FlowBoard] Задача обновлена успешно:', result);
          
          // Обновляем событие в конфиге
          const configs = JSON.parse(localStorage.getItem(WIDGET_CONFIGS_KEY) || '{}');
          if (configs[1] && configs[1].config.events) {
            const events = configs[1].config.events.map((event: any) => 
              event.id === taskId ? { ...event, ...updatedData } : event
            );
            configs[1].config.events = events;
            localStorage.setItem(WIDGET_CONFIGS_KEY, JSON.stringify(configs));
            
            mockWebSocketSend({
              type: 'EVENT_UPDATE',
              widgetId: 1,
              eventId: taskId,
              event: updatedData,
              timestamp: new Date().toISOString()
            });
          }
          
          return result;
        } catch (error) {
          console.error('❌ [FlowBoard] Ошибка обновления задачи:', error);
          throw error;
        }
      }
    } as CalendarNodeFlowData,
    style: {
      width: 900,
      height: 700,
    },
    draggable: true,
  },
];

const initialEdges: Edge[] = [];

function FlowBoard() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const messageSubscribersRef = useRef<Set<(msg: any) => void>>(new Set());

  // Мемоизированные функции подписки и отправки сообщений
  const subscribe = useCallback((callback: (msg: any) => void) => {
    console.log('✅ Подписчик добавлен');
    messageSubscribersRef.current.add(callback);
    
    return () => {
      console.log('✅ Подписчик удален');
      messageSubscribersRef.current.delete(callback);
    };
  }, []);

  const broadcastMessage = useCallback((message: any) => {
    console.log('📢 [Platform] Broadcast:', message);
    messageSubscribersRef.current.forEach(callback => callback(message));
  }, []);

  // Загрузка сохраненных конфигов при монтировании
  useEffect(() => {
    try {
      const savedConfigs = localStorage.getItem(WIDGET_CONFIGS_KEY);
      if (savedConfigs) {
        console.log('📂 Загружены сохраненные конфиги:', JSON.parse(savedConfigs));
      }
    } catch (error) {
      console.error('Ошибка загрузки конфигов:', error);
    }
  }, []);

  // Имитация получения сообщений
  useEffect(() => {
    const timer = setTimeout(() => {
      broadcastMessage({
        type: 'SYSTEM_MESSAGE',
        message: 'Система инициализирована',
        timestamp: new Date().toISOString()
      });
    }, 1000);
    
    const interval = setInterval(() => {
      broadcastMessage({
        type: 'EVENT_CREATED',
        widgetId: 1,
        event: {
          id: Date.now(),
          title: 'Авто-событие',
          start: new Date(),
          end: new Date(Date.now() + 3600000)
        },
        timestamp: new Date().toISOString()
      });
    }, 30000);
    
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [broadcastMessage]);

  // Функция для обновления закрепления с сохранением конфига
  const updateNodePin = useCallback((nodeId: string, isPinned: boolean) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          const data = node.data as CalendarNodeFlowData;
          const widgetConfig = data.widgetConfig;
          if (widgetConfig) {
            const updatedWidgetConfig: WidgetConfig = {
              ...widgetConfig,
              config: {
                ...widgetConfig.config,
                isPinned
              }
            };
            
            // Сохраняем конфиг
            saveWidgetConfig(updatedWidgetConfig).catch(console.error);
            
            return {
              ...node,
              draggable: !isPinned,
              data: {
                ...data,
                isPinned,
                widgetConfig: updatedWidgetConfig
              } as CalendarNodeFlowData,
            };
          }
        }
        return node;
      })
    );
    
    setTimeout(() => {
      mockWebSocketSend({
        type: 'WIDGET_PINNED',
        widgetId: parseInt(nodeId.split('-')[1]) || 1,
        isPinned,
        timestamp: new Date().toISOString()
      });
    }, 100);
  }, [setNodes]);

  // Функция для обновления размера с сохранением конфига
  const updateNodeSize = useCallback((nodeId: string, width: number, height: number) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          const data = node.data as CalendarNodeFlowData;
          const widgetConfig = data.widgetConfig;
          if (widgetConfig) {
            const updatedWidgetConfig: WidgetConfig = {
              ...widgetConfig,
              config: {
                ...widgetConfig.config,
                width,
                height
              }
            };
            
            // Сохраняем конфиг
            saveWidgetConfig(updatedWidgetConfig).catch(console.error);
            
            return {
              ...node,
              style: { ...node.style, width, height },
              data: {
                ...data,
                width,
                height,
                widgetConfig: updatedWidgetConfig
              } as CalendarNodeFlowData,
            };
          }
        }
        return node;
      })
    );
    
    setTimeout(() => {
      mockWebSocketSend({
        type: 'WIDGET_RESIZED',
        widgetId: parseInt(nodeId.split('-')[1]) || 1,
        width,
        height,
        timestamp: new Date().toISOString()
      });
    }, 100);
  }, [setNodes]);

  // Создание обработчиков событий для виджета
  const createEventCallbacks = (widgetId: number, nodeId: string, widgetConfig: WidgetConfig) => {
    return {
      onEventCreate: async (taskData: any) => {
        console.log(`🎯 [FlowBoard] onEventCreate для ${nodeId}:`, taskData);
        
        try {
          const taskRequest: any = {
            title: taskData.title,
            description: taskData.description,
            status: taskData.status || 'todo',
            start_date: taskData.startDate.toISOString(),
            priority: taskData.priority || 'medium',
            assignee: taskData.assignee || ''
          };

          if (taskData.endDate) {
            taskRequest.end_date = taskData.endDate.toISOString();
            taskRequest.deadline = taskData.endDate.toISOString();
          }

          console.log(`📤 [FlowBoard] Отправляем POST запрос для ${nodeId}:`, taskRequest);
          const response = await fetch(`${API_BASE_URL}/tasks`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(taskRequest),
          });

          if (!response.ok) throw new Error('Ошибка создания задачи');
          
          const result = await response.json();
          console.log(`✅ [FlowBoard] Задача создана для ${nodeId}:`, result);
          
          // Сохраняем событие в конфиг
          const updatedConfig: WidgetConfig = {
            ...widgetConfig,
            config: {
              ...widgetConfig.config,
              events: [...(widgetConfig.config.events || []), taskData]
            }
          };
          await saveWidgetConfig(updatedConfig);
          
          mockWebSocketSend({
            type: 'EVENT_CREATE',
            widgetId,
            event: taskData,
            timestamp: new Date().toISOString()
          });
          
          return result;
        } catch (error) {
          console.error(`❌ [FlowBoard] Ошибка создания задачи для ${nodeId}:`, error);
          throw error;
        }
      },
      
      onEventDelete: async (taskId: number) => {
        console.log(`🗑️ [FlowBoard] onEventDelete для ${nodeId}:`, taskId);
        
        try {
          console.log(`📤 [FlowBoard] Отправляем DELETE запрос для ${nodeId}:`, taskId);
          const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
            method: 'DELETE',
          });

          if (!response.ok) throw new Error('Ошибка удаления задачи');
          
          console.log(`✅ [FlowBoard] Задача удалена для ${nodeId}`);
          
          // Удаляем событие из конфига
          const updatedConfig: WidgetConfig = {
            ...widgetConfig,
            config: {
              ...widgetConfig.config,
              events: (widgetConfig.config.events || []).filter((event: any) => event.id !== taskId)
            }
          };
          await saveWidgetConfig(updatedConfig);
          
          mockWebSocketSend({
            type: 'EVENT_DELETE',
            widgetId,
            eventId: taskId,
            timestamp: new Date().toISOString()
          });
        } catch (error) {
          console.error(`❌ [FlowBoard] Ошибка удаления задачи для ${nodeId}:`, error);
          throw error;
        }
      },
      
      onEventUpdate: async (taskId: number, updatedData: any) => {
        console.log(`✏️ [FlowBoard] onEventUpdate для ${nodeId}:`, taskId, updatedData);
        
        try {
          const taskRequest: any = {
            title: updatedData.title,
            description: updatedData.description,
            status: updatedData.status || 'todo',
            start_date: updatedData.startDate.toISOString(),
            priority: updatedData.priority || 'medium',
            assignee: updatedData.assignee || ''
          };

          if (updatedData.endDate) {
            taskRequest.end_date = updatedData.endDate.toISOString();
            taskRequest.deadline = updatedData.endDate.toISOString();
          }

          console.log(`📤 [FlowBoard] Отправляем PUT запрос для ${nodeId}:`, taskRequest);
          const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(taskRequest),
          });

          if (!response.ok) throw new Error('Ошибка обновления задачи');
          
          const result = await response.json();
          console.log(`✅ [FlowBoard] Задача обновлена для ${nodeId}:`, result);
          
          // Обновляем событие в конфиге
          const events = widgetConfig.config.events || [];
          const updatedEvents = events.map((event: any) => 
            event.id === taskId ? { ...event, ...updatedData } : event
          );
          const updatedConfig: WidgetConfig = {
            ...widgetConfig,
            config: {
              ...widgetConfig.config,
              events: updatedEvents
            }
          };
          await saveWidgetConfig(updatedConfig);
          
          mockWebSocketSend({
            type: 'EVENT_UPDATE',
            widgetId,
            eventId: taskId,
            event: updatedData,
            timestamp: new Date().toISOString()
          });
          
          return result;
        } catch (error) {
          console.error(`❌ [FlowBoard] Ошибка обновления задачи для ${nodeId}:`, error);
          throw error;
        }
      }
    };
  };

  // Функция для добавления нового виджета
  const addNewWidget = useCallback(() => {
    const widgetId = Date.now();
    const nodeId = `calendar-${widgetId}`;
    const label = `Календарь #${widgetId}`;
    const widgetConfig = createWidgetConfig(widgetId, label);
    
    const newNode: Node = {
      id: nodeId,
      type: 'calendarNode',
      position: { 
        x: Math.random() * 500, 
        y: Math.random() * 500 
      },
      data: {
        label,
        apiBaseUrl: API_BASE_URL,
        widgetConfig,
        ...createEventCallbacks(widgetId, nodeId, widgetConfig)
      } as CalendarNodeFlowData,
      style: {
        width: widgetConfig.config.width,
        height: widgetConfig.config.height,
      },
      draggable: true,
    };
    
    // Сохраняем конфиг при создании
    saveWidgetConfig(widgetConfig).catch(console.error);
    
    setNodes((nds) => nds.concat(newNode));
    console.log(`✅ [FlowBoard] Виджет ${nodeId} создан`);
  }, [setNodes]);

  // Ноды с колбэками
  const nodesWithCallbacks = useMemo(() => {
    return nodes.map((node) => {
      const data = node.data as CalendarNodeFlowData;
      const widgetId = parseInt(node.id.split('-')[1]) || 1;
      
      // Функция для безопасного преобразования ширины/высоты в number
      const parseDimension = (dim: string | number | undefined, defaultValue: number): number => {
        if (dim === undefined) return defaultValue;
        if (typeof dim === 'number') return dim;
        if (typeof dim === 'string') {
          // Убираем "px" и другие единицы измерения
          const num = parseFloat(dim);
          return isNaN(num) ? defaultValue : num;
        }
        return defaultValue;
      };
      
      const width = parseDimension(node.style?.width, 900);
      const height = parseDimension(node.style?.height, 700);
      
      const widgetConfig = data.widgetConfig || createWidgetConfig(
        widgetId, 
        data.label || `Календарь #${widgetId}`, 
        width,  // ✅ Теперь гарантированно number
        height  // ✅ Теперь гарантированно number
      );
      
      return {
        ...node,
        data: {
          ...data,
          embedded: true,
          widgetConfig,
          onPinToggle: (isPinned: boolean, nodeId: string = node.id) => {
            updateNodePin(nodeId, isPinned);
          },
          onResize: (width: number, height: number, nodeId: string = node.id) => {
            updateNodeSize(nodeId, width, height);
          },
          // Функция сохранения конфига
          saveConfig: async (configUpdates: any) => {
            const currentConfig = data.widgetConfig || widgetConfig;
            const updatedConfig = {
              ...currentConfig,
              config: { ...currentConfig.config, ...configUpdates }
            };
            return saveWidgetConfig(updatedConfig);
          },
          subscribe,
          sendMessage: mockWebSocketSend,
          ...createEventCallbacks(widgetId, node.id, widgetConfig)
        } as CalendarNodeFlowData,
      };
    });
  }, [nodes, subscribe, updateNodePin, updateNodeSize]);

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Панель управления для демо */}
      <div style={{ 
        padding: '10px', 
        backgroundColor: '#f3f4f6', 
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        gap: '10px',
        alignItems: 'center'
      }}>
        <button
          onClick={addNewWidget}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          + Добавить виджет календаря
        </button>
        <button
          onClick={() => {
            const configs = localStorage.getItem(WIDGET_CONFIGS_KEY);
            console.log('📊 Текущие конфиги:', configs ? JSON.parse(configs) : {});
            alert('Конфиги сохранены в localStorage. Откройте DevTools -> Application -> LocalStorage чтобы посмотреть.');
          }}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Показать конфиги
        </button>
        <span className="text-sm text-gray-600">
          Демо интеграции: реальные запросы к API + сохранение конфигов
        </span>
      </div>
      
      <div style={{ flex: 1 }}>
        <ReactFlow
          nodes={nodesWithCallbacks}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          fitView
        >
          <Background />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </div>
    </div>
  );
}

export default FlowBoard;