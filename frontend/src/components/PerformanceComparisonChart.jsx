// src/components/PerformanceComparisonChart.jsx
import { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import './PerformanceComparisonChart.css';

// Register required Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const PerformanceComparisonChart = ({ 
  performanceData, 
  submissionTimes, 
  individualAssessment 
}) => {
  // Process and prepare chart data
  const chartData = useMemo(() => {
    if (!performanceData || !submissionTimes || !individualAssessment) {
      return null;
    }
    // Create sets of student IDs who have submitted
    const submittedStudentIds = new Set(
      submissionTimes.submission_times.map(sub => sub.student_id)
    );
    
    // Initialize data structures
    const overallData = {
      correct: performanceData.correct?.count || 0,
      incorrect: performanceData.incorrect?.count || 0,
      notAssessed: performanceData.not_assessed?.count || 0
    };
    
    // Initialize submitted data - only track assessed submissions
    const submittedData = {
      correct: 0,
      incorrect: 0,
      total: 0
    };
    
    const notSubmittedData = {
      notAssessed: 0
    };
    
    // Count performances by submission status
    individualAssessment.forEach(student => {
      const performanceLevel = student.performance_level;
      
      if (submittedStudentIds.has(student.student_id)) {
        submittedData.total++; // Track total submissions
        if (performanceLevel === 'Correct') {
          submittedData.correct++;
        } else if (performanceLevel === 'Incorrect') {
          submittedData.incorrect++;
        }
      } else {
        notSubmittedData.notAssessed++;
      }
    });

    // Calculate percentages for submitted data
    const submittedAssessed = submittedData.correct + submittedData.incorrect;
    submittedData.correctPercentage = submittedAssessed ? 
      (submittedData.correct / submittedAssessed) * submittedData.total : 0;
    submittedData.incorrectPercentage = submittedAssessed ? 
      (submittedData.incorrect / submittedAssessed) * submittedData.total : 0;
    
    return {
      overallData,
      submittedData,
      notSubmittedData
    };
  }, [performanceData, submissionTimes, individualAssessment]);
  
  // Prepare data for ChartJS
  const data = useMemo(() => {
    if (!chartData) return null;
    
    return {
      labels: ['Overall', 'Submitted', 'Not Submitted'],
      datasets: [
        {
          label: 'Correct',
          data: [
            chartData.overallData.correct,
            chartData.submittedData.correctPercentage,  // Use scaled percentage
            0
          ],
          backgroundColor: '#22c55e', // Green
        },
        {
          label: 'Incorrect',
          data: [
            chartData.overallData.incorrect,
            chartData.submittedData.incorrectPercentage,  // Use scaled percentage
            0
          ],
          backgroundColor: '#ef4444', // Red
        },
        {
          label: 'Not Assessed',
          data: [
            chartData.overallData.notAssessed,
            0,
            chartData.notSubmittedData.notAssessed
          ],
          backgroundColor: '#6b7280', // Gray
        }
      ]
    };
  }, [chartData]);
  
  // Chart options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        stacked: true,
        title: {
          display: true,
          text: 'Student Groups'
        }
      },
      y: {
        stacked: true,
        title: {
          display: true,
          text: 'Number of Students'
        },
        ticks: {
          precision: 0
        }
      }
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            const totalStudents = data.datasets.reduce(
              (sum, dataset) => sum + dataset.data[context.dataIndex], 
              0
            );
            const percentage = Math.round((value / totalStudents) * 100);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      },
      legend: {
        position: 'top',
      },
      title: {
        display: false,
      },
    },
  };
  
  if (!data) {
    return <div>No performance data available.</div>;
  }
  
  return (
    <div className="performance-comparison-chart">
      <div style={{ height: '550px' }}> 
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};

export default PerformanceComparisonChart;