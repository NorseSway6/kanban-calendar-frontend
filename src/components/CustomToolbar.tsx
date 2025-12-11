import React from 'react';
import { ToolbarProps } from 'react-big-calendar';

// Создаем упрощенный интерфейс без лишних пропсов
interface CustomToolbarProps extends Omit<ToolbarProps, 'onView' | 'views' | 'localizer'> {
  // Можно добавить кастомные пропсы при необходимости
}

const CustomToolbar: React.FC<CustomToolbarProps> = ({ 
  label, 
  onNavigate,
  date // Принимаем date, даже если не используем в отображении
}) => {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      marginBottom: '15px',
      padding: '10px',
      backgroundColor: '#f5f5f5',
      borderRadius: '6px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button onClick={() => onNavigate('PREV')} style={buttonStyle}>
          ◀ Назад
        </button>
        <button onClick={() => onNavigate('TODAY')} style={buttonStyle}>
          Сегодня
        </button>
        <button onClick={() => onNavigate('NEXT')} style={buttonStyle}>
          Вперёд ▶
        </button>
      </div>
      
      <span style={{ fontWeight: 'bold', fontSize: '16px' }}>
        {label}
      </span>
    </div>
  );
};

const buttonStyle = {
  padding: '6px 12px',
  backgroundColor: '#fff',
  border: '1px solid #ddd',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '14px'
};

export default CustomToolbar;