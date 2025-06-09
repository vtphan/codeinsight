// src/components/TAInterventionsCard.jsx
import { useState, useMemo } from 'react';
import { Eye, Users } from 'lucide-react';
import Modal from './Modal';
import StudentSubmission from './StudentSubmission';

const HelpRequestsCard = ({ taInterventions, codeSnapshots, submissionTimes, individualAssessment=[], helpRequests=[], onDataUpdate }) => {
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  // create a map of student ids to help requests
  const helpRequestMap = useMemo(() => {
    const map = {};
    helpRequests.forEach(request => {
      map[request.student_id] = request;
    });
    return map;
  }, [helpRequests]);

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

    const helpRequestStudentIds = new Set();
    helpRequests.forEach(request => {
      helpRequestStudentIds.add(request.student_id);
    });

    // Filter to get students who haven't been reviewed
    return Array.from(allStudentIds)
      .filter(id => !reviewedStudentIds.has(id))
      .sort((a, b) => a - b);
  }, [taInterventions, codeSnapshots, individualAssessment, helpRequests]);

  const handleStudentClick = (studentId) => {
    setSelectedStudentId(studentId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="ta-interventions-card">
      {/* Tab navigation */}
      
      {/* Legend for border colors */}
      <div style={{ 
        display: 'flex', 
        gap: '1rem', 
        fontSize: '0.7rem', 
        marginBottom: '0.5rem',
        justifyContent: 'flex-end' 
      }}>
      </div>
      
      <div style={{ height: '1px', backgroundColor: 'var(--border-color)', marginBottom: '1rem' }}></div>
      
      {/* Content area */}
      <div className="students-list" style={{ maxHeight: '250px', overflowY: 'auto' }}>
          {helpRequests.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {helpRequests.map((request) => (
                <div 
                  key={request.student_id}
                  style={{ 
                    backgroundColor: 'var(--background-color)', 
                    padding: '0.3rem 0.5rem',
                    borderRadius: '3px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    cursor: 'pointer',
                    border: '1px solid var(--border-color)',
                    fontSize: '0.7rem' 
                  }}
                  onClick={() => handleStudentClick(request.student_id)}
                >
                  <span>{request.student_id}</span>
                </div>
              ))}
            </div>
          ) : (
            <p>No help requests at this time.</p>
          )
          }
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
            helpRequest={helpRequestMap[selectedStudentId]}
            onDataUpdate={onDataUpdate}
          />
        )}
      </Modal>
    </div>
  );
};

export default HelpRequestsCard;