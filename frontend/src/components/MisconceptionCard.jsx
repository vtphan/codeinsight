// src/components/MisconceptionCard.jsx
import { useState } from 'react';
import { ChevronDown, ChevronUp, PlusCircle, Edit2, Check } from 'lucide-react';
import CodeBlock from './CodeBlock';
import Modal from './Modal';
import StudentSubmission from './StudentSubmission';
import EditableCodeBlock from './EditableCodeBlock';
import { useEffect } from 'react';

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
    // localStorage.removeItem(storageKey); // clear saved draft
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
              <h4>Diagnostic:</h4>
              <p>{misconception.explanation_diagnostic}</p>
            </div>
          )}

          {misconception.suggested_explanation_for_students && (
            <div className="explanation">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                <h4>Suggested Explanation for Students:</h4>
                <button 
                  onClick={() => setIsEditingExplanation(!isEditingExplanation)} 
                  className="btn-icon"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary-color)' }}
                >
                  {isEditingExplanation ? <Check size={16} /> : <Edit2 size={16} />}
                </button>
              </div>
              {isEditingExplanation ? (
                <textarea
                  value={editableExplanation}
                  onChange={(e) => setEditableExplanation(e.target.value)}
                  className="editable-textarea"
                  style={{ width: '100%', minHeight: '100px', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', fontFamily: 'inherit', fontSize: 'inherit', marginTop: '0.5rem' }}
                />
              ) : (
                <p>{editableExplanation}</p>
              )}
            </div>
          )}

          <div className="code-examples" style={{marginTop: '1rem'}}>
            {misconception.example_code_error && (
              <div className="error-code">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                  <h4>Example of Error:</h4>
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
              <div className="correct-code">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                  <h4>Correct Example:</h4>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                <h4>Follow-up Question:</h4>
                <button 
                  onClick={() => setIsEditingFollowUp(!isEditingFollowUp)} 
                  className="btn-icon"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary-color)' }}
                >
                  {isEditingFollowUp ? <Check size={16} /> : <Edit2 size={16} />}
                </button>
              </div>
              {isEditingFollowUp ? (
                <textarea
                  value={editableFollowUp}
                  onChange={(e) => setEditableFollowUp(e.target.value)}
                  className="editable-textarea"
                  style={{ width: '100%', minHeight: '60px', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', fontFamily: 'inherit', fontSize: 'inherit', marginTop: '0.5rem' }}
                />
              ) : (
                <p>{editableFollowUp}</p>
              )}
            </div>
          )}

          {misconception.student_ids && (
            <div className="affected-students" style={{marginTop: '1rem'}}>
              <b>Group intervention: </b>
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

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '1rem' }}>
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
    </div>
  );
};

export default MisconceptionCard;
