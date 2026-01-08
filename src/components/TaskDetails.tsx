import React, { useState } from 'react';
import moment from 'moment';
import 'moment/locale/ru';
import EditTaskForm, { TaskData } from './EditTaskForm';
import DeleteConfirmation from './DeleteConfirmation';
import './css/TaskDetails.css';

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo': return '#3174ad';
      case 'in_progress': return '#ffc107';
      case 'done': return '#28a745';
      default: return '#6c757d';
    }
  };
  
  const getStatusText = (status: string) => {
    switch (status) {
      case 'todo': return '📝 К выполнению';
      case 'in_progress': return '🔄 В работе';
      case 'done': return '✅ Выполнено';
      default: return status;
    }
  };
  
  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'low': return '🟢 Низкий';
      case 'medium': return '🟡 Средний';
      case 'high': return '🔴 Высокий';
      default: return priority;
    }
  };
    
  const getTaskFormData = (): TaskData => {
    // Обработка end_date: преобразуем строку в Date если нужно
    let endDate: Date | undefined;
    
    if (task.resource?.end_date) {
      // Если end_date есть, преобразуем его в Date
      const date = task.resource.end_date;
      endDate = date instanceof Date ? date : new Date(date);
    }
    
    return {
      title: task.title || task.resource?.title || '',
      description: task.description || task.resource?.description || '',
      status: (task.status || task.resource?.status || 'todo') as 'todo' | 'in_progress' | 'done',
      priority: (task.resource?.priority || 'medium') as 'low' | 'medium' | 'high',
      startDate: task.start ? new Date(task.start) : new Date(),
      endDate: endDate,
      assignee: task.resource?.assignee || '',
      tags: task.resource?.tags || [],
    };
  };
  
  const handleSave = (updatedData: TaskData) => {
    onUpdate(task.id, updatedData);
    setIsEditing(false);
  };
  
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
  
  return (
    <div className="task-details-overlay">
      <div className="task-details-modal">
        <div className="task-details-header">
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
          <button onClick={onClose} className="task-details-close-button">×</button>
        </div>
        
        <div className="task-details-content">
          <div className="task-details-section">
            <h4 className="task-details-section-title">Время</h4>
            <div className="task-details-dates-container">
              <div>
                <div className="task-details-date-label">Начало:</div>
                <div className="task-details-date-value">
                  {moment(task.start).format('DD.MM.YYYY HH:mm')}
                </div>
              </div>
              
              {task.resource?.end_date ? (
                <>
                  <div>
                    <div className="task-details-date-label">Окончание (дедлайн):</div>
                    <div className="task-details-date-value">
                      {moment(task.resource.end_date).format('DD.MM.YYYY HH:mm')}
                    </div>
                  </div>
                  
                  <div >
                    <div className="task-details-date-label">Длительность:</div>
                    <div className="task-details-date-value">
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
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', color: '#6c757d' }}>
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
          
          {task.description && (
            <div className="task-details-section">
              <h4 className="task-details-section-title">Описание</h4>
              <div className="task-details-description">
                {task.description}
              </div>
            </div>
          )}
          
          {task.resource?.assignee && (
            <div className="task-details-section">
              <h4 className="task-details-section-title">Исполнитель</h4>
              <div className="task-details-assignee">
                {task.resource.assignee}
              </div>
            </div>
          )}
        </div>
        
        <div className="task-details-actions">
          <button 
            onClick={() => setIsEditing(true)}
            className="task-details-edit-button"
          >
            Редактировать
          </button>
          <button 
            onClick={() => setShowDeleteConfirm(true)}
            className="task-details-delete-button"
          >
            Удалить
          </button>
          <button 
            onClick={onClose}
            className="task-details-cancel-button"
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
            onClose();
          }}
          title={task.title}
          itemType="задача"
        />
      )}
    </div>
  );
};

export default TaskDetails;