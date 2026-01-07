// src/FlowBoard.tsx
import React, { useCallback } from 'react';
import { ReactFlow, Background, Controls, MiniMap, Node, Edge } from '@xyflow/react';
import { useNodesState, useEdgesState } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import CalendarNode from './nodes/CalendarNode';

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

const initialNodes: Node[] = [
  {
    id: 'calendar-1',
    type: 'calendarNode',
    position: { x: 100, y: 100 },
    data: {
      label: 'Календарь задач',
      apiBaseUrl: API_BASE_URL,
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
          
          // Также отправляем моковый WebSocket для тестирования интеграции
          mockWebSocketSend({
            type: 'EVENT_CREATE',
            widgetId: 1,
            event: taskData,
            timestamp: new Date().toISOString()
          });
          
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
          
          // Также отправляем моковый WebSocket для тестирования интеграции
          mockWebSocketSend({
            type: 'EVENT_DELETE',
            widgetId: 1,
            eventId: taskId,
            timestamp: new Date().toISOString()
          });
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
          
          // Также отправляем моковый WebSocket для тестирования интеграции
          mockWebSocketSend({
            type: 'EVENT_UPDATE',
            widgetId: 1,
            eventId: taskId,
            event: updatedData,
            timestamp: new Date().toISOString()
          });
          
          return result;
        } catch (error) {
          console.error('❌ [FlowBoard] Ошибка обновления задачи:', error);
          throw error;
        }
      }
    },
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

  // Функция для обновления закрепления
  const updateNodePin = useCallback((nodeId: string, isPinned: boolean) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            draggable: !isPinned,
            data: {
              ...node.data,
              isPinned,
            },
          };
        }
        return node;
      })
    );
    console.log(`📌 [FlowBoard] Нода ${nodeId} закреплена: ${isPinned}`);
    
    // Также отправляем моковый WebSocket для тестирования интеграции
    mockWebSocketSend({
      type: 'WIDGET_PIN',
      widgetId: parseInt(nodeId.split('-')[1]) || 1,
      isPinned,
      timestamp: new Date().toISOString()
    });
  }, [setNodes]);

  // Функция для обновления размера
  const updateNodeSize = useCallback((nodeId: string, width: number, height: number) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            style: {
              ...node.style,
              width,
              height,
            },
            data: {
              ...node.data,
              width,
              height,
            },
          };
        }
        return node;
      })
    );
    console.log(`📏 [FlowBoard] Нода ${nodeId} изменена: ${width}x${height}`);
    
    // Также отправляем моковый WebSocket для тестирования интеграции
    mockWebSocketSend({
      type: 'WIDGET_RESIZE',
      widgetId: parseInt(nodeId.split('-')[1]) || 1,
      width,
      height,
      timestamp: new Date().toISOString()
    });
  }, [setNodes]);

  // Функция для добавления нового виджета
  const addNewWidget = useCallback(() => {
    const widgetId = Date.now();
    const nodeId = `calendar-${widgetId}`;
    
    const newNode: Node = {
      id: nodeId,
      type: 'calendarNode',
      position: { 
        x: Math.random() * 500, 
        y: Math.random() * 500 
      },
      data: {
        label: `Календарь #${widgetId}`,
        apiBaseUrl: API_BASE_URL,
        // РЕАЛЬНЫЕ функции для работы с вашим API
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
            
            // Также отправляем моковый WebSocket для тестирования интеграции
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
            
            // Также отправляем моковый WebSocket для тестирования интеграции
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
            
            // Также отправляем моковый WebSocket для тестирования интеграции
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
      },
      style: {
        width: 900,
        height: 700,
      },
      draggable: true,
    };
    
    setNodes((nds) => nds.concat(newNode));
    console.log(`✅ [FlowBoard] Виджет ${nodeId} создан`);
  }, [setNodes]);

  // Обновляем ноды с callback функциями
  const nodesWithCallbacks = nodes.map((node) => ({
    ...node,
    data: {
      ...node.data,
      embedded: true,
      onPinToggle: (isPinned: boolean, nodeId: string = node.id) => {
        updateNodePin(nodeId, isPinned);
      },
      onResize: (width: number, height: number, nodeId: string = node.id) => {
        updateNodeSize(nodeId, width, height);
      },
    },
  }));

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
        <span className="text-sm text-gray-600">
          Демо интеграции: реальные запросы к API + моковые WebSocket
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