// src/components/TAInterventionsCard.jsx
import { useState, useMemo } from 'react';
import { Eye, Users } from 'lucide-react';
import Modal from './Modal';
import StudentSubmission from './StudentSubmission';

const TAInterventionsCard = ({ taInterventions, codeSnapshots, submissionTimes, individualAssessment=[], onDataUpdate }) => {
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('not-reviewed'); // 'reviewed' or 'not-reviewed'

  // Get submission status for all students
  const studentSubmissionStatus = useMemo(() => {
    if (!submissionTimes?.submission_times) {
      return {};
    }
    
    // Create a map of student IDs to submission status
    const statusMap = {};
    submissionTimes.submission_times.forEach(submission => {
      statusMap[submission.student_id] = true; // Has submitted
    });
    
    return statusMap;
  }, [submissionTimes]);

  // Get the list of students who haven't been reviewed
  const notReviewedStudents = useMemo(() => {
    if (!taInterventions?.interventions || !codeSnapshots?.entries || !individualAssessment) {
      return [];
    }

    // Get all student IDs from code snapshots
    const allStudentIds = new Set();
    codeSnapshots.entries.forEach(entry => {
      allStudentIds.add(entry.student_id);
    });
    
    // Get all reviewed student IDs
    const reviewedStudentIds = new Set();
    individualAssessment.forEach(assessment => {
      if (assessment.performance_level != "NotAssessed") {
        reviewedStudentIds.add(assessment.student_id);
      }
    });
    
    // Filter to get students who haven't been reviewed
    return Array.from(allStudentIds)
      .filter(id => !reviewedStudentIds.has(id))
      .sort((a, b) => a - b);
  }, [taInterventions, codeSnapshots, individualAssessment]);

  const handleStudentClick = (studentId) => {
    setSelectedStudentId(studentId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Calculate percentages
  const reviewedCount = individualAssessment.filter(
    (item) => item.performance_level != "NotAssessed"
  ).length || 0;

  // Get the border color based on submission status
  const getBorderStyle = (studentId) => {
    // Check if student has submitted
    const hasSubmitted = studentSubmissionStatus[studentId];
    
    if (hasSubmitted) {
      return '1px solid var(--border-color)';
    } else {
      return '1px solid #f59e0b'; // Amber color for not submitted
    }
  };

  return (
    <div className="ta-interventions-card">
      {/* Tab navigation */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: '1rem' }}>
        <button
          className={`tab-btn ${activeTab === 'reviewed' ? 'active' : ''}`}
          onClick={() => setActiveTab('reviewed')}
          style={{ 
            padding: '0.5rem 1rem', 
            background: 'transparent', 
            border: 'none',
            borderBottom: activeTab === 'reviewed' ? '2px solid var(--primary-color)' : '2px solid transparent',
            fontWeight: activeTab === 'reviewed' ? 'bold' : 'normal',
            cursor: 'pointer',
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}
        >
          <Eye size={16} />
          Reviewed ({reviewedCount})
        </button>
        <button
          className={`tab-btn ${activeTab === 'not-reviewed' ? 'active' : ''}`}
          onClick={() => setActiveTab('not-reviewed')}
          style={{ 
            padding: '0.5rem 1rem', 
            background: 'transparent', 
            border: 'none',
            borderBottom: activeTab === 'not-reviewed' ? '2px solid var(--primary-color)' : '2px solid transparent',
            fontWeight: activeTab === 'not-reviewed' ? 'bold' : 'normal',
            cursor: 'pointer',
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}
        >
          <Users size={16} />
          Not Reviewed ({notReviewedStudents.length})
        </button>
      </div>
      
      {/* Legend for border colors */}
      <div style={{ 
        display: 'flex', 
        gap: '1rem', 
        fontSize: '0.7rem', 
        marginBottom: '0.5rem',
        justifyContent: 'flex-end' 
      }}>
      </div>
      
      {/* Content area */}
      <div className="students-list" style={{ maxHeight: '250px', overflowY: 'auto' }}>
        {activeTab === 'reviewed' ? (
          // Reviewed students
          individualAssessment.filter(
            (item) => item.performance_level != "NotAssessed"
          ).length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {individualAssessment.filter(
                (item) => item.performance_level != "NotAssessed"
              ).map((assessment) => (
                <div 
                  key={assessment.student_id}
                  style={{ 
                    backgroundColor: 'var(--background-color)', 
                    padding: '0.3rem 0.5rem',
                    borderRadius: '3px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    cursor: 'pointer',
                    border: getBorderStyle(assessment.student_id),
                    fontSize: '0.7rem' 
                  }}
                  onClick={() => handleStudentClick(assessment.student_id)}
                >
                  <span>{assessment.student_id}</span>
                </div>
              ))}
            </div>
          ) : (
            <p>No students have been reviewed yet.</p>
          )
        ) : (
          // Students not reviewed
          notReviewedStudents.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {notReviewedStudents.map((studentId) => (
                <div 
                  key={studentId}
                  style={{ 
                    backgroundColor: 'var(--background-color)', 
                    padding: '0.3rem 0.5rem',
                    borderRadius: '5px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    cursor: 'pointer',
                    border: getBorderStyle(studentId),
                    fontSize: '0.7rem' 
                  }}
                  onClick={() => handleStudentClick(studentId)}
                >
                  <span>{studentId}</span>
                </div>
              ))}
            </div>
          ) : (
            <p>All students have been reviewed.</p>
          )
        )}
      </div>
      
      {/* Modal for viewing student submission */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal}
        title={`Student #${selectedStudentId} Code`}
      >
        {selectedStudentId && (
          <StudentSubmission 
            studentSubmissions={codeSnapshots}
            submissionTimes={submissionTimes}
            studentId={selectedStudentId}
            onDataUpdate={onDataUpdate}
          />
        )}
      </Modal>
    </div>
  );
};

export default TAInterventionsCard;