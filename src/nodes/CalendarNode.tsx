// src/nodes/CalendarNode.tsx
import { Handle, Position, NodeResizer, useUpdateNodeInternals } from '@xyflow/react';
import { useState, useCallback, useEffect } from 'react';
import App from '../App';
import { CalendarNodeData } from '../integration/integration';

interface CalendarNodeProps {
  id: string;
  data: CalendarNodeData; 
  selected?: boolean;
  isConnectable?: boolean;
}

const CalendarNode: React.FC<CalendarNodeProps> = ({ 
  id, 
  data, 
  selected = false, 
  isConnectable = true 
}) => {
  const [isPinned, setIsPinned] = useState(data.isPinned || false);
  const updateNodeInternals = useUpdateNodeInternals();
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);

  // src/nodes/CalendarNode.tsx
// Обновляем useEffect:

  useEffect(() => {
    // Проверяем, есть ли функция подписки
    if (!data.subscribe) {
      console.log('⚠️ subscribe не доступен');
      return;
    }

    // Если уже подписаны - выходим
    if (subscriptionId) {
      console.log('⚠️ Уже подписаны');
      return;
    }

    console.log('📡 Начинаем подписку...');
    
    const messageHandler = (message: any) => {
      // Фильтруем сообщения по widgetId если он есть
      if (message.widgetId && data.widgetConfig?.widgetId) {
        if (message.widgetId !== data.widgetConfig.widgetId) {
          return; // Пропускаем сообщения для других виджетов
        }
      }
      
      console.log('📨 Получено сообщение для виджета:', data.widgetConfig?.widgetId, message);
      
      switch (message.type) {
        case 'WIDGET_PINNED':
          if (message.isPinned !== isPinned) {
            console.log('Обновление состояния закрепления:', message.isPinned);
            setIsPinned(message.isPinned);
          }
          break;
        case 'SYSTEM_MESSAGE':
          console.log('Системное сообщение:', message.message);
          break;
        case 'EVENT_CREATED':
          console.log('Событие создано другим пользователем');
          // Можно добавить обновление календаря
          break;
      }
    };

    // Подписываемся
    const unsubscribe = data.subscribe(messageHandler);
    
    // Генерируем ID подписки для отслеживания
    const subId = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setSubscriptionId(subId);
    console.log('✅ Подписка создана:', subId);

    // Отписка при размонтировании
    return () => {
      console.log('🗑️ Отписываемся:', subId);
      unsubscribe();
      setSubscriptionId(null);
    };
  }, [data.subscribe, data.widgetConfig?.widgetId, isPinned]); // Только при изменении этих зависимостей

  const handleResize = useCallback((event: any, params: any) => {
    if (data.onResize) {
      data.onResize(params.width, params.height );
    }
    
    updateNodeInternals(id);
  }, [data, id, updateNodeInternals]);

  const togglePin = () => {
    const newPinnedState = !isPinned;
    setIsPinned(newPinnedState);
    
    if (data.onPinToggle) {
      data.onPinToggle(newPinnedState);
    }
  };

  return (
    <div 
      className={`relative bg-white border-2 rounded-lg shadow-lg ${
        selected ? 'border-blue-500' : 'border-gray-200'
      }`}
      style={{
        width: '100%',
        height: '100%',
        overflow: 'hidden'
      }}
    >
      {selected && (
        <NodeResizer
          minWidth={600}
          minHeight={500}
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
          <span className="text-sm font-bold text-gray-800"> 📅 Календарь </span>
          <button
            onClick={togglePin}
            className={`p-1.5 rounded-full transition-colors ${
              isPinned 
                ? 'bg-blue-100 text-blue-600 hover:bg-blue-200' 
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
            title={isPinned ? "Открепить" : "Закрепить"}
          >
            {isPinned ? '📌' : '📍'}
          </button>
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
          apiBaseUrl={data.apiBaseUrl}
          initialEvents={data.events}
          onEventCreate={data.onEventCreate}
          onEventDelete={data.onEventDelete}
          onEventUpdate={data.onEventUpdate}
        />
      </div>
    </div>
  );
};

export default CalendarNode;