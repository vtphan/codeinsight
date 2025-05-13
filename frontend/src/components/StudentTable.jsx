// src/components/StudentTable.jsx
import { useState, useMemo } from 'react';
import { ArrowUp, ArrowDown, Eye, ChevronDown, ChevronUp } from 'lucide-react';
import StudentSubmission from './StudentSubmission';
import Modal from './Modal';

const StudentTable = ({ students, studentSubmissions, submissionTimes }) => {
  const [sortFieldLower, setSortFieldLower] = useState('performance_level');
  const [sortDirectionLower, setSortDirectionLower] = useState('asc');
  const [sortFieldUpper, setSortFieldUpper] = useState('performance_level');
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
      const level = student.performance_level.toLowerCase();
      if (level.includes('poor') || level.includes('struggling')) {
        lower.push(student);
      } else if (level.includes('good') || level.includes('strong')) {
        upper.push(student);
      }
    });
    
    return {
      lowerPerformingStudents: lower,
      upperPerformingStudents: upper
    };
  }, [students]);
  
  // Handle sorting for lower performing students
  const handleSortLower = (field) => {
    if (field === sortFieldLower) {
      setSortDirectionLower(sortDirectionLower === 'asc' ? 'desc' : 'asc');
    } else {
      setSortFieldLower(field);
      setSortDirectionLower('asc');
    }
  };
  
  // Handle sorting for upper performing students
  const handleSortUpper = (field) => {
    if (field === sortFieldUpper) {
      setSortDirectionUpper(sortDirectionUpper === 'asc' ? 'desc' : 'asc');
    } else {
      setSortFieldUpper(field);
      setSortDirectionUpper('asc');
    }
  };
  
  // Sort lower performing students
  const sortedLowerStudents = useMemo(() => {
    return [...lowerPerformingStudents].sort((a, b) => {
      let aValue = a[sortFieldLower];
      let bValue = b[sortFieldLower];
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (aValue < bValue) return sortDirectionLower === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirectionLower === 'asc' ? 1 : -1;
      return 0;
    });
  }, [lowerPerformingStudents, sortFieldLower, sortDirectionLower]);
  
  // Sort upper performing students
  const sortedUpperStudents = useMemo(() => {
    return [...upperPerformingStudents].sort((a, b) => {
      let aValue = a[sortFieldUpper];
      let bValue = b[sortFieldUpper];
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (aValue < bValue) return sortDirectionUpper === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirectionUpper === 'asc' ? 1 : -1;
      return 0;
    });
  }, [upperPerformingStudents, sortFieldUpper, sortDirectionUpper]);
  
  // Helper function to get CSS class based on performance level
  const getPerformanceClass = (level) => {
    const levelLower = level.toLowerCase();
    if (levelLower.includes('poor')) return 'performance-poor';
    if (levelLower.includes('struggling')) return 'performance-struggling';
    if (levelLower.includes('good')) return 'performance-good-progress';
    if (levelLower.includes('strong')) return 'performance-strong';
    return '';
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
              Poor + Struggling ({lowerPerformingStudents.length} students)
            </h4>
            {isLowerTableOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
          
          {isLowerTableOpen && (
            <div className="table-container" style={{ overflowX: 'auto', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th 
                      onClick={() => handleSortLower('student_id')}
                      style={{ 
                        cursor: 'pointer', 
                        padding: '0.75rem',
                        backgroundColor: '#f1f5f9',
                        borderBottom: '2px solid var(--border-color)',
                        textAlign: 'left'
                      }}
                    >
                      Student ID {sortFieldLower === 'student_id' && (sortDirectionLower === 'asc' ? <ArrowUp size={16} /> : <ArrowDown size={16} />)}
                    </th>
                    <th 
                      onClick={() => handleSortLower('performance_level')}
                      style={{ 
                        cursor: 'pointer', 
                        padding: '0.75rem',
                        backgroundColor: '#f1f5f9',
                        borderBottom: '2px solid var(--border-color)',
                        textAlign: 'left'
                      }}
                    >
                      Performance {sortFieldLower === 'performance_level' && (sortDirectionLower === 'asc' ? <ArrowUp size={16} /> : <ArrowDown size={16} />)}
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
              Good Progress + Strong ({upperPerformingStudents.length} students)
            </h4>
            {isUpperTableOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
          
          {isUpperTableOpen && (
            <div className="table-container" style={{ overflowX: 'auto', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th 
                      onClick={() => handleSortUpper('student_id')}
                      style={{ 
                        cursor: 'pointer', 
                        padding: '0.75rem',
                        backgroundColor: '#f1f5f9',
                        borderBottom: '2px solid var(--border-color)',
                        textAlign: 'left'
                      }}
                    >
                      Student ID {sortFieldUpper === 'student_id' && (sortDirectionUpper === 'asc' ? <ArrowUp size={16} /> : <ArrowDown size={16} />)}
                    </th>
                    <th 
                      onClick={() => handleSortUpper('performance_level')}
                      style={{ 
                        cursor: 'pointer', 
                        padding: '0.75rem',
                        backgroundColor: '#f1f5f9',
                        borderBottom: '2px solid var(--border-color)',
                        textAlign: 'left'
                      }}
                    >
                      Performance {sortFieldUpper === 'performance_level' && (sortDirectionUpper === 'asc' ? <ArrowUp size={16} /> : <ArrowDown size={16} />)}
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