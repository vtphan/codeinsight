// src/views/AnalyzeView.jsx
import { useState } from 'react';
import { Download, Printer } from 'lucide-react';
import ErrorItem from '../components/ErrorItem';
import CorrelationItem from '../components/CorrelationItem';
import AnalyzeMisconceptionCard from '../components/AnalyzeMisconceptionCard';
import StudentTable from '../components/StudentTable';
import { generatePrintableReport } from '../utils/exportUtils';
import MisconceptionCard from '../components/MisconceptionCard';

const AnalyzeView = ({ analysisData, problemDescription, codeSnapshots, submissionTimes, addToScreenQueue }) => {
  const { 
    individual_assessment, 
    aggregate_analysis 
  } = analysisData;
  
  const [activeTab, setActiveTab] = useState('errors');
  
  const handlePrintableReport = () => {
    generatePrintableReport(analysisData, problemDescription);
  };

  return (
    <div className="analyze-view">     
      <div className="analysis-tabs card">
        <div className="tabs-header" style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: '1rem' }}>
          <button 
            className={`tab-btn ${activeTab === 'errors' ? 'active' : ''}`}
            onClick={() => setActiveTab('errors')}
            style={{ 
              padding: '0.75rem 1.5rem', 
              background: 'transparent', 
              border: 'none',
              borderBottom: activeTab === 'errors' ? '3px solid var(--primary-color)' : '3px solid transparent',
              fontWeight: activeTab === 'errors' ? 'bold' : 'normal',
              cursor: 'pointer'
            }}
          >
            Common Errors
          </button>
          <button 
            className={`tab-btn ${activeTab === 'misconceptions' ? 'active' : ''}`}
            onClick={() => setActiveTab('misconceptions')}
            style={{ 
              padding: '0.75rem 1.5rem', 
              background: 'transparent', 
              border: 'none',
              borderBottom: activeTab === 'misconceptions' ? '3px solid var(--primary-color)' : '3px solid transparent',
              fontWeight: activeTab === 'misconceptions' ? 'bold' : 'normal',
              cursor: 'pointer'
            }}
          >
            Potential Misconceptions
          </button>
        </div>
        
        <div className="tabs-content">
          {activeTab === 'errors' && (
            <div className="errors-tab">
              <p style={{ marginBottom: '1rem' }}>
                The following errors were identified in student submissions, ordered by frequency:
              </p>
              
              {aggregate_analysis.top_errors.map((error, index) => (
                <ErrorItem 
                  key={index} 
                  error={error}
                  errorNumber={index + 1}
                  addToScreenQueue={addToScreenQueue}
                  studentSubmissions={codeSnapshots}
                  submissionTimes={submissionTimes}
                />
              ))}
            </div>
          )}
          
          {activeTab === 'misconceptions' && (
            <div className="misconceptions-tab">
              <p style={{ marginBottom: '1rem' }}>
                The following potential misconceptions were identified across student submissions:
              </p>
              
              {aggregate_analysis.potential_misconceptions.map((misconception, index) => (
                <MisconceptionCard 
                  key={index} 
                  misconception={misconception} 
                  addToScreenQueue={addToScreenQueue}
                  studentSubmissions={codeSnapshots}
                  expanded={true}
                  isRespond={true}
                  submissionTimes={submissionTimes}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {activeTab === 'errors' && (
        <div className="error-correlations card">
          <h3 className="section-title">Error Correlations</h3>
          <p style={{ marginBottom: '1rem' }}>
            These error correlations indicate potential relationships between different types of errors:
          </p>
          
          {aggregate_analysis.error_correlations.map((correlation, index) => (
            <CorrelationItem 
              key={index} 
              correlation={correlation} 
              addToScreenQueue={addToScreenQueue}
              studentSubmissions={codeSnapshots}
              submissionTimes={submissionTimes}
              errorNumbers={true}
            />
          ))}
        </div>
      )}

      <div className="student-list card">
        <h3 className="section-title">Code Snapshots</h3>
        <StudentTable 
          students={individual_assessment} 
          studentSubmissions={codeSnapshots}
          submissionTimes={submissionTimes}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div className="export-controls" style={{ display: 'flex', gap: '0.5rem',  marginLeft: 'auto' }}>
          <button 
            className="btn" 
            onClick={handlePrintableReport}
            style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
          >
            <Printer size={16} />
            Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnalyzeView;