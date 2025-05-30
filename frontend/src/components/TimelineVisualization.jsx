// src/components/TimelineVisualization.jsx
import { useMemo, useState, useCallback } from 'react';
import { Scatter } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  TimeScale
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import './TimelineVisualization.css';
import Modal from './Modal'; // Import the Modal component
import Prism from 'prismjs';
import 'prismjs/themes/prism.css';
import 'prismjs/components/prism-python';

// Register required Chart.js components
ChartJS.register(
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  TimeScale
);

const TimelineVisualization = ({ 
  codeSnapshots, 
  submissionTimes, 
  performanceData,
  problemDescription
}) => {
  const [sortBy, setSortBy] = useState('snapshot-time');
  const [selectedSnapshot, setSelectedSnapshot] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Process data for visualization
  const chartData = useMemo(() => {
    if (!codeSnapshots || !codeSnapshots.entries || !submissionTimes || !submissionTimes.submission_times || !performanceData || !problemDescription) {
      return null;
    }

    // Prepare datasets
    const snapshotDataset = [];
    const submissionDataset = [];
    const connectionLines = [];
    const problemStartPoint = [];
    
    // Get the problem start time as the baseline (time 0)
    const problemStartTime = new Date(problemDescription.timestamp);
    
    // Helper function to convert absolute time to relative minutes
    const getRelativeTime = (timestamp) => {
      const time = new Date(timestamp);
      return (time.getTime() - problemStartTime.getTime()) / (1000 * 60); // Convert to minutes
    };
    
    // Create a map of student IDs to their performance level
    const performanceMap = {};
    const performanceRankMap = {
      'Poor': 0,
      'Struggling': 1,
      'Good Progress': 2,
      'Strong': 3
    };
    
    performanceData.forEach(student => {
      performanceMap[student.student_id] = student.performance_level;
    });
    
    // Map performance levels to colors
    const getColorForPerformance = (level) => {
      if (!level) return '#6b7280'; // Default gray
      
      const levelLower = level.toLowerCase();
      if (levelLower.includes('poor')) return '#ef4444'; // Red
      if (levelLower.includes('struggling')) return '#f59e0b'; // Amber
      if (levelLower.includes('good')) return '#3b82f6'; // Blue
      if (levelLower.includes('strong')) return '#22c55e'; // Green
      
      return '#6b7280'; // Default gray
    };

    // Process snapshots and submissions
    const processedStudents = new Set();
    let studentYPositions = {};
    let nextYPosition = 1;
    
    // First, collect all student IDs
    const allStudentIds = [];
    
    codeSnapshots.entries.forEach(entry => {
      if (!processedStudents.has(entry.student_id)) {
        processedStudents.add(entry.student_id);
        allStudentIds.push({
          id: entry.student_id,
          snapshotTime: new Date(entry.timestamp),
          performance: performanceMap[entry.student_id] || 'Unknown'
        });
      }
    });
    
    submissionTimes.submission_times.forEach(submission => {
      if (!processedStudents.has(submission.student_id)) {
        processedStudents.add(submission.student_id);
        allStudentIds.push({
          id: submission.student_id,
          submissionTime: new Date(submission.timestamp), // Changed from submission.submission_times
          performance: performanceMap[submission.student_id] || 'Unknown'
        });
      } else {
        // Update the existing entry with submission time
        const studentEntry = allStudentIds.find(entry => entry.id === submission.student_id);
        if (studentEntry) {
          studentEntry.submissionTime = new Date(submission.timestamp); // Changed from submission.submission_times
        }
      }
    });
    
    // Sort student IDs based on the selected criteria
    if (sortBy === 'student-id') {
      allStudentIds.sort((a, b) => a.id - b.id);
    } else if (sortBy === 'performance') {
      allStudentIds.sort((a, b) => {
        const aRank = performanceRankMap[a.performance] || -1;
        const bRank = performanceRankMap[b.performance] || -1;
        return aRank - bRank;
      });
    } else if (sortBy === 'submission-time') {
      allStudentIds.sort((a, b) => {
        // Students who didn't submit come last
        if (!a.submissionTime && !b.submissionTime) return 0;
        if (!a.submissionTime) return 1;
        if (!b.submissionTime) return -1;
        
        return a.submissionTime - b.submissionTime;
      });
    } else if (sortBy === 'snapshot-time') {
      allStudentIds.sort((a, b) => {
        if (!a.snapshotTime && !b.snapshotTime) return 0;
        if (!a.snapshotTime) return 1;
        if (!b.snapshotTime) return -1;
        
        return a.snapshotTime - b.snapshotTime;
      });
    }
    
    // Assign y-positions to sorted student IDs
    allStudentIds.forEach(student => {
      studentYPositions[student.id] = nextYPosition++;
    });
    
    // Problem publication point (always at time 0)
    problemStartPoint.push({
      x: 0, // Changed from problemTime to 0
      y: 0,
      label: 'Problem Published'
    });
    
    // Now populate the datasets using relative time
    codeSnapshots.entries.forEach(entry => {
      const yPosition = studentYPositions[entry.student_id];
      const performanceLevel = performanceMap[entry.student_id];
      const color = getColorForPerformance(performanceLevel);
      
      snapshotDataset.push({
        x: getRelativeTime(entry.timestamp), // Convert to relative time
        y: yPosition,
        studentId: entry.student_id,
        timestamp: entry.timestamp,
        type: 'Snapshot',
        performance: performanceLevel || 'Unknown',
        color,
        content: entry.content
      });
    });
    
    submissionTimes.submission_times.forEach(submission => {
      const yPosition = studentYPositions[submission.student_id];
      const snapshotEntry = snapshotDataset.find(entry => entry.studentId === submission.student_id);
      
      submissionDataset.push({
        x: getRelativeTime(submission.timestamp), // Convert to relative time
        y: yPosition,
        studentId: submission.student_id,
        timestamp: submission.timestamp,
        type: 'Submission',
        performance: snapshotEntry?.performance || 'Unknown'
      });
      
      // Create connection line if both snapshot and submission exist
      if (snapshotEntry) {
        connectionLines.push({
          studentId: submission.student_id,
          snapshot: {
            x: snapshotEntry.x, // Already converted to relative time
            y: yPosition
          },
          submission: {
            x: getRelativeTime(submission.timestamp), // Convert to relative time
            y: yPosition
          }
        });
      }
    });
    
    return {
      snapshotDataset,
      submissionDataset,
      connectionLines,
      studentYPositions,
      problemStartPoint,
      problemStartTime // Add this for reference
    };
  }, [codeSnapshots, submissionTimes, performanceData, problemDescription, sortBy]);

  // Handle click on data points
  const handleDataPointClick = useCallback((event, elements) => {
    if (elements.length > 0) {
      const { datasetIndex, index } = elements[0];
      
      // Check if it's a code snapshot point (dataset index 1)
      if (datasetIndex === 1 && chartData && chartData.snapshotDataset[index]) {
        const snapshot = chartData.snapshotDataset[index];
        setSelectedSnapshot(snapshot);
        setIsModalOpen(true);
      }
    }
  }, [chartData]);

  // Close modal
  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedSnapshot(null);
  }, []);

  // Prepare ChartJS datasets
  const datasets = useMemo(() => {
    if (!chartData) return [];
    
    const datasets = [
      {
        label: 'Problem Start',
        data: chartData.problemStartPoint.map(item => ({
          x: item.x,
          y: item.y
        })),
        backgroundColor: '#000000',
        pointRadius: 8,
        pointStyle: 'star'
      },
      {
        label: 'Code Snapshots',
        data: chartData.snapshotDataset.map(item => ({
          x: item.x,
          y: item.y
        })),
        backgroundColor: chartData.snapshotDataset.map(item => item.color),
        pointRadius: 6,
        pointStyle: 'circle'
      },
      {
        label: 'Submissions',
        data: chartData.submissionDataset.map(item => ({
          x: item.x,
          y: item.y
        })),
        backgroundColor: '#6b7280',
        pointRadius: 6,
        pointStyle: 'triangle'
      }
    ];
    
    // Add connection lines as separate datasets
    chartData.connectionLines.forEach((line, index) => {
      datasets.push({
        label: `Connection ${index}`,
        data: [
          { x: line.snapshot.x, y: line.snapshot.y },
          { x: line.submission.x, y: line.submission.y }
        ],
        showLine: true,
        backgroundColor: 'transparent',
        borderColor: 'rgba(107, 114, 128, 0.3)',
        borderWidth: 1,
        tension: 0,
        pointRadius: 0,
        pointHoverRadius: 0
      });
    });
    
    return datasets;
  }, [chartData]);

  // Chart options
  const optionsConfig = useMemo(() => {
    if (!chartData) return {};
    
    return {
      responsive: true,
      maintainAspectRatio: false,
      onClick: handleDataPointClick,
      plugins: {
        tooltip: {
          callbacks: {
            label: function(context) {
              const datasetIndex = context.datasetIndex;
              
              if (datasetIndex === 0) {
                return ["Problem Published", "Time: 0 minutes"];
              } else if (datasetIndex === 1 && chartData.snapshotDataset[context.dataIndex]) {
                const item = chartData.snapshotDataset[context.dataIndex];
                return [
                  `Student: ${item.studentId}`, 
                  `Type: ${item.type}`, 
                  `Time: +${Math.round(item.x)} minutes`, // Show relative time
                  `Performance: ${item.performance}`, 
                  'Click to view code'
                ];
              } else if (datasetIndex === 2 && chartData.submissionDataset[context.dataIndex]) {
                const item = chartData.submissionDataset[context.dataIndex];
                return [
                  `Student: ${item.studentId}`, 
                  `Type: ${item.type}`, 
                  `Time: +${Math.round(item.x)} minutes` // Show relative time
                ];
              }
              return '';
            }
          }
        },
        legend: {
          display: false
        },
      },
      scales: {
        x: {
          type: 'linear', // Changed from 'time' to 'linear'
          title: {
            display: true,
            text: 'Time (minutes from problem start)' // Updated title
          },
          min: 0, // Always start from 0
          max: (() => {
            // Find the latest relative time in the data
            const allRelativeTimes = [
              ...chartData.snapshotDataset.map(item => item.x),
              ...chartData.submissionDataset.map(item => item.x)
            ];
            const latestTime = Math.max(...allRelativeTimes);
            // Add 1 minute buffer to the latest time
            return Math.ceil(latestTime) + 1;
          })(),
          ticks: {
            callback: function(value) {
              return `${Math.round(value)}m`; // Format as "15m", "30m", etc.
            }
          }
        },
        y: {
          title: {
            display: true,
            text: 'Students'
          },
          ticks: {
            callback: function(value) {
              if (value === 0) {
                return '';
              }
              if (value === Math.floor(value)) {
                for (const [studentId, yPos] of Object.entries(chartData.studentYPositions)) {
                  if (yPos === value) {
                    return `Student ${studentId}`;
                  }
                }
              }
              return '';
            }
          }
        }
      },
    };
  }, [chartData, handleDataPointClick]);

  if (!chartData) {
    return <div>No timeline data available.</div>;
  }

  return (
    <div className="timeline-visualization">
      <div style={{ height: '550px' }}>
        <Scatter data={{ datasets }} options={optionsConfig} />
      </div>
      <div className="sorting-controls" style={{ 
        marginTop: '1rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', fontSize: '0.8rem' }}>
        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
          <input
            type="radio"
            name="sortBy"
            value="performance"
            checked={sortBy === 'performance'}
            onChange={(e) => setSortBy(e.target.value)}
            style={{ marginRight: '0.35rem' }}
          />
          Performance
        </label>

        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
          <input
            type="radio"
            name="sortBy"
            value="submission-time"
            checked={sortBy === 'submission-time'}
            onChange={(e) => setSortBy(e.target.value)}
            style={{ marginRight: '0.35rem' }}
          />
          Submission
        </label>
        
        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
          <input
            type="radio"
            name="sortBy"
            value="snapshot-time"
            checked={sortBy === 'snapshot-time'}
            onChange={(e) => setSortBy(e.target.value)}
            style={{ marginRight: '0.35rem' }}
          />
          Snapshot
        </label>

        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
          <input
            type="radio"
            name="sortBy"
            value="student-id"
            checked={sortBy === 'student-id'}
            onChange={(e) => setSortBy(e.target.value)}
            style={{ marginRight: '0.35rem' }}
          />
          Student
        </label>
      </div>
      </div>
      
      {/* Modal for displaying code snapshot */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        title={selectedSnapshot ? `Student ${selectedSnapshot.studentId} Code Snapshot` : 'Code Snapshot'}
      >
        {selectedSnapshot && (
          <div style={{ position: 'relative' }}>
            <div style={{ 
              position: 'absolute', 
              top: '0', 
              right: '0', 
              padding: '5px 10px',
              backgroundColor: selectedSnapshot.color,
              color: 'white',
              borderRadius: '4px',
              fontSize: '0.8rem',
              fontWeight: 'bold'
            }}>
              {selectedSnapshot.performance}
            </div>
            <div style={{ 
              marginTop: '10px', 
              marginBottom: '10px',
              fontSize: '0.9rem',
              color: '#666'
            }}>
              Timestamp: {new Date(selectedSnapshot.timestamp).toLocaleString()}
            </div>
            <pre 
              style={{
                backgroundColor: '#f5f5f5',
                padding: '15px',
                borderRadius: '4px',
                overflow: 'auto',
                maxHeight: '60vh',
                whiteSpace: 'pre-wrap',
                fontSize: '0.9rem'
              }}
              dangerouslySetInnerHTML={{
                __html: Prism.highlight(
                  selectedSnapshot.content, 
                  Prism.languages.python, 
                  'python'
                )
              }}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TimelineVisualization;