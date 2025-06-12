import React from 'react';

const ViewToggle = ({ view, onViewChange }) => {
  return (
    <div style={{ 
      display: 'flex',
      justifyContent: 'flex-end',
      marginBottom: '0rem',
      gap: '0.25rem',
      boxShadow: '0 0 10px 0 rgba(0, 0, 0, 0.1)'
    }}>
      <button
        onClick={() => onViewChange('bar')}
        style={{
          padding: '0.25rem 0.75rem',
          border: '1px solid var(--border-color)',
          borderRadius: '4px',
          backgroundColor: view === 'bar' ? 'var(--primary-color)' : 'white',
          color: view === 'bar' ? 'white' : 'var(--text-color)',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          fontSize: '0.875rem'
        }}
      >
        Bar
      </button>
      <button
        onClick={() => onViewChange('tiles')}
        style={{
          padding: '0.25rem 0.75rem',
          border: '1px solid var(--border-color)',
          borderRadius: '4px',
          backgroundColor: view === 'tiles' ? 'var(--primary-color)' : 'white',
          color: view === 'tiles' ? 'white' : 'var(--text-color)',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          fontSize: '0.875rem'
        }}
      >
        Tiles
      </button>
    </div>
  );
};

export default ViewToggle; 