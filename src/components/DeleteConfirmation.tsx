import React from 'react';
import './css/DeleteConfirmation.css';

interface DeleteConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  itemType?: string;
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
    <div className="delete-confirmation-overlay" onClick={handleOverlayClick}>
      <div className="delete-confirmation-modal">
        {/* Иконка предупреждения */}
        <div className="delete-confirmation-icon-container">
          <div className="delete-confirmation-warning-icon">
            <span className="delete-confirmation-exclamation">!</span>
          </div>
        </div>

        {/* Заголовок */}
        <h3 className="delete-confirmation-title">Подтверждение удаления</h3>

        {/* Сообщение */}
        <div className="delete-confirmation-message">
          <p style={{ margin: '0 0 10px 0' }}>
            Вы действительно хотите удалить <strong>"{title}"</strong>?
          </p>
          <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
            Это действие нельзя будет отменить. Все данные о {itemType} будут удалены.
          </p>
        </div>

        {/* Кнопки */}
        <div className="delete-confirmation-buttons-container">
          <button
            onClick={onClose}
            className="delete-confirmation-cancel-button"
            onKeyDown={(e) => {
              if (e.key === 'Escape') onClose();
            }}
          >
            Отменить
          </button>
          <button
            onClick={handleConfirm}
            className="delete-confirmation-confirm-button"
            autoFocus
          >
            Да, удалить
          </button>
        </div>

      </div>
    </div>
  );
};

export default DeleteConfirmation;