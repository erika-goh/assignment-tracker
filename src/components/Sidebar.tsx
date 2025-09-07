import React from 'react';
import { List, Calendar, Plus, CheckCircle, Circle } from 'lucide-react';
import './Sidebar.css';

interface SidebarProps {
  currentView: 'list' | 'calendar' | 'add';
  setCurrentView: (view: 'list' | 'calendar' | 'add') => void;
  assignmentCount: number;
  completedCount: number;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  currentView, 
  setCurrentView, 
  assignmentCount, 
  completedCount 
}) => {
  const menuItems = [
    { id: 'list', label: 'Assignments', icon: List },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'add', label: 'Add Assignment', icon: Plus }
  ] as const;

  const completionRate = assignmentCount > 0 ? (completedCount / assignmentCount) * 100 : 0;

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1 className="sidebar-title">Assignment Tracker</h1>
        <div className="stats">
          <div className="stat-item">
            <Circle className="stat-icon" />
            <span>{assignmentCount} Total</span>
          </div>
          <div className="stat-item">
            <CheckCircle className="stat-icon completed" />
            <span>{completedCount} Done</span>
          </div>
          <div className="completion-rate">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${completionRate}%` }}
              />
            </div>
            <span className="progress-text">{Math.round(completionRate)}% Complete</span>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={`nav-item ${currentView === id ? 'active' : ''}`}
            onClick={() => setCurrentView(id)}
          >
            <Icon className="nav-icon" />
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
