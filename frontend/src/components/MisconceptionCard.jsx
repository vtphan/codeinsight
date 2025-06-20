// src/components/MisconceptionCard.jsx
import { useState } from 'react';
import { ChevronDown, ChevronUp, PlusCircle, Edit2, Check } from 'lucide-react';
import CodeBlock from './CodeBlock';
import Modal from './Modal';
import StudentSubmission from './StudentSubmission';
import EditableCodeBlock from './EditableCodeBlock';
import { useEffect } from 'react';
import GroupFeedback from './GroupFeedback';
import GroupFeedbackModal from './GroupFeedbackModal';

const MisconceptionCard = ({ 
  misconception, 
  addToScreenQueue, 
  expanded: initialExpanded = false, 
  isRespond = false,
  studentSubmissions,
  submissionTimes
}) => {
  const storageKey = `misconception-edit-${misconception.misconception}`;
  const saved = JSON.parse(localStorage.getItem(storageKey) || '{}');
  const [expanded, setExpanded] = useState(initialExpanded);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGroupFeedbackModalOpen, setIsGroupFeedbackModalOpen] = useState(false);

  const [editableExplanation, setEditableExplanation] = useState(saved.explanation || misconception.suggested_explanation_for_students || '');
  const [editableErrorCode, setEditableErrorCode] = useState(
    saved.errorCode ||
    (Array.isArray(misconception.example_code_error)
      ? misconception.example_code_error.join('\n')
      : misconception.example_code_error || '')
  );
  const [editableCorrectCode, setEditableCorrectCode] = useState(
    saved.correctCode ||
    (Array.isArray(misconception.correct_code_example)
      ? misconception.correct_code_example.join('\n')
      : misconception.correct_code_example || '')
  );
  const [editableFollowUp, setEditableFollowUp] = useState(saved.followUp || misconception.follow_up_question || '');
  
  const [isEditingExplanation, setIsEditingExplanation] = useState(false);
  const [isEditingErrorCode, setIsEditingErrorCode] = useState(false);
  const [isEditingCorrectCode, setIsEditingCorrectCode] = useState(false);
  const [isEditingFollowUp, setIsEditingFollowUp] = useState(false);

  const toggleExpanded = () => setExpanded(!expanded);

  const handleAddToScreen = () => {
    addToScreenQueue({
      type: 'misconception',
      title: misconception.misconception,
      explanation: editableExplanation,
      errorCode: editableErrorCode,
      correctCode: editableCorrectCode,
      followUp: editableFollowUp,
      percentage: misconception.occurrence_percentage,
    });
  };

  const resetDraft = () => {
    localStorage.removeItem(storageKey);
    
    setEditableExplanation(misconception.suggested_explanation_for_students || '');
    setEditableErrorCode(
      Array.isArray(misconception.example_code_error)
        ? misconception.example_code_error.join('\n')
        : misconception.example_code_error || ''
    );
    setEditableCorrectCode(
      Array.isArray(misconception.correct_code_example)
        ? misconception.correct_code_example.join('\n')
        : misconception.correct_code_example || ''
    );
    setEditableFollowUp(misconception.follow_up_question || '');
  };
  
  const handleStudentClick = (studentId) => {
    setSelectedStudentId(studentId);
    setIsModalOpen(true);
  };

  const handleOpenGroupFeedbackModal = () => {
    setIsGroupFeedbackModalOpen(true);
  };

  const handleCloseGroupFeedbackModal = () => {
    setIsGroupFeedbackModalOpen(false);
  };

  const snapshotMap = studentSubmissions?.entries
  ? Object.fromEntries(
      studentSubmissions.entries.map(entry => [entry.student_id, entry])
    )
  : {};

  const handleCloseModal = () => setIsModalOpen(false);

  useEffect(() => {
    const data = {
      explanation: editableExplanation,
      errorCode: editableErrorCode,
      correctCode: editableCorrectCode,
      followUp: editableFollowUp
    };
    localStorage.setItem(storageKey, JSON.stringify(data));
  }, [storageKey, editableExplanation, editableErrorCode, editableCorrectCode, editableFollowUp]);
  
  return (
    <div className={`${isRespond ? 'card' : 'expandable'}`}>
      {!isRespond ? (
        <div className="expandable-header" onClick={toggleExpanded}>
          <div>
            <strong>{misconception.misconception}</strong> - {misconception.occurrence_percentage}
          </div>
          {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      ) : (
        <h3 className="section-title">{misconception.misconception} - {misconception.occurrence_percentage}</h3>
      )}

      {(expanded || isRespond) && (
        <div className={isRespond ? '' : 'expandable-content'}>
          {misconception.explanation_diagnostic && (
            <div className="diagnostic">
              <p>{misconception.explanation_diagnostic}</p>
            </div>
          )}

          {misconception.suggested_explanation_for_students && (
            <div className="explanation">
              <h4 style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>Suggested Explanation:</h4>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                {isEditingExplanation ? (
                  <textarea
                    value={editableExplanation}
                    onChange={(e) => setEditableExplanation(e.target.value)}
                    className="editable-textarea"
                    style={{ flex: 1, minHeight: '100px', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', fontFamily: 'inherit', fontSize: 'inherit' }}
                  />
                ) : (
                  <p style={{ flex: 1, margin: 0 }}>{editableExplanation}</p>
                )}
                <button 
                  onClick={() => setIsEditingExplanation(!isEditingExplanation)} 
                  className="btn-icon"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary-color)', flexShrink: 0 }}
                >
                  {isEditingExplanation ? <Check size={16} /> : <Edit2 size={16} />}
                </button>
              </div>
            </div>
          )}

          <div className="code-examples" style={{marginTop: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap'}}>
            {misconception.example_code_error && (
              <div className="error-code" style={{flex: '1', minWidth: '300px'}}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <h4 style={{margin: 0}}>Example of Error:</h4>
                  <button 
                    onClick={() => setIsEditingErrorCode(!isEditingErrorCode)} 
                    className="btn-icon"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary-color)' }}
                  >
                    {isEditingErrorCode ? <Check size={16} /> : <Edit2 size={16} />}
                  </button>
                </div>
                {isEditingErrorCode ? (
                    <EditableCodeBlock
                      code={editableErrorCode}
                      onChange={setEditableErrorCode}
                    />
                ) : (
                  <CodeBlock code={editableErrorCode} />
                )}
              </div>
            )}

            {misconception.correct_code_example && (
              <div className="correct-code" style={{flex: '1', minWidth: '300px'}}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <h4 style={{margin: 0}}>Correct Example:</h4>
                  <button 
                    onClick={() => setIsEditingCorrectCode(!isEditingCorrectCode)} 
                    className="btn-icon"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary-color)' }}
                  >
                    {isEditingCorrectCode ? <Check size={16} /> : <Edit2 size={16} />}
                  </button>
                </div>
                {isEditingCorrectCode ? (
                  <EditableCodeBlock
                    code={editableCorrectCode}
                    onChange={setEditableCorrectCode}
                  />
                ) : (
                  <CodeBlock code={editableCorrectCode} />
                )}
              </div>
            )}
          </div>

          {misconception.follow_up_question && (
            <div className="follow-up">
              <h4 style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>Follow-up Question:</h4>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                {isEditingFollowUp ? (
                  <textarea
                    value={editableFollowUp}
                    onChange={(e) => setEditableFollowUp(e.target.value)}
                    className="editable-textarea"
                    style={{ flex: 1, minHeight: '60px', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', fontFamily: 'inherit', fontSize: 'inherit' }}
                  />
                ) : (
                  <p style={{ flex: 1, margin: 0 }}>{editableFollowUp}</p>
                )}
                <button 
                  onClick={() => setIsEditingFollowUp(!isEditingFollowUp)} 
                  className="btn-icon"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary-color)', flexShrink: 0 }}
                >
                  {isEditingFollowUp ? <Check size={16} /> : <Edit2 size={16} />}
                </button>
              </div>
            </div>
          )}

          {/* Buttons in same line */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
            {misconception.student_ids && (
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
          {misconception.student_ids && (
            <div className="affected-students" style={{marginTop: '1rem'}}>
              <b>Affected Students: </b>
                {misconception.student_ids.map((studentId, index) => (
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
                    {index < misconception.student_ids.length - 1 ? ', ' : ''}
                  </span>
                ))}
            </div>
          )}
        </div>
      )}

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
        misconception={misconception}
        snapshotMap={snapshotMap}
      />
    </div>
  );
};

export default MisconceptionCard;
