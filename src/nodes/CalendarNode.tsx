// src/nodes/CalendarNode.tsx
import { Handle, Position, NodeResizer } from '@xyflow/react'; // Добавьте NodeResizer
import { CalendarNodeProps } from '../types/flow';
import App from '../App';

export const CalendarNode: React.FC<CalendarNodeProps> = ({ 
  data, 
  isConnectable,
  selected,
  width,
  height
}) => {
  return (
    <>
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} />
      
      <div style={{ 
        width: width || '850px',
        height: height || '650px',
        padding: '10px',
        border: `2px solid ${selected ? '#3366ff' : '#ddd'}`,
        borderRadius: '10px',
        background: 'white',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      }}>
        <App />
      </div>
      
      <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} />
    </>
  );
};