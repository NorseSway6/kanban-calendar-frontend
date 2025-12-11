import React, { useState } from 'react';
import { Calendar, momentLocalizer, View } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import TaskForm, { TaskData } from './components/TaskForm';
import './App.css';
import TaskDetails from './components/TaskDetails';


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
  const [events, setEvents] = useState<any[]>([
    {
      id: 1,
      title: 'Совещание по проекту',
      start: new Date(2024, 5, 15, 10, 0),
      end: new Date(2024, 5, 15, 11, 30),
    },
    {
      id: 2,
      title: 'Планирование спринта',
      start: new Date(2024, 5, 16, 14, 0),
      end: new Date(2024, 5, 16, 16, 0),
    },
  ]);
  
  const [currentView, setCurrentView] = useState<View>('month');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [showTaskDetails, setShowTaskDetails] = useState(false);
  
  moment.locale('ru');
  const localizer = momentLocalizer(moment);
  
  // Обработчик создания задачи
  const handleTaskSubmit = (taskData: TaskData) => {
    // Генерируем уникальный ID
    const newId = events.length > 0 ? Math.max(...events.map(e => e.id)) + 1 : 1;
    
    // Создаем новое событие
    const newEvent = {
      id: newId,
      title: taskData.title,
      start: taskData.startDate,
      end: taskData.endDate,
      status: taskData.status,
      description: taskData.description,
      resource: {
        ...taskData,
        id: newId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    };
    
    // Используем setEvents для обновления состояния
    setEvents([...events, newEvent]);
    
    console.log('Задача создана:', newEvent);
  };

  const handleDeleteTask = (taskId: number) => {
    if (window.confirm('Вы уверены, что хотите удалить эту задачу?')) {
      setEvents(events.filter(event => event.id !== taskId));
      setShowTaskDetails(false);
    }
  };

  const handleUpdateTask = (taskId: number, updatedData: TaskData) => {
    setEvents(events.map(event => {
        if (event.id === taskId) {
          return {
            ...event,
            title: updatedData.title,
            description: updatedData.description,
            status: updatedData.status,
            start: updatedData.startDate,
            end: updatedData.endDate,
            resource: {
              ...event.resource,
              ...updatedData,
              updated_at: new Date().toISOString(),
            }
          };
        }
        return event;
      }));
    
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