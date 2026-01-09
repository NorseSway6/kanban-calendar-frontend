// src/integration/standalone.ts
export const createStandaloneCallbacks = (apiBaseUrl: string) => {
  return {
    onEventCreate: async (event: any) => {
      console.log('📤 [Standalone] Создаем задачу:', event);
      
      const taskRequest: any = {
        title: event.title,
        description: event.description,
        status: event.status || 'todo',
        start_date: event.startDate.toISOString(),
        priority: event.priority || 'medium',
        assignee: event.assignee || ''
      };

      if (event.endDate) {
        taskRequest.end_date = event.endDate.toISOString();
        taskRequest.deadline = event.endDate.toISOString();
      }

      const response = await fetch(`${apiBaseUrl}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskRequest),
      });

      if (!response.ok) throw new Error('Ошибка создания задачи');
      return await response.json();
    },
    
    onEventDelete: async (eventId: number) => {
      console.log('🗑️ [Standalone] Удаляем задачу:', eventId);
      
      const response = await fetch(`${apiBaseUrl}/tasks/${eventId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Ошибка удаления задачи');
    },
    
    onEventUpdate: async (eventId: number, event: any) => {
      console.log('✏️ [Standalone] Обновляем задачу:', eventId, event);
      
      const taskRequest: any = {
        title: event.title,
        description: event.description,
        status: event.status || 'todo',
        start_date: event.startDate.toISOString(),
        priority: event.priority || 'medium',
        assignee: event.assignee || ''
      };

      if (event.endDate) {
        taskRequest.end_date = event.endDate.toISOString();
        taskRequest.deadline = event.endDate.toISOString();
      } else {
        taskRequest.end_date = null;
        taskRequest.deadline = null;
      }

      const response = await fetch(`${apiBaseUrl}/tasks/${eventId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskRequest),
      });

      if (!response.ok) throw new Error('Ошибка обновления задачи');
      return await response.json();
    }
  };
};