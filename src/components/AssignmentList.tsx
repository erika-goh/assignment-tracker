import React from 'react';
import { Assignment, FilterOptions } from '../types/assignment';
import { Search, SortAsc, SortDesc } from 'lucide-react';
import AssignmentItem from './AssignmentItem';
import './AssignmentList.css';

interface AssignmentListProps {
  assignments: Assignment[];
  filters: FilterOptions;
  setFilters: (filters: FilterOptions) => void;
  onToggleCompletion: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Assignment>) => void;
}

const AssignmentList: React.FC<AssignmentListProps> = ({
  assignments,
  filters,
  setFilters,
  onToggleCompletion,
  onDelete,
  onUpdate
}) => {
  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    setFilters({ ...filters, [key]: value });
  };

  const toggleSortOrder = () => {
    setFilters({ ...filters, sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc' });
  };

  return (
    <div className="assignment-list">
      <div className="assignment-list-header">
        <h2>Assignments</h2>
        <div className="assignment-count">
          {assignments.length} assignment{assignments.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="filters">
        <div className="filter-group">
          <div className="search-box">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Search by subject..."
              value={filters.subject}
              onChange={(e) => handleFilterChange('subject', e.target.value)}
            />
          </div>

          <div className="filter-controls">
            <select
              value={filters.priority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
              className="filter-select"
              title="Filter by priority"
            >
              <option value="all">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>

            <label className="filter-checkbox">
              <input
                type="checkbox"
                checked={filters.showCompleted}
                onChange={(e) => handleFilterChange('showCompleted', e.target.checked)}
              />
              <span>Show Completed</span>
            </label>

            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="filter-select"
              title="Sort assignments"
            >
              <option value="dueDate">Sort by Due Date</option>
              <option value="priority">Sort by Priority</option>
              <option value="createdAt">Sort by Created</option>
            </select>

            <button
              className="sort-button"
              onClick={toggleSortOrder}
              title={`Sort ${filters.sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
            >
              {filters.sortOrder === 'asc' ? <SortAsc /> : <SortDesc />}
            </button>
          </div>
        </div>
      </div>

      <div className="assignments-container">
        {assignments.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <h3>No assignments found</h3>
            <p>Try adjusting your filters or add a new assignment</p>
          </div>
        ) : (
          <div className="assignments-grid">
            {assignments.map((assignment) => (
              <AssignmentItem
                key={assignment.id}
                assignment={assignment}
                onToggleCompletion={onToggleCompletion}
                onDelete={onDelete}
                onUpdate={onUpdate}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignmentList;
