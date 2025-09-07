import React, { useState } from 'react';
import { Assignment } from '../types/assignment';
import { ArrowLeft, Save, Calendar, Clock } from 'lucide-react';
import './AssignmentForm.css';

interface AssignmentFormProps {
  onAddAssignment: (assignment: Omit<Assignment, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onBack: () => void;
}

const AssignmentForm: React.FC<AssignmentFormProps> = ({ onAddAssignment, onBack }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    dueDate: '',
    startDate: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    completed: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }

    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required';
    } else {
      const dueDate = new Date(formData.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (dueDate < today) {
        newErrors.dueDate = 'Due date cannot be in the past';
      }
    }

    if (formData.startDate) {
      const startDate = new Date(formData.startDate);
      const dueDate = new Date(formData.dueDate);
      
      if (startDate >= dueDate) {
        newErrors.startDate = 'Start date must be before due date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const assignment: Omit<Assignment, 'id' | 'createdAt' | 'updatedAt'> = {
      title: formData.title.trim(),
      description: formData.description.trim() || undefined,
      subject: formData.subject.trim(),
      dueDate: new Date(formData.dueDate),
      startDate: formData.startDate ? new Date(formData.startDate) : undefined,
      priority: formData.priority,
      completed: formData.completed,
      workDateRanges: []
    };

    onAddAssignment(assignment);
    onBack();
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const getMinDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  const getMaxStartDate = () => {
    if (!formData.dueDate) return '';
    const dueDate = new Date(formData.dueDate);
    dueDate.setDate(dueDate.getDate() - 1);
    return dueDate.toISOString().split('T')[0];
  };

  return (
    <div className="assignment-form">
      <div className="form-header">
        <button className="back-button" onClick={onBack}>
          <ArrowLeft className="back-icon" />
          Back to Assignments
        </button>
        <h2>Add New Assignment</h2>
      </div>

      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label htmlFor="title" className="form-label">
            Assignment Title *
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            className={`form-input ${errors.title ? 'error' : ''}`}
            placeholder="Enter assignment title"
          />
          {errors.title && <span className="error-message">{errors.title}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="subject" className="form-label">
            Subject *
          </label>
          <input
            type="text"
            id="subject"
            value={formData.subject}
            onChange={(e) => handleInputChange('subject', e.target.value)}
            className={`form-input ${errors.subject ? 'error' : ''}`}
            placeholder="e.g., Mathematics, Science, English"
          />
          {errors.subject && <span className="error-message">{errors.subject}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="description" className="form-label">
            Description
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            className="form-textarea"
            placeholder="Optional description or notes"
            rows={3}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="dueDate" className="form-label">
              Due Date *
            </label>
            <div className="date-input-container">
              <Calendar className="date-icon" />
              <input
                type="date"
                id="dueDate"
                value={formData.dueDate}
                onChange={(e) => handleInputChange('dueDate', e.target.value)}
                className={`form-input ${errors.dueDate ? 'error' : ''}`}
                min={getMinDate()}
              />
            </div>
            {errors.dueDate && <span className="error-message">{errors.dueDate}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="startDate" className="form-label">
              Start Date
            </label>
            <div className="date-input-container">
              <Clock className="date-icon" />
              <input
                type="date"
                id="startDate"
                value={formData.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                className={`form-input ${errors.startDate ? 'error' : ''}`}
                min={getMinDate()}
                max={getMaxStartDate()}
              />
            </div>
            {errors.startDate && <span className="error-message">{errors.startDate}</span>}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="priority" className="form-label">
            Priority
          </label>
          <select
            id="priority"
            value={formData.priority}
            onChange={(e) => handleInputChange('priority', e.target.value)}
            className="form-select"
          >
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
          </select>
        </div>

        <div className="form-actions">
          <button type="button" onClick={onBack} className="cancel-button">
            Cancel
          </button>
          <button type="submit" className="submit-button">
            <Save className="submit-icon" />
            Add Assignment
          </button>
        </div>
      </form>
    </div>
  );
};

export default AssignmentForm;
