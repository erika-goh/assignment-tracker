import { useState, useEffect } from 'react';
import { Assignment, FilterOptions, WorkDateRange } from '../types/assignment';
import { api, ApiError } from '../services/api';

export const useAssignments = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({
    showCompleted: true,
    priority: 'all',
    subject: '',
    sortBy: 'dueDate',
    sortOrder: 'asc'
  });

  // Load assignments from API on mount
  useEffect(() => {
    const loadAssignments = async () => {
      try {
        setLoading(true);
        setError(null);
        const fetchedAssignments = await api.getAssignments();
        
        // Load work date ranges for each assignment
        const assignmentsWithRanges = await Promise.all(
          fetchedAssignments.map(async (assignment) => {
            try {
              const workRanges = await api.getWorkDateRanges(assignment.id);
              return { ...assignment, workDateRanges: workRanges };
            } catch (error) {
              console.error(`Error loading work ranges for assignment ${assignment.id}:`, error);
              return { ...assignment, workDateRanges: [] };
            }
          })
        );
        
        setAssignments(assignmentsWithRanges);
      } catch (error) {
        console.error('Error loading assignments:', error);
        setError(error instanceof ApiError ? error.message : 'Failed to load assignments');
      } finally {
        setLoading(false);
      }
    };

    loadAssignments();
  }, []);

  const addAssignment = async (assignment: Omit<Assignment, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setError(null);
      const newAssignment = await api.createAssignment(assignment);
      setAssignments(prev => [...prev, newAssignment]);
    } catch (error) {
      console.error('Error creating assignment:', error);
      setError(error instanceof ApiError ? error.message : 'Failed to create assignment');
      throw error;
    }
  };

  const updateAssignment = async (id: string, updates: Partial<Assignment>) => {
    try {
      setError(null);
      const updatedAssignment = await api.updateAssignment(id, updates);
      setAssignments(prev =>
        prev.map(assignment =>
          assignment.id === id ? updatedAssignment : assignment
        )
      );
    } catch (error) {
      console.error('Error updating assignment:', error);
      setError(error instanceof ApiError ? error.message : 'Failed to update assignment');
      throw error;
    }
  };

  const deleteAssignment = async (id: string) => {
    try {
      setError(null);
      await api.deleteAssignment(id);
      setAssignments(prev => prev.filter(assignment => assignment.id !== id));
    } catch (error) {
      console.error('Error deleting assignment:', error);
      setError(error instanceof ApiError ? error.message : 'Failed to delete assignment');
      throw error;
    }
  };

  const toggleCompletion = async (id: string) => {
    const assignment = assignments.find(a => a.id === id);
    if (assignment) {
      await updateAssignment(id, { completed: !assignment.completed });
    }
  };

  const addWorkDateRange = async (assignmentId: string, startDate: Date, endDate: Date) => {
    try {
      setError(null);
      const newRange = await api.createWorkDateRange(assignmentId, startDate, endDate);
      
      setAssignments(prev =>
        prev.map(assignment =>
          assignment.id === assignmentId
            ? { 
                ...assignment, 
                workDateRanges: [...assignment.workDateRanges, newRange]
              }
            : assignment
        )
      );
    } catch (error) {
      console.error('Error creating work date range:', error);
      setError(error instanceof ApiError ? error.message : 'Failed to create work date range');
      throw error;
    }
  };

  const removeWorkDateRange = async (assignmentId: string, rangeId: string) => {
    try {
      setError(null);
      await api.deleteWorkDateRange(rangeId);
      
      setAssignments(prev =>
        prev.map(assignment =>
          assignment.id === assignmentId
            ? { 
                ...assignment, 
                workDateRanges: assignment.workDateRanges.filter(range => range.id !== rangeId)
              }
            : assignment
        )
      );
    } catch (error) {
      console.error('Error deleting work date range:', error);
      setError(error instanceof ApiError ? error.message : 'Failed to delete work date range');
      throw error;
    }
  };

  const filteredAssignments = assignments
    .filter(assignment => {
      if (!filters.showCompleted && assignment.completed) return false;
      if (filters.priority !== 'all' && assignment.priority !== filters.priority) return false;
      if (filters.subject && !assignment.subject.toLowerCase().includes(filters.subject.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (filters.sortBy) {
        case 'dueDate':
          comparison = a.dueDate.getTime() - b.dueDate.getTime();
          break;
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
        case 'createdAt':
          comparison = a.createdAt.getTime() - b.createdAt.getTime();
          break;
      }
      return filters.sortOrder === 'desc' ? -comparison : comparison;
    });

  return {
    assignments: filteredAssignments,
    allAssignments: assignments,
    loading,
    error,
    filters,
    setFilters,
    addAssignment,
    updateAssignment,
    deleteAssignment,
    toggleCompletion,
    addWorkDateRange,
    removeWorkDateRange
  };
};
