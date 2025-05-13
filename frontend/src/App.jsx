import { useState, useEffect } from 'react';
import MonitorView from './views/MonitorView';
import AnalyzeView from './views/AnalyzeView';
import RespondView from './views/RespondView';
import PresentationMode from './components/PresentationMode';
import ScreenQueueIndicator from './components/ScreenQueueIndicator';
import Modal from './components/Modal';

import './App.css';

function App() {
  const [activeView, setActiveView] = useState('monitor');
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const [screenQueue, setScreenQueue] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Data state
  const [analysisData, setAnalysisData] = useState(null);
  const [problemDescription, setProblemDescription] = useState(null);
  const [codeSnapshots, setCodeSnapshots] = useState(null);
  const [submissionTimes, setSubmissionTimes] = useState(null);
  const [taInterventionTimes, setTaInterventionTimes] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('http://localhost:8080/api/data')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch data');
        return res.json();
      })
      .then((data) => {
        const timestamp = new Date().toLocaleString();
        console.log(`[${timestamp}] 📡 Data loaded from backend:`, data);

        // 🧹 Clear misconception-related localStorage
        Object.keys(localStorage)
          .filter((key) => key.startsWith("misconception-edit-"))
          .forEach((key) => localStorage.removeItem(key));

        setAnalysisData(data.analysisData);
        setProblemDescription(data.problemDescription);
        setCodeSnapshots(data.codeSnapshots);
        setSubmissionTimes(data.submissionTimes);
        setTaInterventionTimes(data.taInterventions);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
      });
  }, []);

  const addToScreenQueue = (item) => setScreenQueue([...screenQueue, item]);
  const removeFromScreenQueue = (index) => {
    const newQueue = [...screenQueue];
    newQueue.splice(index, 1);
    setScreenQueue(newQueue);
  };
  const moveInScreenQueue = (fromIndex, toIndex) => {
    if (
      fromIndex < 0 ||
      fromIndex >= screenQueue.length ||
      toIndex < 0 ||
      toIndex >= screenQueue.length
    ) return;
    const newQueue = [...screenQueue];
    const [movedItem] = newQueue.splice(fromIndex, 1);
    newQueue.splice(toIndex, 0, movedItem);
    setScreenQueue(newQueue);
  };
  const togglePresentationMode = () => {
    setIsPresentationMode(!isPresentationMode);
  };

  if (error) return <div className="app">Error: {error}</div>;
  if (
    !analysisData ||
    !problemDescription ||
    !codeSnapshots ||
    !submissionTimes ||
    !taInterventionTimes
  ) {
    return <div className="app">Loading data...</div>;
  }

  return (
    <div className="app">
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Problem Description"
      >
        <div style={{ whiteSpace: 'pre-line' }}>
          {problemDescription.problem_description}
        </div>
      </Modal>

      {isPresentationMode ? (
        <PresentationMode
          items={screenQueue}
          onClose={togglePresentationMode}
        />
      ) : (
        <>
          <header className="app-header">
            <h3
              onClick={() => setIsModalOpen(true)}
              style={{ cursor: 'pointer' }}
            >
              {analysisData.problem_summary.title}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <ScreenQueueIndicator
                screenQueue={screenQueue}
                removeFromScreenQueue={removeFromScreenQueue}
                moveInScreenQueue={moveInScreenQueue}
                onStartPresentation={togglePresentationMode}
              />
              <nav className="app-nav">
                <button
                  className={activeView === 'monitor' ? 'active' : ''}
                  onClick={() => setActiveView('monitor')}
                  title="what students are doing"
                >
                  Monitor
                </button>
                <button
                  className={activeView === 'analyze' ? 'active' : ''}
                  onClick={() => setActiveView('analyze')}
                  title="mistakes are they making"
                >
                  Analyze
                </button>
                <button
                  className={activeView === 'respond' ? 'active' : ''}
                  onClick={() => setActiveView('respond')}
                  title="to address mistakes"
                >
                  Respond
                </button>
              </nav>
            </div>
          </header>

          <main className="app-content">
            {activeView === 'monitor' && (
              <MonitorView
                analysisData={analysisData}
                problemDescription={problemDescription}
                codeSnapshots={codeSnapshots}
                submissionTimes={submissionTimes}
                taInterventionTimes={taInterventionTimes}
              />
            )}
            {activeView === 'analyze' && (
              <AnalyzeView
                analysisData={analysisData}
                problemDescription={problemDescription}
                codeSnapshots={codeSnapshots}
                submissionTimes={submissionTimes}
                screenQueue={screenQueue}
                addToScreenQueue={addToScreenQueue}
              />
            )}
            {activeView === 'respond' && (
              <RespondView
                analysisData={analysisData}
                problemDescription={problemDescription}
                codeSnapshots={codeSnapshots}
                submissionTimes={submissionTimes}
                screenQueue={screenQueue}
                addToScreenQueue={addToScreenQueue}
                removeFromScreenQueue={removeFromScreenQueue}
                moveInScreenQueue={moveInScreenQueue}
                onStartPresentation={togglePresentationMode}
              />
            )}
          </main>
        </>
      )}
    </div>
  );
}

export default App;
