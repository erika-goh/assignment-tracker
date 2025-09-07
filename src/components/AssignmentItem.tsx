import React, { useState } from 'react';
import { Assignment } from '../types/assignment';
import { Check, Trash2, Edit3, Calendar, Clock, AlertCircle } from 'lucide-react';
import { format, isBefore, addDays } from 'date-fns';
import './AssignmentItem.css';

interface AssignmentItemProps {
  assignment: Assignment;
  onToggleCompletion: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Assignment>) => void;
}

const AssignmentItem: React.FC<AssignmentItemProps> = ({
  assignment,
  onToggleCompletion,
  onDelete,
  onUpdate
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: assignment.title,
    description: assignment.description || '',
    subject: assignment.subject,
    priority: assignment.priority
  });

  const isOverdue = !assignment.completed && isBefore(assignment.dueDate, new Date());
  const isDueSoon = !assignment.completed && isBefore(assignment.dueDate, addDays(new Date(), 3));
  const isStarted = assignment.startDate && isBefore(assignment.startDate, new Date());

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertCircle className="priority-icon high" />;
      case 'medium': return <Clock className="priority-icon medium" />;
      case 'low': return <Calendar className="priority-icon low" />;
      default: return null;
    }
  };

  const handleSave = () => {
    onUpdate(assignment.id, editForm);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditForm({
      title: assignment.title,
      description: assignment.description || '',
      subject: assignment.subject,
      priority: assignment.priority
    });
    setIsEditing(false);
  };

  return (
    <div className={`assignment-item ${assignment.completed ? 'completed' : ''} ${isOverdue ? 'overdue' : ''} ${isDueSoon ? 'due-soon' : ''}`}>
      <div className="assignment-header">
        <div className="assignment-checkbox">
          <button
            className={`checkbox ${assignment.completed ? 'checked' : ''}`}
            onClick={() => onToggleCompletion(assignment.id)}
            aria-label={assignment.completed ? 'Mark as incomplete' : 'Mark as complete'}
          >
            {assignment.completed && <Check className="check-icon" />}
          </button>
        </div>

        <div className="assignment-content">
          {isEditing ? (
            <div className="edit-form">
              <input
                type="text"
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                className="edit-input"
                placeholder="Assignment title"
              />
              <input
                type="text"
                value={editForm.subject}
                onChange={(e) => setEditForm({ ...editForm, subject: e.target.value })}
                className="edit-input"
                placeholder="Subject"
              />
              <select
                value={editForm.priority}
                onChange={(e) => setEditForm({ ...editForm, priority: e.target.value as 'low' | 'medium' | 'high' })}
                className="edit-select"
                title="Select priority level"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
              <div className="edit-actions">
                <button onClick={handleSave} className="save-btn">Save</button>
                <button onClick={handleCancel} className="cancel-btn">Cancel</button>
              </div>
            </div>
          ) : (
            <>
              <h3 className="assignment-title">{assignment.title}</h3>
              <div className="assignment-meta">
                <span className="subject">{assignment.subject}</span>
                <div className="priority-badge" style={{ backgroundColor: getPriorityColor(assignment.priority) }}>
                  {getPriorityIcon(assignment.priority)}
                  <span>{assignment.priority}</span>
                </div>
              </div>
              {assignment.description && (
                <p className="assignment-description">{assignment.description}</p>
              )}
            </>
          )}
        </div>

        <div className="assignment-actions">
          {!isEditing && (
            <>
              <button
                className="action-btn edit-btn"
                onClick={() => setIsEditing(true)}
                title="Edit assignment"
              >
                <Edit3 />
              </button>
              <button
                className="action-btn delete-btn"
                onClick={() => onDelete(assignment.id)}
                title="Delete assignment"
              >
                <Trash2 />
              </button>
            </>
          )}
        </div>
      </div>

      <div className="assignment-footer">
        <div className="due-date">
          <Calendar className="date-icon" />
          <span className={`date-text ${isOverdue ? 'overdue' : ''} ${isDueSoon ? 'due-soon' : ''}`}>
            Due: {format(assignment.dueDate, 'MMM dd, yyyy')}
          </span>
          {isOverdue && <span className="overdue-badge">Overdue</span>}
          {isDueSoon && !isOverdue && <span className="due-soon-badge">Due Soon</span>}
        </div>
        
        {assignment.startDate && (
          <div className="start-date">
            <Clock className="date-icon" />
            <span className="date-text">
              Start: {format(assignment.startDate, 'MMM dd, yyyy')}
            </span>
            {isStarted && <span className="started-badge">Started</span>}
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignmentItem;
