import React, { useState, useRef, useCallback } from 'react';
import Calendar from 'react-calendar';
import { Assignment, WorkDateRange } from '../types/assignment';
import { format, isSameDay, isAfter, isBefore, addDays, isWithinInterval } from 'date-fns';
import { AlertCircle, Clock, Calendar as CalendarIcon, MousePointer } from 'lucide-react';
import './Calendar.css';

interface CalendarProps {
  assignments: Assignment[];
  onAddWorkDateRange?: (assignmentId: string, startDate: Date, endDate: Date) => void;
  onRemoveWorkDateRange?: (assignmentId: string, rangeId: string) => void;
}

const CalendarView: React.FC<CalendarProps> = ({ 
  assignments, 
  onAddWorkDateRange, 
  onRemoveWorkDateRange 
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<Date | null>(null);
  const [dragEnd, setDragEnd] = useState<Date | null>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  const getAssignmentsForDate = (date: Date) => {
    return assignments.filter(assignment => {
      const isDueDate = isSameDay(assignment.dueDate, date);
      const isStartDate = assignment.startDate && isSameDay(assignment.startDate, date);
      return isDueDate || isStartDate;
    });
  };

  const isDateInWorkRange = (date: Date, assignment: Assignment) => {
    return assignment.workDateRanges.some(range => 
      isWithinInterval(date, { start: range.startDate, end: range.endDate })
    );
  };

  const isDateInDragRange = (date: Date) => {
    if (!dragStart || !dragEnd) return false;
    const start = dragStart < dragEnd ? dragStart : dragEnd;
    const end = dragStart < dragEnd ? dragEnd : dragStart;
    return isWithinInterval(date, { start, end });
  };

  const handleMouseDown = useCallback((date: Date) => {
    if (!selectedAssignment) return;
    
    setIsDragging(true);
    setDragStart(date);
    setDragEnd(date);
  }, [selectedAssignment]);

  const handleMouseEnter = useCallback((date: Date) => {
    if (!isDragging || !dragStart) return;
    setDragEnd(date);
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    if (!isDragging || !dragStart || !dragEnd || !selectedAssignment || !onAddWorkDateRange) {
      setIsDragging(false);
      setDragStart(null);
      setDragEnd(null);
      return;
    }

    const start = dragStart < dragEnd ? dragStart : dragEnd;
    const end = dragStart < dragEnd ? dragEnd : dragStart;
    
    // Only add if the range is at least 1 day
    if (!isSameDay(start, end)) {
      onAddWorkDateRange(selectedAssignment.id, start, end);
    }
    
    setIsDragging(false);
    setDragStart(null);
    setDragEnd(null);
  }, [isDragging, dragStart, dragEnd, selectedAssignment, onAddWorkDateRange]);

  const getAssignmentsForSelectedDate = () => {
    return getAssignmentsForDate(selectedDate);
  };

  const getUpcomingAssignments = () => {
    const today = new Date();
    const nextWeek = addDays(today, 7);
    
    return assignments
      .filter(assignment => 
        !assignment.completed && 
        isAfter(assignment.dueDate, today) && 
        isBefore(assignment.dueDate, nextWeek)
      )
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
      .slice(0, 5);
  };

  const getOverdueAssignments = () => {
    const today = new Date();
    
    return assignments
      .filter(assignment => 
        !assignment.completed && 
        isBefore(assignment.dueDate, today)
      )
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
  };

  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view !== 'month') return null;
    
    const dayAssignments = getAssignmentsForDate(date);
    const dueAssignments = dayAssignments.filter(a => isSameDay(a.dueDate, date));
    const startAssignments = dayAssignments.filter(a => a.startDate && isSameDay(a.startDate, date));
    
    // Check if this date is in any work date ranges
    const workRangeAssignments = assignments.filter(assignment => 
      isDateInWorkRange(date, assignment)
    );
    
    // Check if this date is in the current drag selection
    const isInDragRange = isDateInDragRange(date);
    
    return (
      <div 
        className={`calendar-tile-content ${isInDragRange ? 'drag-selecting' : ''}`}
        onMouseDown={() => handleMouseDown(date)}
        onMouseEnter={() => handleMouseEnter(date)}
        onMouseUp={handleMouseUp}
      >
        {dueAssignments.map((assignment, index) => (
          <div
            key={`due-${assignment.id}-${index}`}
            className={`calendar-event due ${assignment.completed ? 'completed' : ''} ${assignment.priority}`}
            title={`Due: ${assignment.title}`}
          >
            <AlertCircle className="event-icon" />
          </div>
        ))}
        {startAssignments.map((assignment, index) => (
          <div
            key={`start-${assignment.id}-${index}`}
            className={`calendar-event start ${assignment.completed ? 'completed' : ''} ${assignment.priority}`}
            title={`Start: ${assignment.title}`}
          >
            <Clock className="event-icon" />
          </div>
        ))}
        {workRangeAssignments.map((assignment, index) => (
          <div
            key={`work-${assignment.id}-${index}`}
            className={`calendar-event work ${assignment.completed ? 'completed' : ''} ${assignment.priority}`}
            title={`Work on: ${assignment.title}`}
          >
            <MousePointer className="event-icon" />
          </div>
        ))}
      </div>
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const selectedDateAssignments = getAssignmentsForSelectedDate();
  const upcomingAssignments = getUpcomingAssignments();
  const overdueAssignments = getOverdueAssignments();

  return (
    <div className="calendar-view">
      <div className="calendar-header">
        <h2>Assignment Calendar</h2>
        <div className="calendar-controls">
          <div className="assignment-selector">
            <label htmlFor="assignment-select">Select Assignment to Plan:</label>
            <select
              id="assignment-select"
              value={selectedAssignment?.id || ''}
              onChange={(e) => {
                const assignment = assignments.find(a => a.id === e.target.value);
                setSelectedAssignment(assignment || null);
              }}
              className="assignment-select"
            >
              <option value="">Choose an assignment...</option>
              {assignments.map(assignment => (
                <option key={assignment.id} value={assignment.id}>
                  {assignment.title} ({assignment.subject})
                </option>
              ))}
            </select>
          </div>
          <div className="calendar-legend">
            <div className="legend-item">
              <AlertCircle className="legend-icon due" />
              <span>Due Date</span>
            </div>
            <div className="legend-item">
              <Clock className="legend-icon start" />
              <span>Start Date</span>
            </div>
            <div className="legend-item">
              <MousePointer className="legend-icon work" />
              <span>Work Period</span>
            </div>
          </div>
        </div>
      </div>

      {selectedAssignment && (
        <div className="drag-instructions">
          <MousePointer className="instruction-icon" />
          <span>Drag across dates to select work periods for "{selectedAssignment.title}"</span>
        </div>
      )}

      <div className="calendar-container">
        <div className="calendar-main">
          <Calendar
            value={selectedDate}
            onChange={(date) => setSelectedDate(date as Date)}
            tileContent={tileContent}
            className="react-calendar"
          />
        </div>

        <div className="calendar-sidebar">
          <div className="selected-date-info">
            <h3>Selected Date: {format(selectedDate, 'MMMM dd, yyyy')}</h3>
            {selectedDateAssignments.length === 0 ? (
              <p className="no-events">No assignments for this date</p>
            ) : (
              <div className="date-assignments">
                {selectedDateAssignments.map((assignment) => {
                  const isDue = isSameDay(assignment.dueDate, selectedDate);
                  
                  return (
                    <div
                      key={assignment.id}
                      className={`date-assignment ${assignment.completed ? 'completed' : ''}`}
                    >
                      <div className="assignment-type">
                        <AlertCircle className="type-icon due" />
                        <span>Due</span>
                      </div>
                      <div className="assignment-details">
                        <h4>{assignment.title}</h4>
                        <p>{assignment.subject}</p>
                        <div 
                          className="priority-indicator"
                          style={{ backgroundColor: getPriorityColor(assignment.priority) }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {overdueAssignments.length > 0 && (
            <div className="overdue-section">
              <h3>Overdue Assignments</h3>
              <div className="overdue-list">
                {overdueAssignments.map((assignment) => (
                  <div key={assignment.id} className="overdue-item">
                    <AlertCircle className="overdue-icon" />
                    <div className="overdue-details">
                      <h4>{assignment.title}</h4>
                      <p>Due: {format(assignment.dueDate, 'MMM dd, yyyy')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {upcomingAssignments.length > 0 && (
            <div className="upcoming-section">
              <h3>Upcoming This Week</h3>
              <div className="upcoming-list">
                {upcomingAssignments.map((assignment) => (
                  <div key={assignment.id} className="upcoming-item">
                    <CalendarIcon className="upcoming-icon" />
                    <div className="upcoming-details">
                      <h4>{assignment.title}</h4>
                      <p>Due: {format(assignment.dueDate, 'MMM dd, yyyy')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedAssignment && selectedAssignment.workDateRanges.length > 0 && (
            <div className="work-ranges-section">
              <h3>Work Periods for "{selectedAssignment.title}"</h3>
              <div className="work-ranges-list">
                {selectedAssignment.workDateRanges.map((range) => (
                  <div key={range.id} className="work-range-item">
                    <MousePointer className="work-range-icon" />
                    <div className="work-range-details">
                      <h4>{format(range.startDate, 'MMM dd')} - {format(range.endDate, 'MMM dd, yyyy')}</h4>
                      <p>{Math.ceil((range.endDate.getTime() - range.startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1} days</p>
                    </div>
                    {onRemoveWorkDateRange && (
                      <button
                        className="remove-range-btn"
                        onClick={() => onRemoveWorkDateRange(selectedAssignment.id, range.id)}
                        title="Remove work period"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
