// src/integration/standalone.ts
export const createStandaloneCallbacks = (apiBaseUrl: string) => {
  return {
    onEventCreate: async (event: any) => {
      
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

      if (!response.ok) throw new Error('[Standalone] Create task error');
      return await response.json();
    },
    
    onEventDelete: async (eventId: number) => {
      
      const response = await fetch(`${apiBaseUrl}/tasks/${eventId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('[Standalone] Delete task error');
    },
    
    onEventUpdate: async (eventId: number, event: any) => {
      
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

      if (!response.ok) throw new Error('Update task error');
      return await response.json();
    }
  };
};