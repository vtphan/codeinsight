// src/utils/exportUtils.js

/**
 * Export data as a JSON file for download
 * @param {Object} data - The data to export
 * @param {string} filename - The name of the file to download
 */
export const exportAsJson = (data, filename) => {
    // Create a Blob with the data
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    
    // Create a download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || 'export.json';
    
    // Append to body, click to download, then remove
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
  };
  
  /**
   * Export an analysis report as a CSV file
   * @param {Object} analysisData - The analysis data object
   * @param {string} filename - The name of the file to download
   */
  export const exportAnalysisAsCsv = (analysisData, filename) => {
    // Create CSV content
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Add headers
    csvContent += "Exercise,Total Submissions,Poor,Struggling,Good Progress,Strong\n";
    
    // Add data row
    const { problem_summary, overall_assessment } = analysisData;
    const { performance_distribution } = overall_assessment;
    
    csvContent += [
      problem_summary.title,
      overall_assessment.total_submissions,
      performance_distribution.poor.count,
      performance_distribution.struggling.count,
      performance_distribution.good_progress.count,
      performance_distribution.strong.count
    ].join(",") + "\n";
    
    // Add error analysis
    csvContent += "\nTop Errors,Occurrence Percentage\n";
    analysisData.aggregate_analysis.top_errors.forEach(error => {
      csvContent += `"${error.category}",${error.occurrence_percentage}\n`;
    });
    
    // Add misconceptions
    csvContent += "\nMisconceptions,Occurrence Percentage\n";
    analysisData.aggregate_analysis.potential_misconceptions.forEach(misconception => {
      csvContent += `"${misconception.misconception}",${misconception.occurrence_percentage}\n`;
    });
    
    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename || "analysis.csv");
    
    // Append to body, click to download, then remove
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(link);
    }, 100);
  };
  
  /**
   * Generate a printable HTML report
   * @param {Object} analysisData - The analysis data object
   * @param {Object} problemDescription - The problem description object
   */
  export const generatePrintableReport = (analysisData, problemDescription) => {
    // Create a new window
    const printWindow = window.open('', '_blank');
    
    // Create HTML content
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Analysis Report: ${analysisData.problem_summary.title}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1, h2, h3 { color: #2563eb; }
          table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
          th, td { border: 1px solid #e2e8f0; padding: 8px; text-align: left; }
          th { background-color: #f1f5f9; }
          .code { font-family: monospace; background-color: #f1f5f9; padding: 10px; border-radius: 5px; white-space: pre-wrap; }
          @media print {
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="text-align: right;">
          <button onclick="window.print()">Print Report</button>
        </div>
        
        <h1>Analysis Report: ${analysisData.problem_summary.title}</h1>
        <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
        
        <h2>Problem Description</h2>
        <div class="code">${problemDescription.problem_description}</div>
        
        <h2>Overall Performance</h2>
        <table>
          <tr>
            <th>Total Submissions</th>
            <th>Poor</th>
            <th>Struggling</th>
            <th>Good Progress</th>
            <th>Strong</th>
          </tr>
          <tr>
            <td>${analysisData.overall_assessment.total_submissions}</td>
            <td>${analysisData.overall_assessment.performance_distribution.poor.count} (${analysisData.overall_assessment.performance_distribution.poor.percentage})</td>
            <td>${analysisData.overall_assessment.performance_distribution.struggling.count} (${analysisData.overall_assessment.performance_distribution.struggling.percentage})</td>
            <td>${analysisData.overall_assessment.performance_distribution.good_progress.count} (${analysisData.overall_assessment.performance_distribution.good_progress.percentage})</td>
            <td>${analysisData.overall_assessment.performance_distribution.strong.count} (${analysisData.overall_assessment.performance_distribution.strong.percentage})</td>
          </tr>
        </table>
        
        <h2>Top Errors</h2>
        <table>
          <tr>
            <th>Error Category</th>
            <th>Occurrence</th>
            <th>Description</th>
          </tr>
          ${analysisData.aggregate_analysis.top_errors.map(error => `
            <tr>
              <td>${error.category}</td>
              <td>${error.occurrence_percentage}</td>
              <td>${error.description}</td>
            </tr>
          `).join('')}
        </table>
        
        <h2>Potential Misconceptions</h2>
        ${analysisData.aggregate_analysis.potential_misconceptions.map(misconception => `
          <div style="margin-bottom: 20px;">
            <h3>${misconception.misconception} (${misconception.occurrence_percentage})</h3>
            <p><strong>Diagnostic:</strong> ${misconception.explanation_diagnostic}</p>
            <p><strong>Suggested Explanation for Students:</strong> ${misconception.suggested_explanation_for_students}</p>
            <div>
              <p><strong>Example of Error:</strong></p>
              <div class="code">${Array.isArray(misconception.example_code_error) ? misconception.example_code_error.join('\n') : misconception.example_code_error}</div>
            </div>
            <div>
              <p><strong>Correct Example:</strong></p>
              <div class="code">${Array.isArray(misconception.correct_code_example) ? misconception.correct_code_example.join('\n') : misconception.correct_code_example}</div>
            </div>
            <p><strong>Follow-up Question:</strong> ${misconception.follow_up_question}</p>
          </div>
        `).join('')}
      </body>
      </html>
    `;
    
    // Write content to new window
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };