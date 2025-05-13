// src/components/ScreenQueueIndicator.jsx
import { useState, useRef, useEffect } from 'react';
import { PresentationIcon, X, ArrowUp, ArrowDown } from 'lucide-react';

const ScreenQueueIndicator = ({ 
  screenQueue, 
  removeFromScreenQueue, 
  moveInScreenQueue, 
  onStartPresentation 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // If queue is empty, don't display anything
  if (screenQueue.length === 0) {
    return null;
  }

  return (
    <div className="screen-queue-indicator" ref={dropdownRef} style={{ position: 'relative' }}>
      <button 
        className="btn btn-primary"
        onClick={toggleDropdown}
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem',
          padding: '0.5rem 1rem',
          borderRadius: '4px'
        }}
      >
        <PresentationIcon size={16} />
        <span>Slides ({screenQueue.length})</span>
      </button>

      {isOpen && (
        <div 
          className="screen-queue-dropdown"
          style={{ 
            position: 'absolute', 
            top: '100%', 
            right: 0, 
            width: '300px',
            backgroundColor: 'var(--card-background)',
            boxShadow: 'var(--shadow)',
            borderRadius: '4px',
            marginTop: '0.5rem',
            zIndex: 101
          }}
        >
          <div className="dropdown-header" style={{ padding: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
            <h4 style={{ margin: 0 }}>Screen Queue</h4>
          </div>
          
          <div className="dropdown-content" style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {screenQueue.length === 0 ? (
              <p style={{ padding: '0.75rem', textAlign: 'center' }}>Queue is empty</p>
            ) : (
              <div className="screen-queue">
                {screenQueue.map((item, index) => (
                  <div 
                    key={index} 
                    className="screen-queue-item"
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.75rem',
                      borderBottom: index < screenQueue.length - 1 ? '1px solid var(--border-color)' : 'none'
                    }}
                  >
                    <div className="queue-item-info" style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <strong>{item.title}</strong>
                    </div>
                    <div className="queue-controls" style={{ display: 'flex', gap: '0.25rem' }}>
                      <button 
                        className="btn"
                        onClick={() => moveInScreenQueue(index, index - 1)}
                        disabled={index === 0}
                        style={{ padding: '0.25rem' }}
                      >
                        <ArrowUp size={14} />
                      </button>
                      <button 
                        className="btn"
                        onClick={() => moveInScreenQueue(index, index + 1)}
                        disabled={index === screenQueue.length - 1}
                        style={{ padding: '0.25rem' }}
                      >
                        <ArrowDown size={14} />
                      </button>
                      <button 
                        className="btn"
                        onClick={() => removeFromScreenQueue(index)}
                        style={{ padding: '0.25rem' }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="dropdown-footer" style={{ padding: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
            <button 
              className="btn btn-primary"
              onClick={() => {
                onStartPresentation();
                setIsOpen(false);
              }}
              style={{ 
                width: '100%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '0.5rem'
              }}
            >
              <PresentationIcon size={16} />
              Start Presentation
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScreenQueueIndicator;