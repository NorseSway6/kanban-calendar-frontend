import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, momentLocalizer, View } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import TaskForm, { TaskData } from './components/TaskForm';
import './App.css';
import TaskDetails from './components/TaskDetails';
import ImportCalendar from './components/ImportCalendar';

const API_BASE_URL = 'http://localhost:8080/api'; // АДРЕС БЕКЕНДА КАЛЕНДАРЯ
const TELEGRAM_BOT_URL = 'https://web.telegram.org/k/#@my_test_1234567890_bo_bot'; // ЗАМЕНИТЬ НА ССЫЛКУ СОЗДАННОГО БОТА

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
          ◀
        </button>
        <button onClick={() => onNavigate('TODAY')} style={buttonStyle}>
          Сегодня
        </button>
        <button onClick={() => onNavigate('NEXT')} style={buttonStyle}>
           ▶
        </button>
      </div>
      
      <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
        {label}
      </div>
    </div>
  );
};

const buttonStyle = {
  padding: '8px 16px',
  backgroundColor: '#fff',
  border: '1px solid #ddd',
  borderRadius: '10px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '500'
};

interface AppProps {
  apiBaseUrl?: string;
  initialEvents?: any[];
  onEventCreate?: (event: any) => Promise<void>;
  onEventDelete?: (eventId: number) => Promise<void>;
  onEventUpdate?: (eventId: number, event: any) => Promise<void>;
  subscribe?: (callback: (msg: any) => void) => () => void;
  sendMessage?: (msg: any) => void;
}

