import { useState, useEffect } from 'react';
import CodeBlock from './CodeBlock';

const StudentSubmission = ({ studentSubmissions, submissionTimes, studentId, helpRequest=null, onDataUpdate }) => {
  const [assessment, setAssessment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionMessage, setSubmissionMessage] = useState('');
  const [editedCode, setEditedCode] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  
  // Find the latest submission time for this student
  const submission = submissionTimes?.submission_times
    ?.filter(sub => sub.student_id === studentId)
    ?.reduce((latest, current) => {
      if (!latest || new Date(current.timestamp) > new Date(latest.timestamp)) {
        return current;
      }
      return latest;
    }, null);

  // Find the snapshot that matches the submission timestamp
  // If exact match fails, fall back to any available snapshot for the student
  let snapshot = null;
  
  if (submission && studentSubmissions?.entries) {
    // First, try to find exact timestamp match
    snapshot = studentSubmissions.entries.find(
      entry => entry.student_id === studentId && 
              new Date(entry.timestamp).getTime() === new Date(submission.timestamp).getTime()
    );
    
    // If no exact match, find any snapshot for this student (prefer latest)
    if (!snapshot) {
      const studentSnapshots = studentSubmissions.entries
        .filter(entry => entry.student_id === studentId)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      snapshot = studentSnapshots[0]; // Get the latest snapshot
    }
  } else if (studentSubmissions?.entries) {
    // If no submission data, just find any snapshot for this student
    const studentSnapshots = studentSubmissions.entries
      .filter(entry => entry.student_id === studentId)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    snapshot = studentSnapshots[0];
  }

  const problemID = new URLSearchParams(window.location.search).get("problem_id");

  useEffect(() => {
    if (snapshot?.content) {
      setEditedCode(snapshot.content);
    }
  }, [snapshot?.content]);

  const existingGrade = snapshot?.grade?.toLowerCase();
  const hasSubmissionTime = submission && submission.timestamp;
  const hasEdited = editedCode !== snapshot?.content;

  const handleGradeSubmit = async () => {
    if (!assessment || !problemID) return;

    setIsSubmitting(true);
    setSubmissionMessage('');

    try {
      const res = await fetch(`${window.location.origin}/grade`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          student_id: snapshot.student_id,
          grade: assessment,
          problem_id: parseInt(problemID),
        }),
      });

      if (res.ok) {
        setSubmissionMessage('✅ Grade submitted successfully.');
        console.log('Code graded, refreshing data...');
        onDataUpdate?.();
      } else {
        setSubmissionMessage('❌ Failed to submit grade.');
      }
    } catch (error) {
      setSubmissionMessage('❌ Error occurred while submitting.');
      console.error('Error submitting grade:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFeedbackSubmit = async () => {
    if (!hasEdited) return;

    const formData = new URLSearchParams();
    formData.append('feedback', editedCode);
    formData.append('snapshot_id', snapshot.snapshot_id);
    formData.append('uid', 4); // static for now
    formData.append('role', 'teacher');

    try {
      const response = await fetch(`${window.location.origin}/save_snapshot_feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        },
        body: formData.toString(),
      });

      if (response.ok) {
        alert('✅ Inline feedback sent successfully.');
        console.log('Feedback sent, refreshing data...');
        onDataUpdate?.();
      } else {
        alert('❌ Failed to send feedback.');
      }
    } catch (error) {
      alert('❌ Error occurred while sending feedback.');
      console.error('Error sending feedback:', error);
    }
  };

  if (!snapshot) {
    return <div className="student-submission"><p>No code snapshot found for Student #{studentId}</p></div>;
  }

  return (
    <div className="student-submission">
      <div className="submission-header" style={{ marginBottom: '1rem' }}>
        <p><strong>Student ID:</strong> {snapshot.student_id}</p>
        <p><strong>Snapshot Time:</strong> {snapshot.timestamp}</p>
        {hasSubmissionTime && <p><strong>Submission Time:</strong> {submission.timestamp}</p>}
        {existingGrade && (
          <p><strong>Assessed Grade:</strong> {existingGrade.charAt(0).toUpperCase() + existingGrade.slice(1).replace('_', ' ')}</p>
        )}
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="assessment"><strong>Assessment:</strong>{' '}</label>
        <select
          id="assessment"
          value={assessment}
          onChange={(e) => setAssessment(e.target.value)}
          style={{
            padding: '8px 12px',
            borderRadius: '6px',
            border: '1px solid #ccc',
            backgroundColor: '#fff',
            color: '#333',
            fontSize: '14px',
            minWidth: '180px',
            cursor: 'pointer',
          }}
        >
          <option value="">Select...</option>
          <option value="correct">Correct</option>
          <option value="incorrect">Incorrect</option>
        </select>

        {assessment && (
          <button
            onClick={handleGradeSubmit}
            disabled={isSubmitting}
            style={{
              marginLeft: '1rem',
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: isSubmitting ? '#90caf9' : '#1976d2',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '14px',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              opacity: isSubmitting ? 0.6 : 1,
              transition: 'background-color 0.3s ease, opacity 0.2s ease',
            }}
          >
            {isSubmitting ? 'Submitting...' : '🚀 Submit Grade'}
          </button>
        )}

        {submissionMessage && (
          <p style={{ marginTop: '0.5rem' }}>{submissionMessage}</p>
        )}
      </div>

      {helpRequest && (
        <div style={{ 
          marginBottom: '1rem', 
          padding: '1rem',
          backgroundColor: '#fff3cd',
          border: '1px solid #ffeeba',
          borderRadius: '6px'
        }}>
          <h4 style={{ margin: '0 0 0.5rem 0', color: '#856404' }}>Help Request:</h4>
          <p style={{ margin: 0, color: '#856404' }}>{helpRequest.message}</p>
        </div>
      )}

      <div className="submission-code">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h4>Code Snapshot</h4>
          <button
  onClick={() => setIsEditing(!isEditing)}
  style={{
    padding: '6px 12px',
    borderRadius: '6px',
    border: '1px solid #ccc',
    backgroundColor: isEditing ? '#f44336' : '#1976d2',
    color: 'white',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
  }}
>
  <span>{isEditing ? '❌ Cancel Edit' : '✏️ Edit'}</span>
</button>

        </div>

        <CodeBlock
  code={editedCode}
  editable={isEditing}
  onChange={(newCode) => setEditedCode(newCode)}
/>

{isEditing && (
  <button
    onClick={handleFeedbackSubmit}
    disabled={!hasEdited}
    style={{
      marginTop: '1rem',
      padding: '8px 16px',
      borderRadius: '6px',
      border: 'none',
      backgroundColor: hasEdited ? '#4caf50' : '#a5d6a7',
      color: 'white',
      fontWeight: 'bold',
      fontSize: '14px',
      cursor: hasEdited ? 'pointer' : 'not-allowed',
      opacity: hasEdited ? 1 : 0.6,
      transition: 'background-color 0.3s ease, opacity 0.2s ease',
    }}
  >
    📤 Send Inline Feedback
  </button>
)}

      </div>
    </div>
  );
};

export default StudentSubmission;