// src/views/RespondView.jsx
import { useMemo } from 'react';
import MisconceptionCard from '../components/MisconceptionCard';

const RespondView = ({ 
  analysisData, 
  codeSnapshots,
  submissionTimes,
  addToScreenQueue, 
}) => {
  const { aggregate_analysis } = analysisData;

  const sortedMisconceptions = useMemo(() => {
    return [...aggregate_analysis.potential_misconceptions].sort((a, b) => {
      const percentA = parseFloat(a.occurrence_percentage);
      const percentB = parseFloat(b.occurrence_percentage);
      return percentB - percentA;
    });
  }, [aggregate_analysis.potential_misconceptions]);

  return (
    <div className="respond-view">
      <div className="misconceptions-section">
        <div className="misconceptions-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
          {sortedMisconceptions.map((misconception, index) => (
            <MisconceptionCard 
              key={index} 
              misconception={misconception} 
              addToScreenQueue={addToScreenQueue}
              expanded={true}
              isRespond={true}
              studentSubmissions={codeSnapshots}
              submissionTimes={submissionTimes}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default RespondView;
