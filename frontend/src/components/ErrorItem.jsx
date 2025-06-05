// src/components/ErrorItem.jsx
import { useState } from 'react';
import { ChevronDown, ChevronUp, PlusCircle } from 'lucide-react';
import CodeBlock from './CodeBlock';
import Modal from './Modal';
import StudentSubmission from './StudentSubmission';

const ErrorItem = ({ error, errorNumber, studentSubmissions, submissionTimes }) => {
  const [expanded, setExpanded] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
          <p>{error.description}</p>
          
          {error.example_code && (
            <div className="code-example">
              <h4>Example:</h4>
              <CodeBlock code={error.example_code} />
            </div>
          )}
          
          {error.student_ids && (
            <div className="affected-students">
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
    </div>
  );
};

export default ErrorItem;