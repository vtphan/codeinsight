// src/views/MonitorView.jsx - updated
import TimelineVisualization from '../components/TimelineVisualization';
import PerformanceComparisonChart from '../components/PerformanceComparisonChart';
import TAInterventionsCard from '../components/TAInterventionsCard';
import HelpRequestsCard from '../components/HelpRequestsCard';
import './MonitorView.css';

const MonitorView = ({ analysisData, problemDescription, codeSnapshots, submissionTimes, taInterventionTimes, onDataUpdate }) => {
  const { overall_assessment } = analysisData;
  const helpRequests = taInterventionTimes.interventions.filter(
    (item) => item.help_stat == "Asked for help"
  )
  const helpRequestsCount = helpRequests.length


  return (
    <div className="monitor-view">
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
                {/* exclude items with ""performance_level": "NotAssessed"" */}
                {analysisData.individual_assessment.filter(
                  (item) => item.performance_level != "NotAssessed"
                ).length}
              </div>
            </div>

            <div className="stat-card">
              <h3 className="stat-title">Help Requests</h3>
              <div className="stat-value">
                {helpRequestsCount}
              </div>
            </div>
          </div>
      <div className="two-column">
        
        <div className="monitor-stats card">
          
          <div className="performance-chart-container">
          <h3 className="section-title">Performance</h3>
            <PerformanceComparisonChart 
              performanceData={overall_assessment.performance_distribution}
              submissionTimes={submissionTimes}
              individualAssessment={analysisData.individual_assessment}
            />
          </div>
        </div>
      
        <div className="submission-timeline-container card">
          <h3 className="section-title">Snapshot Activity</h3>
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
          individualAssessment={analysisData.individual_assessment}
          totalStudents={overall_assessment.total_entries}
          codeSnapshots={codeSnapshots}
          submissionTimes={submissionTimes}
          onDataUpdate={onDataUpdate}
        />
      </div>

      <div className="additional-info card">
        <h3 className="section-title">Help Requests</h3>
         <HelpRequestsCard 
          taInterventions={taInterventionTimes}
          individualAssessment={analysisData.individual_assessment}
          totalStudents={overall_assessment.total_entries}
          codeSnapshots={codeSnapshots}
          submissionTimes={submissionTimes}
          helpRequests={helpRequests}
          onDataUpdate={onDataUpdate}
        />
      </div>
    </div>
  );
};

export default MonitorView;