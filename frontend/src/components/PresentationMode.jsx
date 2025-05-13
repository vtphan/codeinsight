// src/components/PresentationMode.jsx
import { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import CodeBlock from './CodeBlock';

const PresentationMode = ({ items, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Early return if no items
  if (!items || items.length === 0) {
    return (
      <div className="presentation-mode">
        <div className="presentation-header">
          <h2>Presentation Mode</h2>
          <button className="btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        <div className="presentation-content">
          <p>No items to display. Add items to the screen queue first.</p>
        </div>
        <div className="presentation-controls">
          <button className="btn btn-primary" onClick={onClose}>
            Exit Presentation
          </button>
        </div>
      </div>
    );
  }
  
  const currentItem = items[currentIndex];
  
  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev));
  };
  
  const handleNext = () => {
    setCurrentIndex((prev) => (prev < items.length - 1 ? prev + 1 : prev));
  };
  
  return (
    <div className="presentation-mode">
      <div className="presentation-header">
        <h2>Presentation Mode</h2>
        <div>
          <span>{currentIndex + 1} of {items.length}</span>
          <button className="btn" onClick={onClose} style={{ marginLeft: '1rem' }}>
            <X size={24} />
          </button>
        </div>
      </div>
      
      <div className="presentation-content">
        {/* Render content based on item type */}
        <h2 style={{ marginBottom: '1rem', fontSize: '2rem' }}>{currentItem.title}</h2>
        
        {currentItem.type === 'misconception' && (
          <>
            {currentItem.explanation && (
              <div className="presentation-explanation" style={{ marginBottom: '2rem' }}>
                <h3>Explanation:</h3>
                <p style={{ fontSize: '1.5rem' }}>{currentItem.explanation}</p>
              </div>
            )}
            
            <div className="presentation-code" style={{ display: 'flex', gap: '2rem', width: '100%' }}>
              {currentItem.errorCode && (
                <div style={{ flex: 1 }}>
                  <h3>Error Example:</h3>
                  <CodeBlock code={currentItem.errorCode} />
                </div>
              )}
              
              {currentItem.correctCode && (
                <div style={{ flex: 1 }}>
                  <h3>Correct Example:</h3>
                  <CodeBlock code={currentItem.correctCode} />
                </div>
              )}
            </div>
            
            {currentItem.followUp && (
              <div className="presentation-follow-up" style={{ marginTop: '2rem' }}>
                <h3>Follow-up Question:</h3>
                <p style={{ fontSize: '1.5rem' }}>{currentItem.followUp}</p>
              </div>
            )}
          </>
        )}
        
        {(currentItem.type === 'error' || currentItem.type === 'correlation') && (
          <>
            <div className="presentation-description" style={{ marginBottom: '2rem' }}>
              <p style={{ fontSize: '1.5rem' }}>{currentItem.description}</p>
              <p style={{ fontSize: '1.25rem', marginTop: '1rem' }}>
                Occurrence: {currentItem.percentage}
              </p>
            </div>
            
            {currentItem.codeExample && (
              <div className="presentation-code" style={{ width: '100%', maxWidth: '800px' }}>
                <h3>Example Code:</h3>
                <CodeBlock code={currentItem.codeExample} />
              </div>
            )}
          </>
        )}
      </div>
      
      <div className="presentation-controls">
        <button 
          className="btn btn-secondary" 
          onClick={handlePrevious}
          disabled={currentIndex === 0}
        >
          <ChevronLeft size={24} /> Previous
        </button>
        <button 
          className="btn btn-secondary" 
          onClick={handleNext}
          disabled={currentIndex === items.length - 1}
        >
          Next <ChevronRight size={24} />
        </button>
        <button className="btn btn-primary" onClick={onClose}>
          Exit Presentation
        </button>
      </div>
    </div>
  );
};

export default PresentationMode;