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
import CalendarNode from './nodes/CalendarNode';
import { WidgetConfig, CalendarNodeData, getInfo } from './integration/integration';
import { defaultBroadcastMessage } from './integration/defaultPlatform';

const API_BASE_URL = 'http://localhost:8080/api';

// Создание конфига виджета с полной нодой
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
    id: `calendar-${widgetId}`,
    type: 'calendarNode',
    dragHandle: 'dragHandle_custom',
    data: {
      label,
      apiBaseUrl: API_BASE_URL,
      platformApiUrl: API_BASE_URL,
      isPinned,
      events: [],
      currentView: 'month',
      currentDate: new Date().toISOString(),
      widgetType: 'calendar'
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
  const widgetConfig = createWidgetConfig(widgetId, 'Календарь задач', 900, 700, false);
  
  // Получаем данные виджета
  const widgetData = getInfo(widgetConfig);
  
  return {
    id: `calendar-${widgetId}`,
    type: 'calendarNode',
    position: widgetConfig.config.position,  // ВАЖНО: widgetConfig.config
    data: widgetData as Record<string, unknown>,
    style: widgetConfig.config.style,  // ВАЖНО: widgetConfig.config
    draggable: !widgetConfig.config.data.isPinned,  // ВАЖНО: widgetConfig.config
    sourcePosition: widgetConfig.config.sourcePosition,  // ВАЖНО: widgetConfig.config
    targetPosition: widgetConfig.config.targetPosition,  // ВАЖНО: widgetConfig.config
  };
};

const initialNodes: Node[] = [getInitialNode()];
const initialEdges: Edge[] = [];

function FlowBoard() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Обработчик остановки перетаскивания (сохраняем позицию)
  const onNodeDragStop = useCallback((event: React.MouseEvent, node: Node) => {
    const nodeData = node.data as CalendarNodeData;
    
    if (nodeData.saveConfig) {
      console.log('📍 Сохраняем позицию виджета:', node.id, node.position);
      
      nodeData.saveConfig({
        position: node.position
      });
    }
  }, []);

  // Обновление закрепления (с исправлением)
  const updateNodePin = useCallback((nodeId: string, isPinned: boolean) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          const data = node.data as CalendarNodeData;
          
          // Обновляем React Flow ноду
          return {
            ...node,
            draggable: !isPinned, // Закрепленный виджет нельзя двигать
            data: {
              ...data,
              isPinned, // Обновляем в data виджета
              widgetConfig: data.widgetConfig ? {
                ...data.widgetConfig,
                config: {
                  ...data.widgetConfig.config,
                  data: {
                    ...data.widgetConfig.config.data,
                    isPinned // Обновляем в конфиге
                  }
                }
              } : undefined
            }
          };
        }
        return node;
      })
    );
  }, [setNodes]);

  // Обновление размера (с исправлением)
  const updateNodeSize = useCallback((nodeId: string, width: number, height: number) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          const data = node.data as CalendarNodeData;
          
          return {
            ...node,
            style: { 
              ...node.style, 
              width, 
              height 
            },
            data: {
              ...data,
              widgetConfig: data.widgetConfig ? {
                ...data.widgetConfig,
                config: {
                  ...data.widgetConfig.config,
                  style: {
                    ...data.widgetConfig.config.style,
                    width,
                    height
                  },
                  data: {
                    ...data.widgetConfig.config.data,
                    width,
                    height
                  }
                }
              } : undefined
            }
          };
        }
        return node;
      })
    );
  }, [setNodes]);

  // Добавляем функции для обновления интерфейса React Flow
  const nodesWithCallbacks = useMemo(() => {
    return nodes.map((node) => {
      const data = node.data as CalendarNodeData;
      
      const updatedData: CalendarNodeData = {
        ...data,
        // Переопределяем onResize и onPinToggle
        onResize: (width: number, height: number) => {
          data.onResize?.(width, height);
          updateNodeSize(node.id, width, height);
        },
        onPinToggle: (isPinned: boolean) => {
          data.onPinToggle?.(isPinned);
          updateNodePin(node.id, isPinned);
        }
      };
      
      return {
        ...node,
        data: updatedData as Record<string, unknown>,
      };
    });
  }, [nodes, updateNodePin, updateNodeSize]);

  // Добавление нового виджета
  const addNewWidget = useCallback(() => {
    const widgetId = Date.now();
    const widgetConfig = createWidgetConfig(widgetId, `Календарь #${widgetId}`);
    
    // Получаем данные виджета
    const widgetData = getInfo(widgetConfig);
    
    const newNode: Node = {
      id: `calendar-${widgetId}`,
      type: 'calendarNode',
      position: widgetConfig.config.position,
      data: widgetData as Record<string, unknown>,
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
          onNodeDragStop={onNodeDragStop}
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