// Основной компонент App
function App({ 
  apiBaseUrl = API_BASE_URL,
  initialEvents = [],
  onEventCreate,
  onEventDelete,
  onEventUpdate,
  subscribe,
}: AppProps) {
  // ВАЖНО: добавьте setEvents здесь!
  const [events, setEvents] = useState<any[]>(initialEvents);
  const [_, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<View>('month');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [showTaskDetails, setShowTaskDetails] = useState(false);
  const [lastMessageTime, setLastMessageTime] = useState<number>(0);

  useEffect(() => {
    fetchEvents();
  }, [currentView, currentDate]);

    const fetchEvents = useCallback(async () => {
      try {
        setLoading(true);

        const response = await fetch(`${apiBaseUrl}/tasks`);
        
        if (!response.ok) throw new Error('Ошибка загрузки данных');
        
        const data = await response.json();
        
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
          
          // Определяем цвет по статусу (а не по наличию дедлайна)
          let color: string;
          switch (task.status) {
            case 'todo':
              color = '#3174ad'; // Красный
              break;
            case 'in_progress':
              color = '#ffc107'; // Желтый
              break;
            case 'done':
              color = '#28a745'; // Зеленый
              break;
            default:
              color = '#dc3545'; // Синий по умолчанию
          }
          
          return {
            id: task.id,
            title: task.title,
            start: startDate,
            end: displayEnd,
            allDay: allDay,
            status: task.status,
            description: task.description,
            color: color, // Цвет по статусу
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
    }, [apiBaseUrl]);
      
  
  moment.locale('ru');
  const localizer = momentLocalizer(moment);

  useEffect(() => {
    if (!subscribe) {
      console.log('⚠️ App: subscribe не доступен');
      return;
    }

    const messageHandler = (message: any) => {
      const now = Date.now();

      setLastMessageTime(now);
      console.log('📨 App получил сообщение:', message.type);
      
      // Обновляем календарь только для определенных типов сообщений
      if (['EVENT_CREATED', 'EVENT_UPDATED', 'EVENT_DELETED'].includes(message.type)) {
        console.log('Обновляю календарь из-за:', message.type);
        fetchEvents();
      }
    };

    const unsubscribe = subscribe(messageHandler);
    console.log('✅ App подписался на сообщения');

    return () => {
      console.log('🗑️ App отписался от сообщений');
      unsubscribe();
    };
  }, [subscribe, fetchEvents, lastMessageTime]); // Добавляем fetchEvents в зависимости
  
  // Обработчик создания задачи
  const handleTaskSubmit = async (taskData: TaskData) => {
    try {
      if (!onEventCreate) {
        throw new Error('Функция onEventCreate не предоставлена платформой');
      }
      
      console.log('🔄 Используем колбэк onEventCreate:', taskData);
      await onEventCreate(taskData);
      
      await fetchEvents();
      setShowTaskForm(false);
      setSelectedDate(undefined);
      
      console.log('Задача успешно создана и отображена');
    } catch (error) {
      console.error('❌ Ошибка создания задачи:', error);
      alert('Не удалось создать задачу. Проверьте консоль для подробностей.');
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    try {
      if (!onEventDelete) {
        throw new Error('Функция onEventDelete не предоставлена платформой');
      }
      
      console.log('🔄 Используем колбэк onEventDelete:', taskId);
      await onEventDelete(taskId);
      
      await fetchEvents();
      setShowTaskDetails(false);
      
      console.log('Задача успешно удалена');
    } catch (error) {
      console.error('❌ Ошибка удаления задачи:', error);
      alert('Не удалось удалить задачу');
    }
  };

  const handleUpdateTask = async (taskId: number, updatedData: TaskData) => {
    try {
      if (!onEventUpdate) {
        throw new Error('Функция onEventUpdate не предоставлена платформой');
      }
      
      console.log('🔄 Используем колбэк onEventUpdate:', taskId, updatedData);
      await onEventUpdate(taskId, updatedData);
      
      await fetchEvents();
      
      console.log('Задача успешно обновлена');
    } catch (error) {
      console.error('❌ Ошибка обновления задачи:', error);
      alert('Не удалось обновить задачу');
    }
  };

  const handleImportSuccess = () => {
    console.log('Импорт календаря успешен, обновляю события...');
    fetchEvents(); // Обновляем календарь
  };

  const handleImportError = (error: string) => {
    console.error('Ошибка импорта календаря:', error);
    alert(`Ошибка импорта: ${error}`);
  };


  return (
    <div style={{ 
      display: 'flex', 
      height: '100%', 
      backgroundColor: '#f8f9fa',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Боковая панель */}
      <div className='sidebar'>
          <div className="sidebar-top">            
            <div style={{ marginBottom: '25px' }}>
                <button 
                    onClick={() => {
                      setSelectedDate(new Date());
                      setShowTaskForm(true);
                    }}
                    className="create-task-button"
                  >
                    <span>+</span>
                    Новая задача
                </button>
                <button 
                  onClick={() => setCurrentView('month')} 
                  className="view-button"
                  style={{
                    backgroundColor: currentView === 'month' ? 'rgba(255, 255, 255, 0.3)' : 'transparent',
                    color: currentView === 'month' ? 'white' : 'white',
                    fontWeight: currentView === 'month' ? '600' : '400',
                  }}
                >
                  Месяц
                </button>
                <button 
                  onClick={() => setCurrentView('week')} 
                  className="view-button"
                  style={{
                    backgroundColor: currentView === 'week' ? 'rgba(255, 255, 255, 0.3)' : 'transparent',
                    color: currentView === 'week' ? 'white' : 'white',
                    fontWeight: currentView === 'week' ? '600' : '400',
                  }}
                >
                  Неделя
                </button>
                <button 
                  onClick={() => setCurrentView('day')} 
                  className="view-button"
                  style={{
                    backgroundColor: currentView === 'day' ? 'rgba(255, 255, 255, 0.3)' : 'transparent',
                    color: currentView === 'day' ? 'white' : 'white',
                    fontWeight: currentView === 'day' ? '600' : '400',
                  }}
                >
                  День
                </button>
                <button 
                  onClick={() => setCurrentView('agenda')} 
                  className="view-button"
                  style={{
                    backgroundColor: currentView === 'agenda' ? 'rgba(255, 255, 255, 0.3)' : 'transparent',
                    color: currentView === 'agenda' ? 'white' : 'white',
                    fontWeight: currentView === 'agenda' ? '600' : '400',
                  }}
                >
                  Список
                </button>
              </div>
            </div>

              {/* Кнопка Telegram бота */}
              <div className="sidebar-bottom">
                 <div style={{ 
                    marginTop: '20px',
                  }}>
                    <ImportCalendar 
                      apiBaseUrl={apiBaseUrl}
                      onImportSuccess={handleImportSuccess}
                      onImportError={handleImportError}
                    />
                  </div>
                <a
                  href={TELEGRAM_BOT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="telegram-button"
                >
                  <svg width="35" height="35" viewBox="0 0 25 25" fill="currentColor">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.157l-1.895 8.863c-.127.585-.465.731-.942.455l-2.605-1.92-1.258 1.213c-.139.139-.256.256-.525.256l.188-2.665 4.838-4.37c.211-.188-.046-.292-.327-.104l-5.984 3.77-2.584-.805c-.564-.176-.576-.564.117-.844l10.1-3.883c.47-.176.882.104.728.844z"/>
                  </svg>
                  Напомнить о дедлайне
                </a>
              </div>
      </div>

      {/* Основная область */}
      <div style={{ 
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        padding: '20px',
        overflow: 'hidden'
      }}>
        
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