// src/data.js
// Import JSON data from data directory
import analysisDataRaw from './data/data-gemini.json';
import problemDescriptionRaw from './data/problem-description.json';
import codeSnapshotsRaw from './data/codesnapshots.json';
import submissionTimesRaw from './data/submission-times.json';
import taInterventions from './data/TA-Interventions.json';

// Export the datasets
export const analysisData = analysisDataRaw;
export const problemDescription = problemDescriptionRaw;
export const codeSnapshots = codeSnapshotsRaw;
export const submissionTimes = submissionTimesRaw;
export const taInterventionTimes = taInterventions;
