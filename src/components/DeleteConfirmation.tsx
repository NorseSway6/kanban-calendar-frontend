import React from 'react';

interface DeleteConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  itemType?: string; // Например: "задача", "событие", "встреча"
}

const DeleteConfirmation: React.FC<DeleteConfirmationProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  itemType = 'задача'
}) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div style={overlayStyle} onClick={handleOverlayClick}>
      <div style={modalStyle}>
        {/* Иконка предупреждения */}
        <div style={iconContainerStyle}>
          <div style={warningIconStyle}>
            <span style={exclamationStyle}>!</span>
          </div>
        </div>

        {/* Заголовок */}
        <h3 style={titleStyle}>Подтверждение удаления</h3>

        {/* Сообщение */}
        <div style={messageStyle}>
          <p style={{ margin: '0 0 10px 0' }}>
            Вы действительно хотите удалить <strong>"{title}"</strong>?
          </p>
          <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
            Это действие нельзя будет отменить. Все данные о {itemType} будут удалены.
          </p>
        </div>

        {/* Статистика (можно адаптировать под ваши данные) */}
        <div style={statsStyle}>
          <div style={statItemStyle}>
            <span style={statLabelStyle}>Тип:</span>
            <span style={statValueStyle}>{itemType}</span>
          </div>
          <div style={statItemStyle}>
            <span style={statLabelStyle}>Длительность:</span>
            <span style={statValueStyle}>будет освобождена</span>
          </div>
        </div>

        {/* Кнопки */}
        <div style={buttonsContainerStyle}>
          <button
            onClick={onClose}
            style={cancelButtonStyle}
            onKeyDown={(e) => {
              if (e.key === 'Escape') onClose();
            }}
          >
            Отменить
          </button>
          <button
            onClick={handleConfirm}
            style={confirmButtonStyle}
            autoFocus
          >
            Да, удалить
          </button>
        </div>

        {/* Подсказка */}
        <div style={hintStyle}>
          Нажмите <kbd style={keyStyle}>ESC</kbd> для отмены
        </div>
      </div>
    </div>
  );
};

// Стили
const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 3000,
  padding: '20px',
  animation: 'fadeIn 0.2s ease',
};

const modalStyle: React.CSSProperties = {
  backgroundColor: 'white',
  borderRadius: '12px',
  width: '100%',
  maxWidth: '450px',
  padding: '30px',
  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
  textAlign: 'center',
};

const iconContainerStyle: React.CSSProperties = {
  marginBottom: '20px',
};

const warningIconStyle: React.CSSProperties = {
  width: '60px',
  height: '60px',
  backgroundColor: '#ffeaea',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 auto',
  border: '3px solid #ff6b6b',
};

const exclamationStyle: React.CSSProperties = {
  fontSize: '30px',
  fontWeight: 'bold',
  color: '#ff6b6b',
};

const titleStyle: React.CSSProperties = {
  margin: '0 0 15px 0',
  fontSize: '20px',
  color: '#333',
  fontWeight: '600',
};

const messageStyle: React.CSSProperties = {
  backgroundColor: '#f8f9fa',
  padding: '15px',
  borderRadius: '8px',
  marginBottom: '20px',
  fontSize: '15px',
  lineHeight: '1.5',
};

const statsStyle: React.CSSProperties = {
  backgroundColor: '#fff3cd',
  padding: '12px',
  borderRadius: '8px',
  marginBottom: '25px',
  border: '1px solid #ffecb5',
  fontSize: '14px',
};

const statItemStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: '8px',
};

const statLabelStyle: React.CSSProperties = {
  color: '#856404',
  fontWeight: '500',
};

const statValueStyle: React.CSSProperties = {
  color: '#333',
};

const buttonsContainerStyle: React.CSSProperties = {
  display: 'flex',
  gap: '12px',
  justifyContent: 'center',
};

const cancelButtonStyle: React.CSSProperties = {
  padding: '12px 24px',
  backgroundColor: '#6c757d',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '500',
  minWidth: '120px',
  transition: 'all 0.2s',
};

const confirmButtonStyle: React.CSSProperties = {
  padding: '12px 24px',
  backgroundColor: '#dc3545',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '600',
  minWidth: '120px',
  transition: 'all 0.2s',
  boxShadow: '0 2px 4px rgba(220, 53, 69, 0.3)',
};

const hintStyle: React.CSSProperties = {
  fontSize: '12px',
  color: '#999',
  marginTop: '20px',
};

const keyStyle: React.CSSProperties = {
  backgroundColor: '#f1f3f4',
  padding: '2px 6px',
  borderRadius: '4px',
  fontSize: '11px',
  fontFamily: 'monospace',
  border: '1px solid #ddd',
};

// Добавьте CSS анимацию в ваш App.css
const styles = `
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
`;

// Для использования анимаций добавьте в ваш App.css:
// @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

export default DeleteConfirmation;