// src/nodes/CalendarNode.tsx
import { Handle, Position, NodeResizer, useUpdateNodeInternals } from '@xyflow/react';
import { useState, useCallback, useEffect } from 'react';
import App from '../App';

const CalendarNode = ({ id, data, selected, isConnectable = true, width, height }: any) => {
  const [isPinned, setIsPinned] = useState(data.isPinned || false);
  const [dimensions, setDimensions] = useState({ 
    width: width || data.width || 900, 
    height: height || data.height || 700 
  });
  
  const updateNodeInternals = useUpdateNodeInternals();

  useEffect(() => {
    if (width && height) {
      setDimensions({ width, height });
    }
  }, [width, height]);

  const handleResize = useCallback((event: any, params: any) => {
    setDimensions({ width: params.width, height: params.height });
    
    if (data.onResize) {
      data.onResize(params.width, params.height, id);
    }
    
    updateNodeInternals(id);
  }, [data, id, updateNodeInternals]);

  const handleResizeStop = useCallback((event: any, params: any) => {
    console.log('Resize stopped:', params);
  }, []);

  const togglePin = () => {
    const newPinnedState = !isPinned;
    setIsPinned(newPinnedState);
    
    if (data.onPinToggle) {
      data.onPinToggle(newPinnedState, id);
    }
  };

  return (
    <div 
      className={`relative bg-white border-2 rounded-lg shadow-lg ${
        selected ? 'border-blue-500' : 'border-gray-200'
      }`}
      style={{
        width: dimensions.width,
        height: dimensions.height,
        overflow: 'hidden'
      }}
    >
      {/* NodeResizer для изменения размера */}
      {selected && (
        <NodeResizer
          minWidth={600}
          minHeight={500}
          maxWidth={1400}
          maxHeight={1000}
          lineClassName="border-blue-400"
          handleClassName="h-4 w-4 bg-white border-2 border-blue-400 rounded-full"
          onResize={handleResize}
          onResizeEnd={handleResizeStop}
        />
      )}
      
      {/* Верхняя панель */}
        <div
          className={`p-1 cursor-move flex justify-between items-center ${
            !isPinned ? 'dragHandle_custom' : ''
          }`}
        >
          {/* Handle слева */}
          <Handle 
            type="target" 
            position={Position.Left} 
            className="z-100000 !w-3 !h-3 !bg-blue-500 !border-2 !border-white !rounded-full" 
          />
          
          {/* Кнопка закрепления*/}
          <div className="flex gap-2 items-center">
            <span className="text-sm font-bold w-full text-center pr-4"> 📅 Календарь </span>

            <button
              onClick={togglePin}
              className={`cursor-pointer p-1 rounded-full ${
                isPinned ? 'text-blue-500 bg-blue-50' : 'text-gray-500 bg-gray-100'
              }`}
              title={isPinned ? "Открепить" : "Закрепить"}
            >
              {isPinned ? '📌' : '📍'}
            </button>
          </div>

          <Handle 
              type="source" 
              position={Position.Right} 
              className="z-100000 !w-3 !h-3 !bg-green-500 !border-2 !border-white !rounded-full" 
            />
        </div>

      {/* Календарь (основное содержимое) */}
      <div 
        className="overflow-hidden"
        style={{ 
          width: '100%', 
          height: 'calc(100% - 40px)'
        }}
      >
        <App />
      </div>
    </div>
  );
};

export default CalendarNode;