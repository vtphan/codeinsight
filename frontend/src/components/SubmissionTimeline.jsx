// src/components/SubmissionTimeline.jsx
import { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register required Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const SubmissionTimeline = ({ studentSubmissions }) => {
  // Process submission data for timeline visualization
  const chartData = useMemo(() => {
    if (!studentSubmissions || !studentSubmissions.submissions || studentSubmissions.submissions.length === 0) {
      return null;
    }

    // Sort submissions by timestamp
    const sortedSubmissions = [...studentSubmissions.submissions].sort((a, b) => {
      return new Date(a.timestamp) - new Date(b.timestamp);
    });

    // Create time intervals
    const startTime = new Date(sortedSubmissions[0].timestamp);
    const endTime = new Date(sortedSubmissions[sortedSubmissions.length - 1].timestamp);
    
    // Create data points for cumulative submissions over time
    const dataPoints = [];
    const labels = [];
    
    // Create 10 time intervals between start and end
    const totalMinutes = (endTime - startTime) / (1000 * 60);
    // If all submissions happened at the exact same time, prevent division by zero
    const intervalMinutes = Math.max(1, Math.ceil(totalMinutes / 10));
    
    for (let i = 0; i <= 10; i++) {
      const currentTime = new Date(startTime.getTime() + i * intervalMinutes * 60 * 1000);
      
      // Count submissions up to this time
      const submissionsUpToTime = sortedSubmissions.filter(submission => 
        new Date(submission.timestamp) <= currentTime
      ).length;
      
      // Format time label
      const timeLabel = currentTime.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      
      labels.push(timeLabel);
      dataPoints.push(submissionsUpToTime);
    }
    
    return {
      labels,
      datasets: [
        {
          label: 'Cumulative Submissions',
          data: dataPoints,
          borderColor: '#2563eb',
          backgroundColor: 'rgba(37, 99, 235, 0.1)',
          tension: 0.3,
          fill: true,
        },
      ],
    };
  }, [studentSubmissions]);

  // Chart options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Submission Timeline',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `Submissions: ${context.raw}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Submissions'
        },
        ticks: {
          precision: 0
        }
      },
      x: {
        title: {
          display: true,
          text: 'Time'
        }
      }
    },
  };

  if (!chartData) {
    return <div>No submission data available for timeline.</div>;
  }

  return (
    <div className="submission-timeline">
      <div style={{ height: '300px' }}>
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

export default SubmissionTimeline;