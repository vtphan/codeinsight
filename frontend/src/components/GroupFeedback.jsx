import { useState } from 'react';

const GroupFeedback = ({ misconception, snapshotMap }) => {
  const [showFeedbackBox, setShowFeedbackBox] = useState(false);
  const [groupFeedback, setGroupFeedback] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    setIsSending(true);
    let success = 0;

    for (const studentId of misconception.student_ids) {
      const snapshot = snapshotMap[studentId];
      if (!snapshot?.snapshot_id) continue;

      const formData = new URLSearchParams();
      formData.append('feedback', groupFeedback);
      formData.append('snapshot_id', snapshot.snapshot_id);
      formData.append('uid', '4');
      formData.append('role', 'teacher');

      try {
        const res = await fetch(`${window.location.origin}/save_snapshot_feedback`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
          body: formData.toString(),
        });
        if (res.ok) success++;
      } catch (err) {
        console.error(`Failed for student ${studentId}`, err);
      }
    }

    setIsSending(false);
    setSubmitted(true);
    alert(`✅ Feedback sent to ${success} students.`);
  };

  return (
    <div style={{ marginTop: '1rem' }}>
      <button 
  className="btn btn-primary"
  onClick={() => setShowFeedbackBox(!showFeedbackBox)}
>
  Group Feedback
</button>


      {showFeedbackBox && (
        <div style={{ marginTop: '1rem' }}>
          <h4>Feedback to students in this group:</h4>
          <textarea
            value={groupFeedback}
            onChange={(e) => setGroupFeedback(e.target.value)}
            rows={8}
            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px' }}
          />
          <button
  onClick={handleSubmit}
  disabled={isSending || !groupFeedback.trim()}
  className="btn"
  style={{
    marginTop: '0.5rem',
    padding: '0.4rem 0.8rem',
    backgroundColor: isSending || !groupFeedback.trim() ? '#ccc' : '#28a745',
    color: isSending || !groupFeedback.trim() ? '#666' : 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: isSending || !groupFeedback.trim() ? 'not-allowed' : 'pointer',
  }}
>
  {isSending ? 'Sending...' : 'Send Feedback'}
</button>

        </div>
      )}
    </div>
  );
};

export default GroupFeedback;
