// src/components/CorrelationItem.jsx
import { useState } from 'react';
import { ChevronDown, ChevronUp, PlusCircle } from 'lucide-react';
import CodeBlock from './CodeBlock';
import Modal from './Modal';
import StudentSubmission from './StudentSubmission';

const CorrelationItem = ({ correlation, studentSubmissions, submissionTimes }) => {
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
    <div>
      <div>
        <strong>{correlation.correlated_errors.join(' & ')}</strong> - {correlation.correlation_percentage} : 
        <p>{correlation.hypothesis}</p>
      </div>

      <div className="expandable">
        <div className="expandable-header" onClick={toggleExpanded}>
          <div>
            <strong>Example Code</strong>
          </div>
          {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
        
        {expanded && (
          <div className="expandable-content">
            {correlation.example_code && (
              <div className="code-example">
                <CodeBlock code={correlation.example_code} />
              </div>
            )}
          </div>
        )}
      </div>

      {correlation.student_ids && (
        <div className="affected-students" style={{ paddingLeft: '1rem', marginTop: '1rem' }}>
          <b>Affected Students: </b>
          {correlation.student_ids.map((studentId, index) => (
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
              {index < correlation.student_ids.length - 1 ? ', ' : ''}
            </span>
          ))}
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

export default CorrelationItem;