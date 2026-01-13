// src/nodes/CalendarNode.tsx
import { Handle, Position, NodeResizer, useUpdateNodeInternals, NodeProps } from '@xyflow/react';
import { useState, useCallback, useEffect, useRef } from 'react';
import App from '../App';
import { CalendarNodeData, getInfo, FlowNodeUpdate } from '../integration/integration';

interface CalendarNodeProps {
  id: string;
  data: CalendarNodeData; 
  selected?: boolean;
  isConnectable?: boolean;
  // Эти пропсы автоматически передаются React Flow при перетаскивании
  xPos?: number;
  yPos?: number;
  dragging?: boolean;
}

const CalendarNode: React.FC<CalendarNodeProps> = ({ 
  id, 
  data, 
  selected = false, 
  isConnectable = true,
  xPos,
  yPos,
  dragging
}) => {
  const [isPinned, setIsPinned] = useState(data.isPinned || false);
  const [isSaving, setIsSaving] = useState(false);
  const [position, setPosition] = useState({ x: xPos || 0, y: yPos || 0 });
  const [wasDragging, setWasDragging] = useState(false);
  const updateNodeInternals = useUpdateNodeInternals();
  
  // Используем useRef для хранения appData
  const appDataRef = useRef<CalendarNodeData | null>(null);
  
  if (!appDataRef.current) {
    console.log('🔧 [CalendarNode] getInfo вызывается при создании виджета:', data.widgetConfig?.widgetId);
    
    if (data.widgetConfig) {
      appDataRef.current = getInfo(data.widgetConfig);
    } else {
      appDataRef.current = data;
    }
  }
  
  const appData = appDataRef.current;

  // Отслеживаем изменение позиции
  useEffect(() => {
    if (xPos !== undefined && yPos !== undefined) {
      setPosition({ x: xPos, y: yPos });
    }
  }, [xPos, yPos]);

  // Отслеживаем окончание перетаскивания и сохраняем позицию
  useEffect(() => {
    // Если было перетаскивание и сейчас оно закончилось
    if (wasDragging && !dragging) {
      savePosition(position);
    }
    
    // Обновляем состояние перетаскивания
    if (dragging !== undefined) {
      setWasDragging(dragging);
    }
  }, [dragging, wasDragging, position]);

  // Эффект для синхронизации isPinned
  useEffect(() => {
    if (appData.isPinned !== undefined && appData.isPinned !== isPinned) {
      setIsPinned(appData.isPinned);
    }
  }, [appData.isPinned]);

  // Функция сохранения позиции
  const savePosition = useCallback(async (newPosition: { x: number; y: number }) => {
    if (isPinned) {
      console.log('⚠️ Виджет закреплен, позиция не сохраняется');
      return;
    }

    console.log('📍 CalendarNode сохраняет позицию:', id, newPosition);
    
    if (!appData.saveConfig) {
      console.error('❌ saveConfig не доступен в appData');
      return;
    }

    setIsSaving(true);
    try {
      const nodeUpdates: FlowNodeUpdate = {
        position: newPosition
      };

      await appData.saveConfig({nodeUpdates});
      console.log('✅ Позиция сохранена');
    } catch (error) {
      console.error('❌ Ошибка сохранения позиции:', error);
    } finally {
      setIsSaving(false);
    }
  }, [id, isPinned, appData]);

  // Подписка на сообщения
  useEffect(() => {
    if (!appData.subscribe) return;

    const unsubscribe = appData.subscribe((message) => {
      switch (message.type) {
        case 'WIDGET_PINNED':
          if (message.widgetId === appData.widgetConfig?.widgetId) {
            setIsPinned(message.isPinned);
          }
          break;
      }
    });

    return () => unsubscribe();
  }, [appData.subscribe, appData.widgetConfig?.widgetId]);

  const togglePin = useCallback(async () => {
    const newPinnedState = !isPinned;
    console.log('📌 Изменение закрепления:', newPinnedState);
    
    if (!appData.saveConfig) {
      console.error('❌ saveConfig не доступен');
      return;
    }

    setIsSaving(true);
    try {
      const nodeUpdates: FlowNodeUpdate = {
        data: { isPinned: newPinnedState }
      };

      await appData.saveConfig({nodeUpdates});
      console.log('✅ Состояние закрепления сохранено');
      setIsPinned(newPinnedState);
      
      if (data.onPinToggle) {
        data.onPinToggle(newPinnedState);
      }
    } catch (error) {
      console.error('❌ Ошибка сохранения закрепления:', error);
    } finally {
      setIsSaving(false);
    }
  }, [isPinned, appData, data]);

  const handleResize = useCallback(async (event: any, params: any) => {
    if (!appData.saveConfig) {
      console.error('❌ saveConfig не доступен');
      return;
    }

    setIsSaving(true);
    try {
      const nodeUpdates: FlowNodeUpdate = {
        style: { width: params.width, height: params.height },
        data: { width: params.width, height: params.height }
      };

      await appData.saveConfig({nodeUpdates});
      console.log('✅ Размер сохранен');
      
      if (data.onResize) {
        data.onResize(params.width, params.height);
      }
    } catch (error) {
      console.error('❌ Ошибка сохранения размера:', error);
    } finally {
      setIsSaving(false);
      updateNodeInternals(id);
    }
  }, [appData, data, id, updateNodeInternals]);

  return (
    <div 
      className={`relative bg-white border-2 rounded-lg shadow-lg ${
        selected ? 'border-blue-500' : 'border-gray-200'
      } ${dragging ? 'opacity-80' : ''}`}
      style={{
        width: '100%',
        height: '100%',
        overflow: 'hidden'
      }}
    >
      
      {selected && (
        <NodeResizer
          minWidth={720}
          minHeight={590}
          maxWidth={1400}
          maxHeight={1000}
          lineClassName="border-blue-400"
          handleClassName="h-3 w-3 bg-white border-2 border-blue-400 rounded-full"
          onResize={handleResize}
        />
      )}
      
      <div className={`p-3 border-b border-gray-200 bg-gray-50 rounded-t-lg flex items-center justify-between ${
        !isPinned ? 'cursor-move' : ''
      }`}>
        <Handle
          type="target"
          position={Position.Left}
          isConnectable={isConnectable}
          className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white !rounded-full"
          id="target"
        />
        
        <div className="flex items-center gap-4">
          <span className="text-sm font-bold text-gray-800">
            📅 {appData.label || 'Календарь'}
          </span>
          <button
            onClick={togglePin}
            className={`p-1.5 rounded-full transition-colors ${
              isPinned 
                ? 'bg-blue-100 text-blue-600 hover:bg-blue-200' 
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
            title={isPinned ? "Открепить" : "Закрепить"}
            disabled={isSaving}
          >
            {isPinned ? '📌' : '📍'}
          </button>
          {isSaving && (
            <span className="text-xs text-gray-500 animate-pulse">Сохранение...</span>
          )}
        </div>
        
        <Handle
          type="source"
          position={Position.Right}
          isConnectable={isConnectable}
          className="!w-3 !h-3 !bg-green-500 !border-2 !border-white !rounded-full"
          id="source"
        />
      </div>

      <div className="overflow-auto" style={{ 
        width: '100%', 
        height: 'calc(100% - 30px)',
        padding: '4px'
      }}>
        <App 
          apiBaseUrl={appData.apiBaseUrl}
          initialEvents={appData.events}
          onEventCreate={appData.onEventCreate}
          onEventDelete={appData.onEventDelete}
          onEventUpdate={appData.onEventUpdate}
          subscribe={appData.subscribe}
          sendMessage={appData.sendMessage}
          widgetConfig={appData.widgetConfig}
        />
      </div>
    </div>
  );
};

export default CalendarNode;