// src/components/PerformanceChart.jsx
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale
} from 'chart.js';

// Register required Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale);

const PerformanceChart = ({ performanceData, title }) => {
  // Extract data from the performance distribution
  const labels = Object.keys(performanceData).map(key => 
    key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  );
  
  const counts = Object.values(performanceData).map(item => item.count);
  const percentages = Object.values(performanceData).map(item => 
    parseFloat(item.percentage.replace('%', ''))
  );

  // Define colors for each performance level
  const backgroundColors = [
    '#ef4444', // poor - red
    '#f59e0b', // struggling - amber
    '#3b82f6', // good_progress - blue
    '#22c55e', // strong - green
  ];

  // Chart data
  const data = {
    labels,
    datasets: [
      {
        data: counts,
        backgroundColor: backgroundColors,
        borderColor: 'white',
        borderWidth: 2,
      },
    ],
  };

  // Chart options
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw || 0;
            const percentage = percentages[context.dataIndex] || 0;
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
    cutout: '60%',
  };

  return (
    <div className="performance-chart-container">
      {title && <h3 className="section-title">{title}</h3>}
      <div className="chart-wrapper" style={{ height: '300px' }}>
        <Doughnut data={data} options={options} />
      </div>
      <div className="performance-summary">
        <div className="summary-item">
          <span className="summary-label">Total:</span>
          <span className="summary-value">{counts.reduce((a, b) => a + b, 0)}</span>
        </div>
      </div>
    </div>
  );
};

export default PerformanceChart;