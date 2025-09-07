export interface Assignment {
  id: string;
  title: string;
  description?: string;
  dueDate: Date;
  startDate?: Date;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  subject: string;
  workDateRanges: WorkDateRange[];
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkDateRange {
  id: string;
  startDate: Date;
  endDate: Date;
  assignmentId: string;
}

export interface CalendarEvent {
  id: string;
  assignmentId: string;
  title: string;
  date: Date;
  type: 'due' | 'start';
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
}

export interface FilterOptions {
  showCompleted: boolean;
  priority: 'all' | 'low' | 'medium' | 'high';
  subject: string;
  sortBy: 'dueDate' | 'priority' | 'createdAt';
  sortOrder: 'asc' | 'desc';
}
