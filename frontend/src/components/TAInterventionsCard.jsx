// src/components/TAInterventionsCard.jsx
import { useState, useMemo } from 'react';
import { Eye, Users } from 'lucide-react';
import Modal from './Modal';
import StudentSubmission from './StudentSubmission';

const TAInterventionsCard = ({ codeSnapshots, submissionTimes, individualAssessment=[], onDataUpdate }) => {
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('not-reviewed');

  // Get final submissions for each student
  const submissionData = useMemo(() => {
    if (!submissionTimes?.submission_times || !codeSnapshots?.entries || !individualAssessment) {
      return { reviewed: [], notReviewed: [] };
    }

    // Group submissions by student and find the latest for each
    const latestSubmissions = new Map();
    submissionTimes.submission_times.forEach(submission => {
      const studentId = submission.student_id;
      const currentSubmission = latestSubmissions.get(studentId);
      if (!currentSubmission || new Date(submission.timestamp) > new Date(currentSubmission.timestamp)) {
        latestSubmissions.set(studentId, submission);
      }
    });

    // Get assessment status for each student
    const assessmentMap = new Map(
      individualAssessment.map(assessment => [assessment.student_id, assessment.performance_level])
    );

    // Process each final submission
    const submissions = Array.from(latestSubmissions.values()).map(submission => {
      // Find the matching snapshot for this submission
      const submissionSnapshot = codeSnapshots.entries.find(
        entry => entry.student_id === submission.student_id && 
                new Date(entry.timestamp).getTime() === new Date(submission.timestamp).getTime()
      );

      return {
        studentId: submission.student_id,
        timestamp: submission.timestamp,
        code: submissionSnapshot?.content || '',
        performance: assessmentMap.get(submission.student_id) || 'NotAssessed'
      };
    });

    // Split into reviewed and not reviewed
    return {
      reviewed: submissions.filter(s => s.performance !== 'NotAssessed'),
      notReviewed: submissions.filter(s => s.performance === 'NotAssessed')
    };
  }, [submissionTimes, codeSnapshots, individualAssessment]);

  const handleStudentClick = (studentId) => {
    setSelectedStudentId(studentId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Get color based on performance
  const getPerformanceColor = (performance) => {
    switch(performance) {
      case 'Correct':
        return '#22c55e';
      case 'Incorrect':
        return '#ef4444';
      default:
        return '#6b7280';
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
          Reviewed ({submissionData.reviewed.length})
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
          Not Reviewed ({submissionData.notReviewed.length})
        </button>
      </div>
      
      {/* Content area */}
      <div className="students-list" style={{ maxHeight: '250px', overflowY: 'auto' }}>
        {activeTab === 'reviewed' ? (
          // Reviewed submissions
          submissionData.reviewed.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {submissionData.reviewed.map((submission) => (
                <div 
                  key={submission.studentId}
                  style={{ 
                    backgroundColor: 'var(--background-color)', 
                    padding: '0.3rem 0.5rem',
                    borderRadius: '3px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    cursor: 'pointer',
                    border: `2px solid ${getPerformanceColor(submission.performance)}`,
                    fontSize: '0.7rem' 
                  }}
                  onClick={() => handleStudentClick(submission.studentId)}
                >
                  <span>{submission.studentId}</span>
                </div>
              ))}
            </div>
          ) : (
            <p>No submissions have been reviewed yet.</p>
          )
        ) : (
          // Not reviewed submissions
          submissionData.notReviewed.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {submissionData.notReviewed.map((submission) => (
                <div 
                  key={submission.studentId}
                  style={{ 
                    backgroundColor: 'var(--background-color)', 
                    padding: '0.3rem 0.5rem',
                    borderRadius: '5px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    cursor: 'pointer',
                    border: '2px solid #6b7280',
                    fontSize: '0.7rem' 
                  }}
                  onClick={() => handleStudentClick(submission.studentId)}
                >
                  <span>{submission.studentId}</span>
                </div>
              ))}
            </div>
          ) : (
            <p>No submissions pending review.</p>
          )
        )}
      </div>
      
      {/* Modal for viewing submission code */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal}
        title={`Student #${selectedStudentId} Final Submission`}
      >
        {selectedStudentId && (
          <StudentSubmission 
            studentSubmissions={{
              entries: [
                // Find the final submission snapshot
                (() => {
                  const latestSubmission = submissionTimes.submission_times
                    .filter(sub => sub.student_id === selectedStudentId)
                    .reduce((latest, current) => {
                      if (!latest || new Date(current.timestamp) > new Date(latest.timestamp)) {
                        return current;
                      }
                      return latest;
                    }, null);

                  return codeSnapshots.entries.find(entry => 
                    entry.student_id === selectedStudentId && 
                    new Date(entry.timestamp).getTime() === new Date(latestSubmission?.timestamp).getTime()
                  );
                })()
              ].filter(Boolean)
            }}
            submissionTimes={{
              submission_times: [
                submissionTimes.submission_times
                  .filter(sub => sub.student_id === selectedStudentId)
                  .reduce((latest, current) => {
                    if (!latest || new Date(current.timestamp) > new Date(latest.timestamp)) {
                      return current;
                    }
                    return latest;
                  }, null)
              ].filter(Boolean)
            }}
            studentId={selectedStudentId}
            onDataUpdate={onDataUpdate}
          />
        )}
      </Modal>
    </div>
  );
};

export default TAInterventionsCard;