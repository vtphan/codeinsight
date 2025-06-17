import { useState } from 'react';
import Modal from './Modal';

const GroupFeedbackModal = ({ isOpen, onClose, misconception, snapshotMap }) => {
  const [groupFeedback, setGroupFeedback] = useState('');
  const [isSending, setIsSending] = useState(false);

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
    alert(`✅ Feedback sent to ${success} students.`);
    setGroupFeedback('');
    onClose();
  };

  const handleClose = () => {
    setGroupFeedback('');
    onClose();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose}
      title="Group Feedback"
    >
      <div>
        <h4>Feedback to students in this group:</h4>
        <textarea
          value={groupFeedback}
          onChange={(e) => setGroupFeedback(e.target.value)}
          rows={8}
          style={{ 
            width: '100%', 
            padding: '0.5rem', 
            borderRadius: '4px',
            border: '1px solid var(--border-color)',
            fontFamily: 'inherit',
            fontSize: 'inherit',
            marginTop: '0.5rem'
          }}
          placeholder="Enter feedback for all students in this group..."
        />
        <button
          onClick={handleSubmit}
          disabled={isSending || !groupFeedback.trim()}
          style={{
            marginTop: '1rem',
            padding: '0.5rem 1rem',
            backgroundColor: isSending || !groupFeedback.trim() ? '#ccc' : '#28a745',
            color: isSending || !groupFeedback.trim() ? '#666' : 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isSending || !groupFeedback.trim() ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          {isSending ? 'Sending...' : 'Send Feedback'}
        </button>
      </div>
    </Modal>
  );
};

export default GroupFeedbackModal; 