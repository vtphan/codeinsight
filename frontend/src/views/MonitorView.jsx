// src/views/MonitorView.jsx - updated
import TimelineVisualization from '../components/TimelineVisualization';
import PerformanceComparisonChart from '../components/PerformanceComparisonChart';
import TAInterventionsCard from '../components/TAInterventionsCard';
import './MonitorView.css';

const MonitorView = ({ analysisData, problemDescription, codeSnapshots, submissionTimes, taInterventionTimes }) => {
  const { overall_assessment } = analysisData;

  return (
    <div className="monitor-view">
      <div className="two-column">
        <div className="monitor-stats card">
          <div className="stats-row">
            <div className="stat-card">
              <h3 className="stat-title">Students</h3>
              <div className="stat-value">
                {overall_assessment.total_entries}
              </div>
            </div>
            
            <div className="stat-card">
              <h3 className="stat-title">Submissions</h3>
              <div className="stat-value">
                {submissionTimes.submission_times.length}
              </div>
            </div>
            
            <div className="stat-card">
              <h3 className="stat-title">Reviewed</h3>
              <div className="stat-value">
                {taInterventionTimes.interventions.length}
              </div>
            </div>
          </div>
          
          <div className="performance-chart-container">
            <PerformanceComparisonChart 
              performanceData={overall_assessment.performance_distribution}
              submissionTimes={submissionTimes}
              individualAssessment={analysisData.individual_assessment}
            />
          </div>
        </div>
      
        <div className="submission-timeline-container card">
          <h3 className="section-title">Student Activity Timeline</h3>
          <TimelineVisualization 
            codeSnapshots={codeSnapshots}
            submissionTimes={submissionTimes}
            performanceData={analysisData.individual_assessment}
            problemDescription={problemDescription}
          />
        </div>
      </div>

      {/* TA Interventions Section - Now as a separate row below the two-column layout */}
      <div className="card" style={{ marginTop: '20px' }}>
        <h3 className="section-title">Students' Code Snapshot</h3>
        <TAInterventionsCard 
          taInterventions={taInterventionTimes}
          totalStudents={overall_assessment.total_entries}
          codeSnapshots={codeSnapshots}
          submissionTimes={submissionTimes}
        />
      </div>

      <div className="additional-info card">
        <h3 className="section-title">Notifications</h3>
        <p>No urgent notifications at this time.</p>
        <p className="info-note">
          This area will display notifications if students need immediate assistance or if there are issues that require attention.
        </p>
      </div>
    </div>
  );
};

export default MonitorView;