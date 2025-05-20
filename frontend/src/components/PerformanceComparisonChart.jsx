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
    
    // Organize performance data
    const overallData = {
      poor: performanceData.poor?.count || 0,
      struggling: performanceData.struggling?.count || 0,
      good_progress: performanceData.good_progress?.count || 0,
      strong: performanceData.strong?.count || 0
    };
    
    // Initialize submitted and not submitted data
    const submittedData = {
      poor: 0,
      struggling: 0,
      good_progress: 0,
      strong: 0
    };
    
    const notSubmittedData = {
      poor: 0,
      struggling: 0,
      good_progress: 0,
      strong: 0
    };
    
    // Count performances by submission status
    individualAssessment.forEach(student => {
      const performanceLevel = student.performance_level.toLowerCase().replace(' ', '_');
      if (submittedStudentIds.has(student.student_id)) {
        submittedData[performanceLevel]++;
      } else {
        notSubmittedData[performanceLevel]++;
      }
    });
    
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
          label: 'Strong',
          data: [
            chartData.overallData.strong,
            chartData.submittedData.strong,
            chartData.notSubmittedData.strong
          ],
          backgroundColor: '#22c55e', // Green
        },
        {
          label: 'Good Progress',
          data: [
            chartData.overallData.good_progress,
            chartData.submittedData.good_progress,
            chartData.notSubmittedData.good_progress
          ],
          backgroundColor: '#3b82f6', // Blue
        },
        {
          label: 'Struggling',
          data: [
            chartData.overallData.struggling,
            chartData.submittedData.struggling,
            chartData.notSubmittedData.struggling
          ],
          backgroundColor: '#f59e0b', // Amber
        },
        {
          label: 'Poor',
          data: [
            chartData.overallData.poor,
            chartData.submittedData.poor,
            chartData.notSubmittedData.poor
          ],
          backgroundColor: '#ef4444', // Red
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