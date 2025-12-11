import React, { useState } from 'react';
import moment from 'moment';

interface EditTaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (taskData: TaskData) => void;
  taskData: TaskData;
}

// Используем тот же TaskData из TaskForm
export interface TaskData {
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  startDate: Date;
  endDate: Date;
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

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Название задачи не может быть пустым');
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

  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove),
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <div style={headerStyle}>
          <h3 style={{ margin: 0 }}>✏️ Редактировать задачу</h3>
          <button onClick={onClose} style={closeButtonStyle}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} style={formStyle}>
          {/* Название */}
          <div style={inputGroupStyle}>
            <label style={labelStyle}>Название задачи *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              style={inputStyle}
              placeholder="Введите название задачи"
              required
              autoFocus
            />
          </div>

          {/* Описание */}
          <div style={inputGroupStyle}>
            <label style={labelStyle}>Описание</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
              placeholder="Добавьте описание задачи"
              rows={3}
            />
          </div>

          <div style={rowStyle}>
            {/* Статус */}
            <div style={{ ...inputGroupStyle, flex: 1 }}>
              <label style={labelStyle}>Статус</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                style={inputStyle}
              >
                <option value="todo">📝 К выполнению</option>
                <option value="in_progress">🔄 В работе</option>
                <option value="done">✅ Выполнено</option>
              </select>
            </div>

            {/* Приоритет */}
            <div style={{ ...inputGroupStyle, flex: 1 }}>
              <label style={labelStyle}>Приоритет</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                style={inputStyle}
              >
                <option value="low">🟢 Низкий</option>
                <option value="medium">🟡 Средний</option>
                <option value="high">🔴 Высокий</option>
              </select>
            </div>
          </div>

          <div style={rowStyle}>
            {/* Дата начала */}
            <div style={{ ...inputGroupStyle, flex: 1 }}>
              <label style={labelStyle}>Дата начала</label>
              <input
                type="datetime-local"
                value={moment(formData.startDate).format('YYYY-MM-DDTHH:mm')}
                onChange={(e) => setFormData({ ...formData, startDate: new Date(e.target.value) })}
                style={inputStyle}
              />
            </div>

            {/* Дата окончания */}
            <div style={{ ...inputGroupStyle, flex: 1 }}>
              <label style={labelStyle}>Дата окончания</label>
              <input
                type="datetime-local"
                value={moment(formData.endDate).format('YYYY-MM-DDTHH:mm')}
                onChange={(e) => setFormData({ ...formData, endDate: new Date(e.target.value) })}
                style={inputStyle}
              />
            </div>
          </div>

          {/* Исполнитель */}
          <div style={inputGroupStyle}>
            <label style={labelStyle}>Исполнитель</label>
            <input
              type="text"
              value={formData.assignee}
              onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
              style={inputStyle}
              placeholder="Введите имя исполнителя"
            />
          </div>

          {/* Теги */}
          <div style={inputGroupStyle}>
            <label style={labelStyle}>Теги</label>
            <div style={tagInputStyle}>
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleKeyPress}
                style={{ ...inputStyle, borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
                placeholder="Введите тег и нажмите Enter"
              />
              <button
                type="button"
                onClick={addTag}
                style={tagAddButtonStyle}
              >
                +
              </button>
            </div>
            <div style={tagsContainerStyle}>
              {formData.tags.map((tag, index) => (
                <span key={index} style={tagStyle}>
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    style={tagRemoveButtonStyle}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Кнопки формы */}
          <div style={formActionsStyle}>
            <button type="button" onClick={onClose} style={cancelButtonStyle}>
              Отмена
            </button>
            <button type="submit" style={submitButtonStyle}>
              💾 Сохранить изменения
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Стили (можно вынести в отдельный файл или использовать те же, что и в TaskForm)
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
  maxWidth: '600px',
  maxHeight: '90vh',
  overflowY: 'auto',
  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
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
};

const formStyle: React.CSSProperties = {
  padding: '24px',
};

const inputGroupStyle: React.CSSProperties = {
  marginBottom: '20px',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  marginBottom: '6px',
  fontWeight: '500',
  color: '#333',
  fontSize: '14px',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  border: '1px solid #ddd',
  borderRadius: '6px',
  fontSize: '14px',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
};

const rowStyle: React.CSSProperties = {
  display: 'flex',
  gap: '16px',
  marginBottom: '20px',
};

const tagInputStyle: React.CSSProperties = {
  display: 'flex',
  marginBottom: '8px',
};

const tagAddButtonStyle: React.CSSProperties = {
  padding: '10px 16px',
  backgroundColor: '#f0f0f0',
  border: '1px solid #ddd',
  borderLeft: 'none',
  borderTopRightRadius: '6px',
  borderBottomRightRadius: '6px',
  cursor: 'pointer',
  fontSize: '16px',
};

const tagsContainerStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '6px',
};

const tagStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  backgroundColor: '#e9ecef',
  padding: '4px 10px',
  borderRadius: '16px',
  fontSize: '12px',
  color: '#495057',
};

const tagRemoveButtonStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: '#6c757d',
  cursor: 'pointer',
  fontSize: '14px',
  padding: '0',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const formActionsStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '12px',
  marginTop: '32px',
  paddingTop: '20px',
  borderTop: '1px solid #eaeaea',
};

const cancelButtonStyle: React.CSSProperties = {
  padding: '10px 20px',
  backgroundColor: '#6c757d',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '500',
};

const submitButtonStyle: React.CSSProperties = {
  padding: '10px 24px',
  backgroundColor: '#007bff',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '600',
};

export default EditTaskForm;