import React, { useState } from 'react';
import moment from 'moment';
import 'moment/locale/ru';
import EditTaskForm, { TaskData } from './EditTaskForm';
import DeleteConfirmation from './DeleteConfirmation';

interface TaskDetailsProps {
  task: any;
  isOpen: boolean;
  onClose: () => void;
  onDelete: (taskId: number) => void;
  onUpdate: (taskId: number, updatedData: TaskData) => void;
}

const TaskDetails: React.FC<TaskDetailsProps> = ({ 
  task, 
  isOpen, 
  onClose, 
  onDelete, 
  onUpdate 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  
  if (!isOpen || !task) return null;
  
  const calculateDuration = (start: Date, end: Date): string => {
    const diffMs = end.getTime() - start.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays > 0) {
      return `${diffDays} дней`;
    } else {
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      return `${diffHours} часов`;
    }
  };

  // Функция для получения цвета статуса
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo': return '#3174ad';
      case 'in_progress': return '#ffc107';
      case 'done': return '#28a745';
      default: return '#6c757d';
    }
  };
  
  // Функция для получения текста статуса
  const getStatusText = (status: string) => {
    switch (status) {
      case 'todo': return '📝 К выполнению';
      case 'in_progress': return '🔄 В работе';
      case 'done': return '✅ Выполнено';
      default: return status;
    }
  };
  
  // Функция для получения текста приоритета
  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'low': return '🟢 Низкий';
      case 'medium': return '🟡 Средний';
      case 'high': return '🔴 Высокий';
      default: return priority;
    }
  };
  
  // Преобразуем данные задачи для формы редактирования
  const getTaskFormData = (): TaskData => {
    return {
      title: task.title || task.resource?.title || '',
      description: task.description || task.resource?.description || '',
      status: (task.status || task.resource?.status || 'todo') as 'todo' | 'in_progress' | 'done',
      priority: (task.resource?.priority || 'medium') as 'low' | 'medium' | 'high',
      startDate: task.start ? new Date(task.start) : new Date(),
      assignee: task.resource?.assignee || '',
      tags: task.resource?.tags || [],
    };
  };
  
  // Обработчик сохранения изменений
  const handleSave = (updatedData: TaskData) => {
    onUpdate(task.id, updatedData);
    setIsEditing(false);
  };
  
  // Если режим редактирования - показываем форму
  if (isEditing) {
    return (
        <EditTaskForm
        isOpen={true}
        onClose={() => setIsEditing(false)}
        onSubmit={handleSave}
        taskData={getTaskFormData()}
        />
    );
  }
  
  // Режим просмотра
  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        {/* Заголовок */}
        <div style={headerStyle}>
          <div>
            <h3 style={{ margin: 0, fontSize: '20px' }}>{task.title}</h3>
            <div style={{ 
              display: 'flex', 
              gap: '10px', 
              marginTop: '5px',
              fontSize: '13px',
              color: '#666'
            }}>
              <span style={{
                backgroundColor: getStatusColor(task.status || task.resource?.status),
                color: 'white',
                padding: '2px 8px',
                borderRadius: '12px',
                fontSize: '12px',
              }}>
                {getStatusText(task.status || task.resource?.status)}
              </span>
              <span style={{
                backgroundColor: '#e9ecef',
                padding: '2px 8px',
                borderRadius: '12px',
                fontSize: '12px',
              }}>
                {getPriorityText(task.resource?.priority)}
              </span>
            </div>
          </div>
          <button onClick={onClose} style={closeButtonStyle}>×</button>
        </div>
        
        {/* Контент */}
        <div style={contentStyle}>
          {/* Даты */}
          <div style={sectionStyle}>
            <h4 style={sectionTitleStyle}>📅 Время</h4>
            <div style={datesContainerStyle}>
              <div>
                <div style={dateLabelStyle}>Начало:</div>
                <div style={dateValueStyle}>
                  {moment(task.start).format('DD.MM.YYYY HH:mm')}
                </div>
              </div>
              
              {/* Проверяем наличие явного дедлайна, а не просто task.end */}
              {task.resource?.end_date ? (
                <>
                  <div>
                    <div style={dateLabelStyle}>Окончание (дедлайн):</div>
                    <div style={dateValueStyle}>
                      {moment(task.resource.end_date).format('DD.MM.YYYY HH:mm')}
                    </div>
                  </div>
                  
                  {/* Блок "Длительность" показываем только если есть дедлайн */}
                  <div style={{ 
                    marginTop: '15px',
                    padding: '10px',
                    backgroundColor: '#e9ecef',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}>
                    <div style={dateLabelStyle}>Длительность:</div>
                    <div style={dateValueStyle}>
                      {calculateDuration(
                        new Date(task.start), 
                        new Date(task.resource.end_date)
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div style={{ 
                  marginTop: '10px',
                  padding: '12px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '6px',
                  borderLeft: '4px solid #6c757d'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', color: '#6c757d' }}>
                    <span style={{ marginRight: '8px' }}>📅</span>
                    <div>
                      <div style={{ fontWeight: '500', fontSize: '14px' }}>Без дедлайна</div>
                      <div style={{ fontSize: '12px', marginTop: '2px' }}>
                        Задача не имеет установленного срока выполнения
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Описание */}
          {task.description && (
            <div style={sectionStyle}>
              <h4 style={sectionTitleStyle}>📄 Описание</h4>
              <div style={descriptionStyle}>
                {task.description}
              </div>
            </div>
          )}
          
          {/* Исполнитель */}
          {task.resource?.assignee && (
            <div style={sectionStyle}>
              <h4 style={sectionTitleStyle}>👤 Исполнитель</h4>
              <div style={assigneeStyle}>
                {task.resource.assignee}
              </div>
            </div>
          )}
          
          {/* Теги */}
          {task.resource?.tags && task.resource.tags.length > 0 && (
            <div style={sectionStyle}>
              <h4 style={sectionTitleStyle}>🏷️ Теги</h4>
              <div style={tagsContainerStyle}>
                {task.resource.tags.map((tag: string, index: number) => (
                  <span key={index} style={tagStyle}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {/* Метаданные */}
          <div style={metadataStyle}>
            <div style={metadataItemStyle}>
              <span style={metadataLabelStyle}>ID задачи:</span>
              <span style={metadataValueStyle}>{task.id}</span>
            </div>
            {task.resource?.created_at && (
              <div style={metadataItemStyle}>
                <span style={metadataLabelStyle}>Создана:</span>
                <span style={metadataValueStyle}>
                  {moment(task.resource.created_at).format('DD.MM.YYYY HH:mm')}
                </span>
              </div>
            )}
            {task.resource?.updated_at && (
              <div style={metadataItemStyle}>
                <span style={metadataLabelStyle}>Обновлена:</span>
                <span style={metadataValueStyle}>
                  {moment(task.resource.updated_at).format('DD.MM.YYYY HH:mm')}
                </span>
              </div>
            )}
          </div>
        </div>
        
        {/* Кнопки действий */}
        <div style={actionsStyle}>
          <button 
            onClick={() => setIsEditing(true)}
            style={editButtonStyle}
          >
            ✏️ Редактировать
          </button>
          <button 
            onClick={() => setShowDeleteConfirm(true)}
            style={deleteButtonStyle}
            >
            🗑️ Удалить
          </button>
          <button 
            onClick={onClose}
            style={cancelButtonStyle}
          >
            Закрыть
          </button>
        </div>
      </div>
      {showDeleteConfirm && (
        <DeleteConfirmation
            isOpen={showDeleteConfirm}
            onClose={() => setShowDeleteConfirm(false)}
            onConfirm={() => {
            onDelete(task.id);
            onClose(); // Закрыть детали задачи
            }}
            title={task.title}
            itemType="задача"
        />
        )}
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
  zIndex: 2000,
  padding: '20px',
};

const modalStyle: React.CSSProperties = {
  backgroundColor: 'white',
  borderRadius: '12px',
  width: '100%',
  maxWidth: '500px',
  maxHeight: '90vh',
  overflowY: 'auto',
  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  padding: '20px 24px',
  borderBottom: '1px solid #eaeaea',
};

const closeButtonStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  fontSize: '24px',
  cursor: 'pointer',
  color: '#666',
  padding: '0',
  width: '30px',
  height: '30px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '4px',
  marginLeft: '10px',
};

const contentStyle: React.CSSProperties = {
  padding: '0 24px 24px',
};

const sectionStyle: React.CSSProperties = {
  marginBottom: '20px',
};

const sectionTitleStyle: React.CSSProperties = {
  margin: '0 0 10px 0',
  fontSize: '14px',
  color: '#666',
  fontWeight: '500',
};

const datesContainerStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
  gap: '15px',
  backgroundColor: '#f8f9fa',
  padding: '15px',
  borderRadius: '8px',
};

const dateLabelStyle: React.CSSProperties = {
  fontSize: '12px',
  color: '#6c757d',
  marginBottom: '4px',
};

const dateValueStyle: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: '500',
  color: '#333',
};

const descriptionStyle: React.CSSProperties = {
  backgroundColor: '#f8f9fa',
  padding: '15px',
  borderRadius: '8px',
  fontSize: '14px',
  lineHeight: '1.5',
  color: '#333',
  whiteSpace: 'pre-wrap',
};

const assigneeStyle: React.CSSProperties = {
  backgroundColor: '#e7f3ff',
  padding: '10px 15px',
  borderRadius: '8px',
  fontSize: '14px',
  color: '#0066cc',
  fontWeight: '500',
};

const tagsContainerStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '8px',
};

const tagStyle: React.CSSProperties = {
  backgroundColor: '#e9ecef',
  padding: '6px 12px',
  borderRadius: '16px',
  fontSize: '13px',
  color: '#495057',
};

const metadataStyle: React.CSSProperties = {
  padding: '15px',
  backgroundColor: '#f8f9fa',
  borderRadius: '8px',
  fontSize: '12px',
};

const metadataItemStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: '6px',
};

const metadataLabelStyle: React.CSSProperties = {
  color: '#6c757d',
};

const metadataValueStyle: React.CSSProperties = {
  color: '#495057',
  fontWeight: '500',
};

const actionsStyle: React.CSSProperties = {
  display: 'flex',
  gap: '10px',
  padding: '20px 24px',
  borderTop: '1px solid #eaeaea',
  backgroundColor: '#f8f9fa',
  borderBottomLeftRadius: '12px',
  borderBottomRightRadius: '12px',
};

const editButtonStyle: React.CSSProperties = {
  flex: 1,
  padding: '10px 15px',
  backgroundColor: '#007bff',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '500',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
};

const deleteButtonStyle: React.CSSProperties = {
  flex: 1,
  padding: '10px 15px',
  backgroundColor: '#dc3545',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '500',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
};

const cancelButtonStyle: React.CSSProperties = {
  flex: 1,
  padding: '10px 15px',
  backgroundColor: '#6c757d',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '500',
};

export default TaskDetails;