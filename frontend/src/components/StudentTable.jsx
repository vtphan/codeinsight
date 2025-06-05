// src/components/StudentTable.jsx
import { useState, useMemo } from 'react';
import { ArrowUp, ArrowDown, Eye, ChevronDown, ChevronUp } from 'lucide-react';
import StudentSubmission from './StudentSubmission';
import Modal from './Modal';

const StudentTable = ({ students, studentSubmissions, submissionTimes }) => {
  const [sortDirectionLower, setSortDirectionLower] = useState('asc');
  const [sortDirectionUpper, setSortDirectionUpper] = useState('asc');
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLowerTableOpen, setIsLowerTableOpen] = useState(false);
  const [isUpperTableOpen, setIsUpperTableOpen] = useState(false);
  
  // Split students into two groups
  const { lowerPerformingStudents, upperPerformingStudents } = useMemo(() => {
    const lower = [];
    const upper = [];
    
    students.forEach(student => {
      const level = student.performance_level;
      if (level === 'Incorrect') {
        lower.push(student);
      } else if (level === 'Correct') {
        upper.push(student);
      }
      // NotAssessed students are ignored
    });
    
    return {
      lowerPerformingStudents: lower,
      upperPerformingStudents: upper
    };
  }, [students]);
  
  // Handle sorting for lower performing students
  const handleSortLower = () => {
    setSortDirectionLower(sortDirectionLower === 'asc' ? 'desc' : 'asc');
  };
  
  // Handle sorting for upper performing students
  const handleSortUpper = () => {
    setSortDirectionUpper(sortDirectionUpper === 'asc' ? 'desc' : 'asc');
  };
  
  // Sort lower performing students
  const sortedLowerStudents = useMemo(() => {
    return [...lowerPerformingStudents].sort((a, b) => {
      let aValue = a.student_id;
      let bValue = b.student_id;
      
      if (aValue < bValue) return sortDirectionLower === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirectionLower === 'asc' ? 1 : -1;
      return 0;
    });
  }, [lowerPerformingStudents, sortDirectionLower]);
  
  // Sort upper performing students
  const sortedUpperStudents = useMemo(() => {
    return [...upperPerformingStudents].sort((a, b) => {
      let aValue = a.student_id;
      let bValue = b.student_id;
      
      if (aValue < bValue) return sortDirectionUpper === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirectionUpper === 'asc' ? 1 : -1;
      return 0;
    });
  }, [upperPerformingStudents, sortDirectionUpper]);
  
  // Helper function to get CSS class based on performance level
  const getPerformanceClass = (level) => {
    switch (level) {
      case 'Incorrect':
        return 'performance-poor';
      case 'Correct':
        return 'performance-strong';
      default:
        return '';
    }
  };
  
  // Handle view button click
  const handleViewClick = (studentId) => {
    setSelectedStudentId(studentId);
    setIsModalOpen(true);
  };
  
  // Handle closing the modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };
  
  // Toggle tables
  const toggleLowerTable = () => {
    setIsLowerTableOpen(!isLowerTableOpen);
  };
  
  const toggleUpperTable = () => {
    setIsUpperTableOpen(!isUpperTableOpen);
  };

  return (
    <div className="student-tables">
      {/* Two-column layout for tables */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        {/* Lower performing students table */}
        <div className="student-table expandable">
          <div 
            className="expandable-header" 
            style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              padding: '0.75rem',
              backgroundColor: '#f8fafc',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              cursor: 'pointer',
              marginBottom: isLowerTableOpen ? '0.5rem' : '0'
            }}
            onClick={toggleLowerTable}
          >
            <h4 style={{ margin: 0, color: 'var(--warning-color)' }}>
              Incorrect ({lowerPerformingStudents.length} students)
            </h4>
            {isLowerTableOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
          
          {isLowerTableOpen && (
            <div className="table-container" style={{ overflowX: 'auto', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th 
                      onClick={handleSortLower}
                      style={{ 
                        cursor: 'pointer', 
                        padding: '0.75rem',
                        backgroundColor: '#f1f5f9',
                        borderBottom: '2px solid var(--border-color)',
                        textAlign: 'left'
                      }}
                    >
                      Student ID {sortDirectionLower === 'asc' ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                    </th>
                    <th 
                      style={{ 
                        padding: '0.75rem',
                        backgroundColor: '#f1f5f9',
                        borderBottom: '2px solid var(--border-color)',
                        textAlign: 'left'
                      }}
                    >
                      Performance
                    </th>
                    <th 
                      style={{ 
                        padding: '0.75rem',
                        backgroundColor: '#f1f5f9',
                        borderBottom: '2px solid var(--border-color)',
                        textAlign: 'center'
                      }}
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedLowerStudents.map((student) => (
                    <tr key={student.student_id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '0.75rem' }}>{student.student_id}</td>
                      <td 
                        className={getPerformanceClass(student.performance_level)}
                        style={{ padding: '0.75rem', fontWeight: '500' }}
                      >
                        {student.performance_level}
                      </td>
                      <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                        <button 
                          className="btn"
                          onClick={() => handleViewClick(student.student_id)}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                        >
                          <Eye size={16} />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Upper performing students table */}
        <div className="student-table expandable">
          <div 
            className="expandable-header" 
            style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              padding: '0.75rem',
              backgroundColor: '#f8fafc',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              cursor: 'pointer',
              marginBottom: isUpperTableOpen ? '0.5rem' : '0'
            }}
            onClick={toggleUpperTable}
          >
            <h4 style={{ margin: 0, color: 'var(--success-color)' }}>
              Correct ({upperPerformingStudents.length} students)
            </h4>
            {isUpperTableOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
          
          {isUpperTableOpen && (
            <div className="table-container" style={{ overflowX: 'auto', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th 
                      onClick={handleSortUpper}
                      style={{ 
                        cursor: 'pointer', 
                        padding: '0.75rem',
                        backgroundColor: '#f1f5f9',
                        borderBottom: '2px solid var(--border-color)',
                        textAlign: 'left'
                      }}
                    >
                      Student ID {sortDirectionUpper === 'asc' ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                    </th>
                    <th 
                      style={{ 
                        padding: '0.75rem',
                        backgroundColor: '#f1f5f9',
                        borderBottom: '2px solid var(--border-color)',
                        textAlign: 'left'
                      }}
                    >
                      Performance
                    </th>
                    <th 
                      style={{ 
                        padding: '0.75rem',
                        backgroundColor: '#f1f5f9',
                        borderBottom: '2px solid var(--border-color)',
                        textAlign: 'center'
                      }}
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedUpperStudents.map((student) => (
                    <tr key={student.student_id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '0.75rem' }}>{student.student_id}</td>
                      <td 
                        className={getPerformanceClass(student.performance_level)}
                        style={{ padding: '0.75rem', fontWeight: '500' }}
                      >
                        {student.performance_level}
                      </td>
                      <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                        <button 
                          className="btn"
                          onClick={() => handleViewClick(student.student_id)}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                        >
                          <Eye size={16} />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      
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

export default StudentTable;