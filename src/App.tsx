import React, { useState } from 'react';
import { useAssignments } from './hooks/useAssignments';
import Sidebar from './components/Sidebar';
import AssignmentList from './components/AssignmentList';
import Calendar from './components/Calendar';
import AssignmentForm from './components/AssignmentForm';
import './App.css';

type View = 'list' | 'calendar' | 'add';

function App() {
  const [currentView, setCurrentView] = useState<View>('list');
  const { assignments, allAssignments, loading, error, filters, setFilters, addAssignment, updateAssignment, deleteAssignment, toggleCompletion, addWorkDateRange, removeWorkDateRange } = useAssignments();

  return (
    <div className="app">
      <Sidebar 
        currentView={currentView} 
        setCurrentView={setCurrentView}
        assignmentCount={allAssignments.length}
        completedCount={allAssignments.filter(a => a.completed).length}
      />
      <main className="main-content">
        {loading && (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading assignments...</p>
          </div>
        )}
        
        {error && (
          <div className="error-state">
            <div className="error-icon">⚠️</div>
            <h3>Error Loading Data</h3>
            <p>{error}</p>
            <button onClick={() => window.location.reload()} className="retry-button">
              Retry
            </button>
          </div>
        )}
        
        {!loading && !error && (
          <>
            {currentView === 'list' && (
              <AssignmentList
                assignments={assignments}
                filters={filters}
                setFilters={setFilters}
                onToggleCompletion={toggleCompletion}
                onDelete={deleteAssignment}
                onUpdate={updateAssignment}
              />
            )}
            {currentView === 'calendar' && (
              <Calendar 
                assignments={allAssignments} 
                onAddWorkDateRange={addWorkDateRange}
                onRemoveWorkDateRange={removeWorkDateRange}
              />
            )}
            {currentView === 'add' && (
              <AssignmentForm onAddAssignment={addAssignment} onBack={() => setCurrentView('list')} />
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;
