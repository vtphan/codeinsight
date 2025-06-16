// src/views/MonitorView.jsx - updated
import { useState, useEffect } from 'react';
import TimelineVisualization from '../components/TimelineVisualization';
import PerformanceComparisonChart from '../components/PerformanceComparisonChart';
import TAInterventionsCard from '../components/TAInterventionsCard';
import HelpRequestsCard from '../components/HelpRequestsCard';
import ViewToggle from '../components/ViewToggle';
import StatsBarChart from '../components/StatsBarChart';
import './MonitorView.css';

const MonitorView = ({ analysisData, problemDescription, codeSnapshots, submissionTimes, taInterventionTimes, onDataUpdate }) => {
  const { overall_assessment } = analysisData;
  const helpRequests = taInterventionTimes.interventions.filter(
    (item) => item.help_stat == "Asked for help"
  )
  
  // Initialize statsView from localStorage or default to 'bar'
  const [statsView, setStatsView] = useState(() => {
    const savedView = localStorage.getItem('monitor-stats-view');
    return savedView || 'bar';
  });

  // Save to localStorage whenever statsView changes
  useEffect(() => {
    localStorage.setItem('monitor-stats-view', statsView);
  }, [statsView]);

  // Get unique student submissions count
  const uniqueSubmittedStudents = new Set(submissionTimes.submission_times.map(
    submission => submission.student_id
  )).size;

  // Calculate total students who haven't submitted
  const totalStudents = overall_assessment.total_entries;
  const notSubmittedCount = totalStudents - uniqueSubmittedStudents;

  // Stats for bar chart
  const statsData = {
    correct: analysisData.individual_assessment.filter(
      (item) => item.performance_level === "Correct"
    ).length,
    incorrect: analysisData.individual_assessment.filter(
      (item) => item.performance_level === "Incorrect"
    ).length,
    notAssessed: analysisData.individual_assessment.filter(
      (item) => item.performance_level === "NotAssessed"
    ).length,
    notSubmitted: notSubmittedCount
  };

  return (
    <div className="monitor-view">
      <ViewToggle view={statsView} onViewChange={setStatsView} />
      
      {statsView === 'bar' ? (
        <div className="card">
          <StatsBarChart stats={statsData} />
        </div>
      ) : (
        <div className="stats-row" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
          <div className="stat-card">
            <h3 className="stat-title">Correct</h3>
            <div className="stat-value">
              {statsData.correct}
            </div>
          </div>

          <div className="stat-card">
            <h3 className="stat-title">Incorrect</h3>
            <div className="stat-value">
              {statsData.incorrect}
            </div>
          </div>

          <div className="stat-card">
            <h3 className="stat-title">Not Assessed</h3>
            <div className="stat-value">
              {statsData.notAssessed}
            </div>
          </div>

          <div className="stat-card">
            <h3 className="stat-title">Not Submitted</h3>
            <div className="stat-value">
              {statsData.notSubmitted}
            </div>
          </div>
        </div>
      )}
      
      {/* Performance Stats Section */}
      {/* <div className="monitor-stats card">
        <div className="performance-chart-container">
          <h3 className="section-title">Performance</h3>
          <PerformanceComparisonChart 
            performanceData={overall_assessment.performance_distribution}
            submissionTimes={submissionTimes}
            individualAssessment={analysisData.individual_assessment}
          />
        </div>
      </div> */}
      
      {/* Full Width Snapshot Activity Section */}
      <div className="submission-timeline-container card">
        <h3 className="section-title">Snapshot Activity</h3>
        <TimelineVisualization 
          codeSnapshots={codeSnapshots}
          submissionTimes={submissionTimes}
          performanceData={analysisData.individual_assessment}
          problemDescription={problemDescription}
        />
      </div>

      {/* TA Interventions Section */}
      <div className="card" style={{ marginTop: '20px' }}>
        <h3 className="section-title">Submissions</h3>
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