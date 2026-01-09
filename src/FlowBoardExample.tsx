// src/FlowBoardExample.tsx
import React, { useCallback, useEffect, useMemo } from 'react';
import { ReactFlow, Background, Controls, MiniMap, Node, Edge } from '@xyflow/react';
import { useNodesState, useEdgesState } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import CalendarNode from './nodes/CalendarNode';
import { WidgetConfig, CalendarNodeData, getInfo } from './integration/integration';
import { defaultBroadcastMessage } from './integration/defaultPlatform';

const API_BASE_URL = 'http://localhost:8080/api';

// Создание конфига виджета
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

const nodeTypes = {
  calendarNode: CalendarNode,
};

// Создание начальной ноды
const getInitialNode = (): Node => {
  const widgetId = 1;
  const widgetConfig = createWidgetConfig(widgetId, 'Календарь задач', 900, 700, false);
  
  // Получаем данные виджета - ВСЁ из getInfo (дефолтные функции)
  const widgetData = getInfo(widgetConfig);
  
  return {
    id: `calendar-${widgetId}`,
    type: 'calendarNode',
    position: { x: 100, y: 100 },
    data: widgetData as Record<string, unknown>,
    style: {
      width: widgetConfig.config.width,
      height: widgetConfig.config.height,
    },
    draggable: !widgetConfig.config.isPinned,
  };
};

const initialNodes: Node[] = [getInitialNode()];
const initialEdges: Edge[] = [];

function FlowBoard() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Обновление закрепления (только для демо интерфейса React Flow)
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

  // Обновление размера (только для демо интерфейса React Flow)
  const updateNodeSize = useCallback((nodeId: string, width: number, height: number) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            style: { ...node.style, width, height },
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
        // Переопределяем onResize и onPinToggle, чтобы обновлять интерфейс
        onResize: (width: number, height: number) => {
          // Вызываем дефолтную функцию (для логирования)
          data.onResize?.(width, height);
          // Обновляем React Flow
          updateNodeSize(node.id, width, height);
        },
        onPinToggle: (isPinned: boolean) => {
          // Вызываем дефолтную функцию (для логирования)
          data.onPinToggle?.(isPinned);
          // Обновляем React Flow
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
    
    // Получаем данные виджета (все дефолтное)
    const widgetData = getInfo(widgetConfig);
    
    const newNode: Node = {
      id: `calendar-${widgetId}`,
      type: 'calendarNode',
      position: { x: Math.random() * 500, y: Math.random() * 500 },
      data: widgetData as Record<string, unknown>,
      style: {
        width: widgetConfig.config.width,
        height: widgetConfig.config.height,
      },
      draggable: true,
    };
    
    setNodes((nds) => nds.concat(newNode));
    console.log(`✅ [FlowBoard] Виджет ${newNode.id} создан`);
  }, [setNodes]);

  // Имитация получения сообщений для демо
  useEffect(() => {
    const timer = setTimeout(() => {
      // Отправляем сообщение ВСЕМ виджетам через дефолтную систему
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
            // Отправить тестовое сообщение всем виджетам
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
          Демо: standalone режим (все функции из defaultPlatform)
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