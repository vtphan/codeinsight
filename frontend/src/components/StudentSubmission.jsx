// src/components/StudentSubmission.jsx
import CodeBlock from './CodeBlock';

const StudentSubmission = ({ studentSubmissions, submissionTimes, studentId }) => {
  // Find the snapshot for the selected student
  const snapshot = studentSubmissions?.entries?.find(
    entry => entry.student_id === studentId
  );
  
  // Find the submission time if any
  const submission = submissionTimes?.submission_times?.find(
    sub => sub.student_id === studentId
  );
  
  if (!snapshot) {
    return (
      <div className="student-submission">
        <p>No code snapshot found for Student #{studentId}</p>
      </div>
    );
  }
  
  return (
    <div className="student-submission">
      <div className="submission-header" style={{ marginBottom: '1rem' }}>
        <p><strong>Student ID:</strong> {snapshot.student_id}</p>
        <p><strong>Snapshot Time:</strong> {snapshot.timestamp}</p>
        {submission && (
          <p><strong>Submission Time:</strong> {submission.timestamp}</p>
        )}
      </div>
      
      <div className="submission-code">
        <h4>Code:</h4>
        <CodeBlock code={snapshot.content} />
      </div>
    </div>
  );
};

export default StudentSubmission;