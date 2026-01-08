import React, { useState } from 'react';
import moment from 'moment';
import './css/EditTaskForm.css';

interface EditTaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (taskData: TaskData) => void;
  taskData: TaskData;
}

export interface TaskData {
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  startDate: Date;
  endDate?: Date;
  assignee: string;
  tags: string[];
}

const EditTaskForm: React.FC<EditTaskFormProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  taskData 
}) => {
  const [formData, setFormData] = useState<TaskData>(taskData);
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<{[key: string]: string}>({}); 

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Название задачи не может быть пустым');
      return;
    }

    // Проверяем валидацию дат
    const dateError = validateDates(formData.startDate, formData.endDate);
    if (dateError) {
      setErrors({...errors, dates: dateError});
      alert(dateError); // Показываем сообщение об ошибке
      return;
    }

    onSubmit(formData);
    onClose();
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()],
      });
      setTagInput('');
    }
  };

  const validateDates = (startDate: Date, endDate?: Date): string | null => {
    if (endDate && startDate > endDate) {
      return 'Дата начала не может быть позже даты окончания';
    }
    return null;
  };

  return (
    <div className="edit-task-overlay">
      <div className="edit-task-modal">
        <div className="edit-task-header">
          <h3 style={{ margin: 0 }}>Редактировать задачу</h3>
          <button onClick={onClose} className="edit-task-close-button">×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="edit-task-form">
          <div className="edit-task-input-group">
            <label className="edit-task-label">Название задачи *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="edit-task-input"
              placeholder="Введите название задачи"
              required
              autoFocus
            />
          </div>

          <div className="edit-task-input-group">
            <label className="edit-task-label">Описание</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="edit-task-input"
              style={{ minHeight: '80px', resize: 'vertical' }}
              placeholder="Добавьте описание задачи"
              rows={3}
            />
          </div>

          <div className="edit-task-row">
            <div className="edit-task-input-group" style={{ flex: 1 }}>
              <label className="edit-task-label">Статус</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="edit-task-input"
              >
                <option value="todo">📝 К выполнению</option>
                <option value="in_progress">🔄 В работе</option>
                <option value="done">✅ Выполнено</option>
              </select>
            </div>

            <div className="edit-task-input-group" style={{ flex: 1 }}>
              <label className="edit-task-label">Приоритет</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                className="edit-task-input"
              >
                <option value="low">🟢 Низкий</option>
                <option value="medium">🟡 Средний</option>
                <option value="high">🔴 Высокий</option>
              </select>
            </div>
          </div>

          <div className="task-form-row">
                      <div className="task-form-input-group" style={{ flex: 1 }}>
                        <label className="task-form-label">Дата и время начала *</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <input
                            type="date"
                            value={moment(formData.startDate).format('YYYY-MM-DD')}
                            onChange={(e) => {
                              const dateStr = e.target.value;
                              if (!dateStr) return;
                              
                              const newDate = new Date(formData.startDate);
                              const [year, month, day] = dateStr.split('-').map(Number);
                              newDate.setFullYear(year, month - 1, day);
                              setFormData({ ...formData, startDate: newDate });
          
                              const newFormData = { ...formData, startDate: newDate };
                              setFormData(newFormData);
                              
                              // Проверяем валидацию
                              const dateError = validateDates(newDate, newFormData.endDate);
                              if (dateError) {
                                setErrors({...errors, dates: dateError});
                              } else {
                                // Убираем ошибку, если она была
                                const newErrors = {...errors};
                                delete newErrors.dates;
                                setErrors(newErrors);
                              }
                            }}
                            className="task-form-input"
                            style={{ flex: 2 }}
                            required
                          />
                          <input
                            type="time"
                            value={moment(formData.startDate).format('HH:mm')}
                            onChange={(e) => {
                              const timeStr = e.target.value;
                              if (!timeStr) return;
                              
                              const newDate = new Date(formData.startDate);
                              const [hours, minutes] = timeStr.split(':').map(Number);
                              newDate.setHours(hours, minutes);
                              setFormData({ ...formData, startDate: newDate });
          
                              const newFormData = { ...formData, startDate: newDate };
                              setFormData(newFormData);
                              
                              // Проверяем валидацию
                              const dateError = validateDates(newDate, newFormData.endDate);
                              if (dateError) {
                                setErrors({...errors, dates: dateError});
                              } else {
                                const newErrors = {...errors};
                                delete newErrors.dates;
                                setErrors(newErrors);
                              }
                            }}
                            className="task-form-input"
                            style={{ flex: 1 }}
                            required
                            step="300"
                          />
                        </div>
                      </div>
          
                      <div className="task-form-input-group" style={{ flex: 1 }}>
                        <label className="task-form-label">Дата окончания (дедлайн)</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <input
                            type="date"
                            value={formData.endDate ? moment(formData.endDate).format('YYYY-MM-DD') : ''}
                            onChange={(e) => {
                              const dateStr = e.target.value;
                              if (dateStr) {
                                const newDate = formData.endDate ? new Date(formData.endDate) : new Date();
                                const [year, month, day] = dateStr.split('-').map(Number);
                                newDate.setFullYear(year, month - 1, day);
                                setFormData({ ...formData, endDate: newDate });
          
                                const newFormData = { ...formData, endDate: newDate };
                                setFormData(newFormData);
          
                                const dateError = validateDates(newFormData.startDate, newDate);
                                if (dateError) {
                                  setErrors({...errors, dates: dateError});
                                } else {
                                  const newErrors = {...errors};
                                  delete newErrors.dates;
                                  setErrors(newErrors);
                                }
                              } else {
                                setFormData({ ...formData, endDate: undefined });
                                const newErrors = {...errors};
                                delete newErrors.dates;
                                setErrors(newErrors);
                              }
                            }}
                            className="task-form-input"
                            style={{ flex: 2 }}
                            placeholder="Дата"
                          />
                          <input
                            type="time"
                            value={formData.endDate ? moment(formData.endDate).format('HH:mm') : ''}
                            onChange={(e) => {
                              const timeStr = e.target.value;
                              if (timeStr && formData.endDate) {
                                const newDate = new Date(formData.endDate);
                                const [hours, minutes] = timeStr.split(':').map(Number);
                                newDate.setHours(hours, minutes);
                                setFormData({ ...formData, endDate: newDate });
          
                                const newFormData = { ...formData, endDate: newDate };
                                setFormData(newFormData);
                                
                                // Проверяем валидацию
                                const dateError = validateDates(newFormData.startDate, newDate);
                                if (dateError) {
                                  setErrors({...errors, dates: dateError});
                                } else {
                                  const newErrors = {...errors};
                                  delete newErrors.dates;
                                  setErrors(newErrors);
                                }
                              } else if (timeStr && !formData.endDate) {
                                // Если дата не установлена, создаем новую с текущей датой
                                const newDate = new Date();
                                const [hours, minutes] = timeStr.split(':').map(Number);
                                newDate.setHours(hours, minutes);
                                setFormData({ ...formData, endDate: newDate });
          
                                const newFormData = { ...formData, endDate: newDate };
                                setFormData(newFormData);
                                
                                // Проверяем валидацию
                                const dateError = validateDates(newFormData.startDate, newDate);
                                if (dateError) {
                                  setErrors({...errors, dates: dateError});
                                } else {
                                  const newErrors = {...errors};
                                  delete newErrors.dates;
                                  setErrors(newErrors);
                                }
                              }
                            }}
                            className="task-form-input"
                            style={{ flex: 1 }}
                            placeholder="Время"
                          />
                        </div>
                      </div>
                    </div>

              {errors.dates && (
              <div style={{
                color: '#dc3545',
                fontSize: '12px',
                marginTop: 0,
                padding: '8px',
                backgroundColor: '#ffeaea',
                borderRadius: '4px',
                border: '1px solid #ff6b6b',
                marginBottom: '20px'
              }}>
                ⚠️ {errors.dates}
              </div>
            )}

          <div className="edit-task-input-group">
            <label className="edit-task-label">Исполнитель</label>
            <input
              type="text"
              value={formData.assignee}
              onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
              className="edit-task-input"
              placeholder="Введите имя исполнителя"
            />
          </div>

          <div className="edit-task-form-actions">
            <button type="button" onClick={onClose} className="edit-task-cancel-button">
              Отмена
            </button>
            <button type="submit" className="edit-task-submit-button">
              Сохранить изменения
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTaskForm;