import { useState, useEffect, useCallback } from "react";
import MonitorView from "./views/MonitorView";
import AnalyzeView from "./views/AnalyzeView";
import RespondView from "./views/RespondView";
import PresentationMode from "./components/PresentationMode";
import ScreenQueueIndicator from "./components/ScreenQueueIndicator";
import Modal from "./components/Modal";

import "./App.css";

function App() {
  const [activeView, setActiveView] = useState("monitor");
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

  const handleRegenerate = () => {
    const confirmed = window.confirm("This will send student codesnapshots to AI for analysis. Are you sure you want to do it?");
    if (!confirmed){
      return Promise.reject(new Error("User cancelled"));
    }
  
    const urlParams = new URLSearchParams(window.location.search);
    // const problemId = urlParams.get("problem_id")
    const problemId = 23;
    const regenerate = true;
    return fetch(`http://127.0.0.1:8082/api/data?problem_id=${problemId}&regenerate=${regenerate}`)
    // return fetch(`${window.location.origin}/api/data?problem_id=${problemId}&regenerate=${regenerate}`)

      .then((res) => {
        if (!res.ok) throw new Error("Failed to regenerate data");
        return res.json();
      })
      .then((data) => {
        const timestamp = new Date().toLocaleString();
        console.log(`[${timestamp}] 🔁 Regenerated data from backend:`, data);
  
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
        throw err; // Re-throw to be handled by the component
      });
  };
  
  const fetchData = useCallback(() => {
    const urlParams = new URLSearchParams(window.location.search);
    // const problemId = urlParams.get("problem_id")
    const problemId = 23; 
    const regenerate = false;

    fetch(`http://127.0.0.1:8082/api/data?problem_id=${problemId}&regenerate=${regenerate}`)
    // fetch(`${window.location.origin}/api/data?problem_id=${problemId}&regenerate=${regenerate}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch data");
        return res.json();
      })
      .then((data) => {
        const timestamp = new Date().toLocaleString();
        console.log(`[${timestamp}] 🔄 Data refresh from backend:`, data);

        Object.keys(localStorage)
          .filter((key) => key.startsWith("misconception-edit-"))
          .forEach((key) => localStorage.removeItem(key));

        setAnalysisData(data.analysisData);
        setProblemDescription(data.problemDescription);
        setCodeSnapshots(data.codeSnapshots);
        setSubmissionTimes(data.submissionTimes);
        setTaInterventionTimes(data.taInterventions);
        setError(null);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
      });
  }, []); // Empty dependency array since we're using constant values

  // Keep the periodic refresh
  useEffect(() => {
    // Initial fetch
    fetchData();
    
    // Set interval to fetch every 10 seconds
    const intervalId = setInterval(fetchData, 10000);
    
    // Cleanup on unmount
    return () => clearInterval(intervalId);
  }, [fetchData]);

  // Add event listeners for code grading and feedback
  useEffect(() => {
    const handleCodeGraded = () => {
      console.log('Code graded, refreshing data...');
      fetchData();
    };

    const handleFeedbackSent = () => {
      console.log('Feedback sent, refreshing data...');
      fetchData();
    };

    // Add event listeners
    window.addEventListener('codeGraded', handleCodeGraded);
    window.addEventListener('feedbackSent', handleFeedbackSent);

    // Cleanup
    return () => {
      window.removeEventListener('codeGraded', handleCodeGraded);
      window.removeEventListener('feedbackSent', handleFeedbackSent);
    };
  }, [fetchData]);

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
    )
      return;
    const newQueue = [...screenQueue];
    const [movedItem] = newQueue.splice(fromIndex, 1);
    newQueue.splice(toIndex, 0, movedItem);
    setScreenQueue(newQueue);
  };
  const togglePresentationMode = () => {
    setIsPresentationMode(!isPresentationMode);
  };

  const handleHomeClick = () => {
    // Get the base URL by using the origin property
    const baseUrl = window.location.origin;
    window.location.href = baseUrl;
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
        <div style={{ whiteSpace: "pre-line" }}>
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
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <button
                onClick={handleHomeClick}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  fontSize: '1rem',
                  color: 'var(--primary-color)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  borderRadius: '0.375rem',
                  fontWeight: '800'
                }}
                title="home"
              >
                Home
              </button>
              <h3
                onClick={() => setIsModalOpen(true)}
                style={{ cursor: "pointer" }}
              >
                {analysisData.problem_summary.title}
              </h3>
            </div>
            
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <ScreenQueueIndicator
                screenQueue={screenQueue}
                removeFromScreenQueue={removeFromScreenQueue}
                moveInScreenQueue={moveInScreenQueue}
                onStartPresentation={togglePresentationMode}
              />
              <nav className="app-nav">
                <button
                  className={`nav-tab ${activeView === "monitor" ? "active" : ""}`}
                  onClick={() => setActiveView("monitor")}
                  title="what students are doing"
                >
                  Monitor
                </button>
                <button
                  className={`nav-tab ${activeView === "analyze" ? "active" : ""}`}
                  onClick={() => setActiveView("analyze")}
                  title="mistakes are they making"
                >
                  Analysis
                </button>
                {/* <button
                  className={activeView === "respond" ? "active" : ""}
                  onClick={() => setActiveView("respond")}
                  title="to address mistakes"
                  disabled={!analysisData.isEnable}
                >
                  Respond
                </button> */}
                
              </nav>
            </div>
          </header>

          <main className="app-content">
            {activeView === "monitor" && (
              <MonitorView
                analysisData={analysisData}
                problemDescription={problemDescription}
                codeSnapshots={codeSnapshots}
                submissionTimes={submissionTimes}
                taInterventionTimes={taInterventionTimes}
                onDataUpdate={fetchData}
              />
            )}
            {activeView === "analyze" && (
              <AnalyzeView
                analysisData={analysisData}
                problemDescription={problemDescription}
                codeSnapshots={codeSnapshots}
                submissionTimes={submissionTimes}
                screenQueue={screenQueue}
                addToScreenQueue={addToScreenQueue}
                handleRegenerate={handleRegenerate}
              />
            )}
            {/* {activeView === "respond" && (
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
            )} */}
          </main>
        </>
      )}
    </div>
  );
}

export default App;
