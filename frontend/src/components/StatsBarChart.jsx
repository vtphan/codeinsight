import React from 'react';

const StatsBarChart = ({ stats }) => {
  const total = stats.correct + stats.incorrect + stats.notAssessed + stats.notSubmitted;
  
  // Calculate percentages
  const correctPercent = (stats.correct / total) * 100;
  const incorrectPercent = (stats.incorrect / total) * 100;
  const notAssessedPercent = (stats.notAssessed / total) * 100;
  const notSubmittedPercent = (stats.notSubmitted / total) * 100;

  return (
    <div className="stats-bar-chart" style={{ padding: '0rem' }}>
      <div style={{ marginBottom: '1rem' }}>
        <h3 className="section-title">Class Progress</h3>
      </div>
      
      <div style={{ position: 'relative', height: '60px', borderRadius: '4px', overflow: 'hidden' }}>
        {/* Correct section */}
        <div
          style={{
            position: 'absolute',
            left: '0%',
            width: `${correctPercent}%`,
            height: '100%',
            backgroundColor: 'var(--success-color)',
            transition: 'width 0.3s ease'
          }}
        />
        {/* Incorrect section */}
        <div
          style={{
            position: 'absolute',
            left: `${correctPercent}%`,
            width: `${incorrectPercent}%`,
            height: '100%',
            backgroundColor: 'var(--danger-color)',
            transition: 'width 0.3s ease'
          }}
        />
        {/* Not Assessed section */}
        <div
          style={{
            position: 'absolute',
            left: `${correctPercent + incorrectPercent}%`,
            width: `${notAssessedPercent}%`,
            height: '100%',
            backgroundColor: 'var(--warning-color)',
            transition: 'width 0.3s ease'
          }}
        />
        {/* Not Submitted section */}
        <div
          style={{
            position: 'absolute',
            left: `${correctPercent + incorrectPercent + notAssessedPercent}%`,
            width: `${notSubmittedPercent}%`,
            height: '100%',
            backgroundColor: 'var(--secondary-color)',
            transition: 'width 0.3s ease'
          }}
        />
      </div>

      {/* Legend */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        marginTop: '1rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '12px', height: '12px', backgroundColor: 'var(--success-color)', borderRadius: '2px' }} />
          <span>Correct ({stats.correct})</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '12px', height: '12px', backgroundColor: 'var(--danger-color)', borderRadius: '2px' }} />
          <span>Incorrect ({stats.incorrect})</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '12px', height: '12px', backgroundColor: 'var(--warning-color)', borderRadius: '2px' }} />
          <span>Not Assessed ({stats.notAssessed})</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '12px', height: '12px', backgroundColor: 'var(--secondary-color)', borderRadius: '2px' }} />
          <span>Not Submitted ({stats.notSubmitted})</span>
        </div>
      </div>
    </div>
  );
};

export default StatsBarChart; 