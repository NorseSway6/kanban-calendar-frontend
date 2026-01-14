// src/FlowBoardExample.tsx
import React, { useCallback, useEffect, useMemo } from 'react';
import { 
  ReactFlow, 
  Background, 
  Controls, 
  MiniMap, 
  Node, 
  Edge,
  Position 
} from '@xyflow/react';
import { useNodesState, useEdgesState } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { 
  CalendarNode, 
  defaultBroadcastMessage,
  type WidgetConfig,
} from 'calendar-module';

// Конфигурация из переменных окружения (.env)
const appConfig = {
  apiBaseUrl: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api',
  telegramBotUrl: process.env.REACT_APP_TELEGRAM_BOT_URL || 'https://web.telegram.org/k/#@my_test_1234567890_bo_bot',
  statsQueueMaxSize: parseInt(process.env.REACT_APP_STATS_QUEUE_MAX_SIZE || '20', 10),
  platformApiUrl: process.env.REACT_APP_PLATFORM_API_URL || 'http://localhost:3000',
};

// Создание демо-конфига виджета
const createDemoWidgetConfig = (
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
    id: `calendar-${widgetId}`,
    type: 'calendarNode',
    dragHandle: 'dragHandle_custom',
    data: {
      label,
      apiBaseUrl: appConfig.apiBaseUrl, // Используем из appConfig (.env)
      platformApiUrl: appConfig.platformApiUrl,
      telegramBotUrl: appConfig.telegramBotUrl,
      statsQueueMaxSize: appConfig.statsQueueMaxSize,
      isPinned,
      events: [],
      currentView: 'month',
      currentDate: new Date().toISOString(),
      widgetType: 'calendar',
      statsModuleToken: `demo_token_${widgetId}`
    },
    position: { x: 100, y: 100 },
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
    style: {
      width,
      height,
      display: 'flex',
      justifyContent: 'center',
      color: 'black',
      fontSize: '16px',
      fontWeight: 'bold',
      background: '#fff',
    }
  },
  board: {
    id: 1,
    name: 'Демо доска',
    parentId: 0
  }
});

const nodeTypes = {
  calendarNode: CalendarNode,
};

// Создание начальной ноды
const getInitialNode = (): Node => {
  const widgetId = 1;
  const widgetConfig = createDemoWidgetConfig(widgetId, 'Календарь задач', 900, 700, false);
  
  return {
    id: `calendar-${widgetId}`,
    type: 'calendarNode',
    position: widgetConfig.config.position,
    data: { 
      widgetConfig,
    } as Record<string, unknown>,
    style: widgetConfig.config.style,
    draggable: !widgetConfig.config.data.isPinned,
    sourcePosition: widgetConfig.config.sourcePosition,
    targetPosition: widgetConfig.config.targetPosition,
  };
};

const initialNodes: Node[] = [getInitialNode()];
const initialEdges: Edge[] = [];

function FlowBoard() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Обновление закрепления (только для демо-интерфейса)
  const updateNodePin = useCallback((nodeId: string, isPinned: boolean) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            draggable: !isPinned,
          };
        }
        return node;
      })
    );
  }, [setNodes]);

  // Добавляем колбэки для демо-интерфейса
  const nodesWithCallbacks = useMemo(() => {
    return nodes.map((node) => {
      const data = node.data as { widgetConfig: WidgetConfig };
      
      const updatedData = {
        ...data,
        onPinToggle: (isPinned: boolean) => {
          updateNodePin(node.id, isPinned);
        }
      };
      
      return {
        ...node,
        data: updatedData as Record<string, unknown>,
      };
    });
  }, [nodes, updateNodePin]);

  // Добавление нового виджета
  const addNewWidget = useCallback(() => {
    const widgetId = Date.now();
    const widgetConfig = createDemoWidgetConfig(widgetId, `Календарь #${widgetId}`);
    
    const newNode: Node = {
      id: `calendar-${widgetId}`,
      type: 'calendarNode',
      position: widgetConfig.config.position,
      data: { 
        widgetConfig,
      } as Record<string, unknown>,
      style: widgetConfig.config.style,
      draggable: !widgetConfig.config.data.isPinned,
      sourcePosition: widgetConfig.config.sourcePosition,
      targetPosition: widgetConfig.config.targetPosition,
    };
    
    setNodes((nds) => nds.concat(newNode));
    console.log(`✅ [FlowBoard] Виджет ${newNode.id} создан`);
  }, [setNodes]);

  // Имитация получения сообщений для демо
  useEffect(() => {
    const timer = setTimeout(() => {
      defaultBroadcastMessage({
        type: 'SYSTEM_MESSAGE',
        message: 'Демо платформа инициализирована',
        timestamp: new Date().toISOString()
      });
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column' }}>
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
            defaultBroadcastMessage({
              type: 'EVENT_CREATED',
              widgetId: 1,
              event: {
                id: Date.now(),
                title: 'Тестовое событие',
                start: new Date(),
                end: new Date(Date.now() + 3600000)
              },
              timestamp: new Date().toISOString()
            });
          }}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          Отправить тестовое событие
        </button>
        <span className="text-sm text-gray-600">
          Демо
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