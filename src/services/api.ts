import { Assignment, WorkDateRange } from '../types/assignment';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-app-name.vercel.app/api' 
  : 'http://localhost:3000/api';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new ApiError(response.status, errorData.error || 'Request failed');
  }
  return response.json();
}

export const api = {
  // Assignment endpoints
  async getAssignments(): Promise<Assignment[]> {
    const response = await fetch(`${API_BASE_URL}/assignments`);
    const assignments = await handleResponse<Assignment[]>(response);
    
    // Convert date strings back to Date objects
    return assignments.map(assignment => ({
      ...assignment,
      dueDate: new Date(assignment.dueDate),
      startDate: assignment.startDate ? new Date(assignment.startDate) : undefined,
      createdAt: new Date(assignment.createdAt),
      updatedAt: new Date(assignment.updatedAt),
      workDateRanges: [] // Will be loaded separately
    }));
  },

  async getAssignment(id: string): Promise<Assignment> {
    const response = await fetch(`${API_BASE_URL}/assignments/${id}`);
    const assignment = await handleResponse<Assignment>(response);
    
    return {
      ...assignment,
      dueDate: new Date(assignment.dueDate),
      startDate: assignment.startDate ? new Date(assignment.startDate) : undefined,
      createdAt: new Date(assignment.createdAt),
      updatedAt: new Date(assignment.updatedAt),
      workDateRanges: [] // Will be loaded separately
    };
  },

  async createAssignment(assignment: Omit<Assignment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Assignment> {
    const response = await fetch(`${API_BASE_URL}/assignments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: assignment.title,
        description: assignment.description,
        due_date: assignment.dueDate.toISOString(),
        start_date: assignment.startDate?.toISOString(),
        completed: assignment.completed,
        priority: assignment.priority,
        subject: assignment.subject
      }),
    });
    
    const createdAssignment = await handleResponse<Assignment>(response);
    
    return {
      ...createdAssignment,
      dueDate: new Date(createdAssignment.dueDate),
      startDate: createdAssignment.startDate ? new Date(createdAssignment.startDate) : undefined,
      createdAt: new Date(createdAssignment.createdAt),
      updatedAt: new Date(createdAssignment.updatedAt),
      workDateRanges: []
    };
  },

  async updateAssignment(id: string, updates: Partial<Assignment>): Promise<Assignment> {
    const updateData: any = {};
    
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.dueDate !== undefined) updateData.due_date = updates.dueDate.toISOString();
    if (updates.startDate !== undefined) updateData.start_date = updates.startDate?.toISOString();
    if (updates.completed !== undefined) updateData.completed = updates.completed;
    if (updates.priority !== undefined) updateData.priority = updates.priority;
    if (updates.subject !== undefined) updateData.subject = updates.subject;

    const response = await fetch(`${API_BASE_URL}/assignments/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });
    
    const updatedAssignment = await handleResponse<Assignment>(response);
    
    return {
      ...updatedAssignment,
      dueDate: new Date(updatedAssignment.dueDate),
      startDate: updatedAssignment.startDate ? new Date(updatedAssignment.startDate) : undefined,
      createdAt: new Date(updatedAssignment.createdAt),
      updatedAt: new Date(updatedAssignment.updatedAt),
      workDateRanges: []
    };
  },

  async deleteAssignment(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/assignments/${id}`, {
      method: 'DELETE',
    });
    
    await handleResponse<{ success: boolean }>(response);
  },

  // Work date range endpoints
  async getWorkDateRanges(assignmentId: string): Promise<WorkDateRange[]> {
    const response = await fetch(`${API_BASE_URL}/assignments/${assignmentId}/work-ranges`);
    const ranges = await handleResponse<WorkDateRange[]>(response);
    
    return ranges.map(range => ({
      ...range,
      startDate: new Date(range.startDate),
      endDate: new Date(range.endDate)
    }));
  },

  async createWorkDateRange(assignmentId: string, startDate: Date, endDate: Date): Promise<WorkDateRange> {
    const response = await fetch(`${API_BASE_URL}/assignments/${assignmentId}/work-ranges`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      }),
    });
    
    const range = await handleResponse<WorkDateRange>(response);
    
    return {
      ...range,
      startDate: new Date(range.startDate),
      endDate: new Date(range.endDate)
    };
  },

  async deleteWorkDateRange(rangeId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/work-ranges/${rangeId}`, {
      method: 'DELETE',
    });
    
    await handleResponse<{ success: boolean }>(response);
  }
};

export { ApiError };
