import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer, View } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import TaskForm, { TaskData } from './components/TaskForm';
import './App.css';
import TaskDetails from './components/TaskDetails';

const API_BASE_URL = 'http://localhost:8080/api';

// Кастомный Toolbar
const CustomToolbar: React.FC<any> = ({ label, onNavigate }) => {
  return (
    <div style={{
      width: '100%',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '15px 20px',
      backgroundColor: '#f5f5f5',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      marginBottom: '10px',
      borderRadius: '8px',
    }}>
      <div style={{ display: 'flex', gap: '10px' }}>
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
      
      <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
        {label}
      </div>
      
      <div style={{ display: 'flex', gap: '10px' }}>
        {/* Дополнительные кнопки */}
      </div>
    </div>
  );
};

const buttonStyle = {
  padding: '8px 16px',
  backgroundColor: '#fff',
  border: '1px solid #ddd',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '500'
};

// Основной компонент App
function App() {
  // ВАЖНО: добавьте setEvents здесь!
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<View>('month');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [showTaskDetails, setShowTaskDetails] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, [currentView, currentDate]);

    const fetchEvents = async () => {
      try {
        setLoading(true);

        const response = await fetch(`${API_BASE_URL}/tasks`);
        
        if (!response.ok) throw new Error('Ошибка загрузки данных');
        
        const data = await response.json();
        
        console.log('Задачи с сервера:', data.tasks);
        
        // Преобразуем задачи в события
        const formattedEvents = data.tasks.map((task: any) => {
          // Используем start_date для отображения
          const startDate = new Date(task.start_date);
          
          // Если есть end_date (дедлайн) - показываем интервал
          // Если нет - показываем как точечное событие
          const hasDeadline = !!task.end_date;
          const endDate = hasDeadline ? new Date(task.end_date) : null;
          
          // Определяем, как показывать событие
          let displayEnd: Date;
          let allDay = false;
          
          if (hasDeadline && endDate) {
            // Проверяем, многодневная ли задача
            const isMultiDay = endDate.getDate() !== startDate.getDate() || 
                              endDate.getMonth() !== startDate.getMonth() ||
                              endDate.getFullYear() !== startDate.getFullYear();
            
            displayEnd = endDate;
            allDay = isMultiDay;
          } else {
            // Без дедлайна - показываем как 1-часовое событие
            displayEnd = new Date(startDate.getTime() + 60 * 60 * 1000);
          }
          
          return {
            id: task.id,
            title: task.title,
            start: startDate,
            end: displayEnd,
            allDay: allDay,
            status: task.status,
            description: task.description,
            color: hasDeadline ? '#dc3545' : '#3174ad', // Красный для задач с дедлайном
            resource: task
          };
        });
        
        setEvents(formattedEvents);
      } catch (error) {
        console.error('Ошибка загрузки событий:', error);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };
      
  
  moment.locale('ru');
  const localizer = momentLocalizer(moment);
  
  // Обработчик создания задачи
  const handleTaskSubmit = async (taskData: TaskData) => {
    try {
      const taskRequest: any = {
        title: taskData.title,
        description: taskData.description,
        status: taskData.status || 'todo',
        start_date: taskData.startDate.toISOString(),
        priority: taskData.priority || 'medium',
        assignee: taskData.assignee || ''
      };

      if (taskData.endDate) {
        taskRequest.end_date = taskData.endDate.toISOString();
        taskRequest.deadline = taskData.endDate.toISOString();
      }

      const response = await fetch(`${API_BASE_URL}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskRequest),
      });

      if (!response.ok) throw new Error('Ошибка создания задачи');

      // ⭐ ВАЖНО: перезагружаем события после создания
      await fetchEvents();
      
      setShowTaskForm(false);
      setSelectedDate(undefined);
      
      console.log('Задача успешно создана и отображена');
    } catch (error) {
      console.error('Ошибка:', error);
      alert('Не удалось создать задачу');
    }
  };


  const handleDeleteTask = async (taskId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Ошибка удаления задачи');

      await fetchEvents(); // Перезагружаем события
      setShowTaskDetails(false);
      
      console.log('Задача успешно удалена');
    } catch (error) {
      console.error('Ошибка:', error);
      alert('Не удалось удалить задачу');
    }
  };

  const handleUpdateTask = async (taskId: number, updatedData: TaskData) => {
    try {
      const taskRequest: any = {
        title: updatedData.title,
        description: updatedData.description,
        status: updatedData.status || 'todo',
        start_date: updatedData.startDate.toISOString(),
        priority: updatedData.priority || 'medium',
        assignee: updatedData.assignee || ''
      };

      if (updatedData.endDate) {
        taskRequest.end_date = updatedData.endDate.toISOString();
        taskRequest.deadline = updatedData.endDate.toISOString(); // endDate = deadline
      }

      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskRequest),
      });

      if (!response.ok) throw new Error('Ошибка обновления задачи');

      await fetchEvents(); // Перезагружаем события
      
      console.log('Задача успешно обновлена');
    } catch (error) {
      console.error('Ошибка:', error);
      alert('Не удалось обновить задачу');
    }
  };

  
  // Стиль для кнопок вида
  const getViewButtonStyle = (viewName: View) => ({
    display: 'block',
    width: '100%',
    padding: '12px 15px',
    margin: '5px 0',
    backgroundColor: currentView === viewName ? '#3174ad' : 'transparent',
    color: currentView === viewName ? '#fff' : '#333',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    textAlign: 'left' as const,
    fontSize: '14px',
    fontWeight: currentView === viewName ? '600' : '400',
    transition: 'all 0.2s',
  });

  return (
    <div style={{ 
      display: 'flex', 
      height: '100vh', 
      backgroundColor: '#f8f9fa',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Боковая панель */}
      <div style={{
        width: '220px',
        backgroundColor: '#fff',
        padding: '20px',
        boxShadow: '2px 0 8px rgba(0,0,0,0.05)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 10,
      }}>
        <h2 style={{ 
          margin: '0 0 25px 0', 
          fontSize: '18px', 
          color: '#333',
          fontWeight: '600'
        }}>
          📅 Календарь
        </h2>
        
        <div style={{ marginBottom: '25px' }}>
          <h3 style={{ fontSize: '14px', color: '#666', margin: '0 0 10px 0' }}>Вид</h3>
          <button onClick={() => setCurrentView('month')} style={getViewButtonStyle('month')}>
            📅 Месяц
          </button>
          <button onClick={() => setCurrentView('week')} style={getViewButtonStyle('week')}>
            📆 Неделя
          </button>
          <button onClick={() => setCurrentView('day')} style={getViewButtonStyle('day')}>
            📝 День
          </button>
          <button onClick={() => setCurrentView('agenda')} style={getViewButtonStyle('agenda')}>
            📋 Список
          </button>
        </div>
        
        <button 
          onClick={() => {
            setSelectedDate(new Date());
            setShowTaskForm(true);
          }}
          style={{
            width: '100%',
            padding: '12px 15px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            marginTop: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          <span style={{ fontSize: '18px' }}>+</span>
          Новая задача
        </button>
      </div>

      {/* Основная область */}
      <div style={{ 
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        padding: '20px',
        overflow: 'hidden'
      }}>
        <h1 style={{ 
          margin: '0 0 20px 0', 
          fontSize: '24px', 
          color: '#333',
          fontWeight: '600'
        }}>
          Календарь задач
        </h1>
        
        {/* Календарь с кастомным Toolbar */}
        <div style={{ 
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#fff',
          borderRadius: '10px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
          overflow: 'hidden'
        }}>
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ 
              flex: 1,
              height: '100%'
            }}
            view={currentView}
            onView={setCurrentView}
            date={currentDate}
            onNavigate={(newDate) => setCurrentDate(newDate)}
            onSelectEvent={(event) => {
              setSelectedTask(event);
              setShowTaskDetails(true);
            }}
            selectable={false}
            eventPropGetter={(event) => {
              // Для Agenda представления не применяем цвет фона
              if (currentView === 'agenda') {
                return {
                  style: {
                    backgroundColor: 'transparent',
                    color: '#333'
                  }
                };
              }
              
              // Для других представлений применяем обычные стили
              return {
                style: {
                  backgroundColor: event.color || '#3174ad',
                  fontSize: '12px',
                  padding: '3px 6px',
                  color: 'white',
                  borderRadius: '3px',
                  border: 'none'
                }
              };
            }}
            components={{
              toolbar: (props) => (
                <CustomToolbar
                  {...props}
                  label={currentView === 'month' 
                    ? moment(currentDate).format('MMMM YYYY')
                    : currentView === 'week'
                    ? `Неделя ${moment(currentDate).format('WW')}, ${moment(currentDate).format('YYYY')}`
                    : currentView === 'day'
                    ? moment(currentDate).format('D MMMM YYYY')
                    : 'Список событий'}
                />
              )
            }}
            messages={{
              next: 'Вперёд',
              previous: 'Назад',
              today: 'Сегодня',
              month: 'Месяц',
              week: 'Неделя',
              day: 'День',
              agenda: 'Список',
              noEventsInRange: 'Нет событий в этом диапазоне',
              showMore: (count) => `+${count} ещё`,
            }}
          />
        </div>
      </div>

      {/* Форма создания задачи */}
      <TaskForm
        isOpen={showTaskForm}
        onClose={() => {
          setShowTaskForm(false);
          setSelectedDate(undefined);
        }}
        onSubmit={handleTaskSubmit}
        initialDate={selectedDate}
      />

      {showTaskDetails && selectedTask && (
        <TaskDetails
          task={selectedTask}
          isOpen={showTaskDetails}
          onClose={() => {
            setShowTaskDetails(false);
            setSelectedTask(null);
          }}
          onDelete={handleDeleteTask}
          onUpdate={handleUpdateTask}
        />
      )}
    </div>
  );
}

export default App;