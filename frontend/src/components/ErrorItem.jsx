// src/components/ErrorItem.jsx
import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, PlusCircle, Edit2, Check } from 'lucide-react';
import CodeBlock from './CodeBlock';
import Modal from './Modal';
import StudentSubmission from './StudentSubmission';
import GroupFeedback from './GroupFeedback';
import GroupFeedbackModal from './GroupFeedbackModal';
import EditableCodeBlock from './EditableCodeBlock';

const ErrorItem = ({ error, errorNumber, studentSubmissions, submissionTimes, addToScreenQueue }) => {
  const storageKey = `error-edit-${error.category}-${errorNumber}`;
  const saved = JSON.parse(localStorage.getItem(storageKey) || '{}');
  
  const [expanded, setExpanded] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGroupFeedbackModalOpen, setIsGroupFeedbackModalOpen] = useState(false);

  // Editable state similar to MisconceptionCard
  const [editableDescription, setEditableDescription] = useState(saved.description || error.description || '');
  const [editableExampleCode, setEditableExampleCode] = useState(
    saved.exampleCode ||
    (Array.isArray(error.example_code)
      ? error.example_code.join('\n')
      : error.example_code || '')
  );
  
  // Edit mode states
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [isEditingExampleCode, setIsEditingExampleCode] = useState(false);

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  const handleStudentClick = (studentId) => {
    setSelectedStudentId(studentId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleOpenGroupFeedbackModal = () => {
    setIsGroupFeedbackModalOpen(true);
  };

  const handleCloseGroupFeedbackModal = () => {
    setIsGroupFeedbackModalOpen(false);
  };

  const handleAddToScreen = () => {
    addToScreenQueue({
      type: 'error',
      title: error.category,
      description: editableDescription,
      codeExample: editableExampleCode,
      // percentage: error.occurrence_percentage,
    });
  };

  const resetDraft = () => {
    localStorage.removeItem(storageKey);
    
    setEditableDescription(error.description || '');
    setEditableExampleCode(
      Array.isArray(error.example_code)
        ? error.example_code.join('\n')
        : error.example_code || ''
    );
  };

  // Create snapshot map for GroupFeedback component
  const snapshotMap = studentSubmissions?.entries
    ? Object.fromEntries(
        studentSubmissions.entries.map(entry => [entry.student_id, entry])
      )
    : {};

  // Save to localStorage when editable content changes
  useEffect(() => {
    const data = {
      description: editableDescription,
      exampleCode: editableExampleCode,
    };
    localStorage.setItem(storageKey, JSON.stringify(data));
  }, [storageKey, editableDescription, editableExampleCode]);

  return (
    <div className="expandable">
      <div className="expandable-header" onClick={toggleExpanded}>
        <div>
          <strong>{errorNumber}: {error.category}</strong> - {error.occurrence_percentage}
        </div>
        {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </div>
      
      {expanded && (
        <div className="expandable-content">
          <div className="description">
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
              {isEditingDescription ? (
                <textarea
                  value={editableDescription}
                  onChange={(e) => setEditableDescription(e.target.value)}
                  className="editable-textarea"
                  style={{ flex: 1, minHeight: '80px', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', fontFamily: 'inherit', fontSize: 'inherit' }}
                />
              ) : (
                <p style={{ flex: 1, margin: 0 }}>{editableDescription}</p>
              )}
              <button 
                onClick={() => setIsEditingDescription(!isEditingDescription)} 
                className="btn-icon"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary-color)', flexShrink: 0 }}
              >
                {isEditingDescription ? <Check size={16} /> : <Edit2 size={16} />}
              </button>
            </div>
          </div>
          
          {error.example_code && (
            <div className="code-example">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                <h4>Example:</h4>
                <button 
                  onClick={() => setIsEditingExampleCode(!isEditingExampleCode)} 
                  className="btn-icon"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary-color)' }}
                >
                  {isEditingExampleCode ? <Check size={16} /> : <Edit2 size={16} />}
                </button>
              </div>
              {isEditingExampleCode ? (
                <EditableCodeBlock
                  code={editableExampleCode}
                  onChange={setEditableExampleCode}
                />
              ) : (
                <CodeBlock code={editableExampleCode} />
              )}
            </div>
          )}
          
          {/* Buttons in same line */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
            {error.student_ids && (
              <GroupFeedback onOpenModal={handleOpenGroupFeedbackModal} />
            )}
            <button 
              className="btn btn-primary" 
              onClick={handleAddToScreen}
            >
              Add to Screen
            </button>
            <button className="btn btn-secondary" onClick={resetDraft}>
              Reset
            </button>
          </div>

          {/* Affected Students underneath buttons */}
          {error.student_ids && (
            <div className="affected-students" style={{marginTop: '1rem'}}>
              <b>Affected Students: </b>
                {error.student_ids.map((studentId, index) => (
                  <span key={studentId}>
                    <a 
                      href="#" 
                      onClick={(e) => {
                        e.preventDefault();
                        handleStudentClick(studentId);
                      }}
                      style={{ color: 'var(--primary-color)', textDecoration: 'underline', cursor: 'pointer' }}
                    >
                      {studentId}
                    </a>
                    {index < error.student_ids.length - 1 ? ', ' : ''}
                  </span>
                ))}
            </div>
          )}
        </div>
      )}

      {/* Modal for viewing student submission */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal}
        title={`Student #${selectedStudentId} Code`}
      >
        {selectedStudentId && (
          <StudentSubmission 
            studentSubmissions={studentSubmissions}
            submissionTimes={submissionTimes}
            studentId={selectedStudentId}
          />
        )}
      </Modal>

      {/* Group Feedback Modal */}
      <GroupFeedbackModal
        isOpen={isGroupFeedbackModalOpen}
        onClose={handleCloseGroupFeedbackModal}
        misconception={error}
        snapshotMap={snapshotMap}
      />
    </div>
  );
};

export default ErrorItem;