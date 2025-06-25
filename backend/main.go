package main

import (
	"bufio"
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"regexp"
	"strings"
	"time"
)

type CodeSnapshot struct {
	StudentID  int    `json:"student_id"`
	Timestamp  string `json:"timestamp"`
	Content    string `json:"content"`
	Grade      string `json:"grade"`
	SnapshotId int    `json:"snapshot_id"`
}

type CodeSnapshots struct {
	Entries []CodeSnapshot `json:"entries"`
}

func main() {
	// Load environment variables from .env file
	loadEnv()

	// API route
	http.HandleFunc("/api/data", handleMergedData)

	// Static frontend under /dashboard
	http.Handle("/dashboard/", http.StripPrefix("/dashboard", http.HandlerFunc(dashboardHandler)))

	log.Println("🚀 Server running at http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}

// loadEnv loads environment variables from .env file
func loadEnv() {
	file, err := os.Open(".env")
	if err != nil {
		log.Println("No .env file found, using system environment variables")
		return
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}

		parts := strings.SplitN(line, "=", 2)
		if len(parts) == 2 {
			key := strings.TrimSpace(parts[0])
			value := strings.TrimSpace(parts[1])
			// Remove quotes if present
			if (strings.HasPrefix(value, "\"") && strings.HasSuffix(value, "\"")) ||
				(strings.HasPrefix(value, "'") && strings.HasSuffix(value, "'")) {
				value = value[1 : len(value)-1]
			}
			os.Setenv(key, value)
			log.Printf("Loaded environment variable: %s", key)
		}
	}
}

func dashboardHandler(w http.ResponseWriter, r *http.Request) {
	requestPath := "./dist" + r.URL.Path

	// If the file exists, serve it
	if stat, err := os.Stat(requestPath); err == nil && !stat.IsDir() {
		http.ServeFile(w, r, requestPath)
		return
	}

	// Otherwise serve index.html for SPA routing
	http.ServeFile(w, r, "./dist/index.html")
}

func handleMergedData(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusNoContent)
		return
	}

	// Check if this is a request to trigger AI analysis
	regenerate := r.URL.Query().Get("regenerate")
	if regenerate == "true" {
		// Perform AI analysis and update data.json
		_, err := performAIAnalysisAndSave()
		if err != nil {
			http.Error(w, fmt.Sprintf("Failed to perform AI analysis: %v", err), http.StatusInternalServerError)
			return
		}
		log.Println("AI analysis completed and saved to data.json")
	}

	// Always read and return the data.json file (whether updated or not)
	data, err := os.ReadFile("data/data.json")
	if err != nil {
		http.Error(w, "Failed to read data/data.json", http.StatusInternalServerError)
		return
	}

	// Parse the JSON to ensure it's valid
	var parsed interface{}
	if err := json.Unmarshal(data, &parsed); err != nil {
		http.Error(w, "Invalid JSON in data/data.json", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(parsed)
}

// performAIAnalysisAndSave performs AI analysis and saves results to data.json
func performAIAnalysisAndSave() (interface{}, error) {
	// Read dummy data from the JSON file
	data, err := os.ReadFile("data/data.json")
	if err != nil {
		return nil, fmt.Errorf("failed to read data.json: %v", err)
	}

	// Parse the existing data structure
	var dataStructure map[string]interface{}
	if err := json.Unmarshal(data, &dataStructure); err != nil {
		return nil, fmt.Errorf("failed to parse data.json: %v", err)
	}

	// Extract the specific fields we need for analysis
	var problemDesc string
	var codeSnapshots []CodeSnapshot
	var gradeMap map[int]string

	// Extract problem description
	if probSummary, ok := dataStructure["problemDescription"].(map[string]interface{}); ok {
		if desc, ok := probSummary["problem_description"].(string); ok {
			problemDesc = desc
		}
	}

	// Extract code snapshots
	if snapData, ok := dataStructure["codeSnapshots"].(map[string]interface{}); ok {
		if entries, ok := snapData["entries"].([]interface{}); ok {
			for _, entry := range entries {
				if entryMap, ok := entry.(map[string]interface{}); ok {
					snapshot := CodeSnapshot{}
					if id, ok := entryMap["student_id"].(float64); ok {
						snapshot.StudentID = int(id)
					}
					if ts, ok := entryMap["timestamp"].(string); ok {
						snapshot.Timestamp = ts
					}
					if content, ok := entryMap["content"].(string); ok {
						snapshot.Content = content
					}
					if grade, ok := entryMap["grade"].(string); ok {
						snapshot.Grade = grade
					}
					if snapId, ok := entryMap["snapshot_id"].(float64); ok {
						snapshot.SnapshotId = int(snapId)
					}
					codeSnapshots = append(codeSnapshots, snapshot)
				}
			}
		}
	}

	// Extract individual assessment data to create grade map
	gradeMap = make(map[int]string)
	if analysisData, ok := dataStructure["analysisData"].(map[string]interface{}); ok {
		if individualAssessment, ok := analysisData["individual_assessment"].([]interface{}); ok {
			for _, assessment := range individualAssessment {
				if assessmentMap, ok := assessment.(map[string]interface{}); ok {
					if studentId, ok := assessmentMap["student_id"].(float64); ok {
						if perfLevel, ok := assessmentMap["performance_level"].(string); ok {
							gradeMap[int(studentId)] = perfLevel
						}
					}
				}
			}
		}
	}

	// Get the latest snapshot for each student
	latestSnapshots := getLatestSnapshotsPerStudent(codeSnapshots)

	// Call the modified makeRequest function
	aiResult, err := makeRequest(
		problemDesc,
		latestSnapshots,
		len(latestSnapshots),
		23, // dummy problem ID
		gradeMap,
	)

	if err != nil {
		return nil, fmt.Errorf("makeRequest failed: %v", err)
	}

	// Create the analysis data structure to save
	analysisDataToSave := map[string]interface{}{
		"problem_summary": map[string]interface{}{
			"title": "AI Generated Analysis",
		},
		"isEnable":              true,
		"overall_assessment":    calculateOverallAssessment(latestSnapshots, gradeMap),
		"individual_assessment": createIndividualAssessment(latestSnapshots, gradeMap),
		"aggregate_analysis":    aiResult,
	}

	// Update the analysisData field in the existing data structure
	dataStructure["analysisData"] = analysisDataToSave

	// Write back to data.json
	updatedData, err := json.MarshalIndent(dataStructure, "", "  ")
	if err != nil {
		return nil, fmt.Errorf("failed to marshal updated data: %v", err)
	}

	if err := os.WriteFile("data/data.json", updatedData, 0644); err != nil {
		return nil, fmt.Errorf("failed to write updated data.json: %v", err)
	}

	log.Printf("AI Analysis completed and saved to data.json. Found %d top errors, %d correlations, %d misconceptions",
		len(aiResult.TopErrors), len(aiResult.ErrorCorrelations), len(aiResult.PotentialMisconceptions))

	return analysisDataToSave, nil
}

// calculateOverallAssessment calculates performance distribution
func calculateOverallAssessment(snapshots []CodeSnapshot, gradeMap map[int]string) map[string]interface{} {
	totalStudents := len(snapshots)
	correct := 0
	incorrect := 0
	notAssessed := 0

	for _, snapshot := range snapshots {
		grade, exists := gradeMap[snapshot.StudentID]
		if !exists {
			grade = "NotAssessed"
		}

		switch grade {
		case "Correct":
			correct++
		case "Incorrect":
			incorrect++
		default:
			notAssessed++
		}
	}

	return map[string]interface{}{
		"total_entries": totalStudents,
		"performance_distribution": map[string]interface{}{
			"correct": map[string]interface{}{
				"count":      correct,
				"percentage": fmt.Sprintf("%.2f%%", float64(correct)/float64(totalStudents)*100),
			},
			"incorrect": map[string]interface{}{
				"count":      incorrect,
				"percentage": fmt.Sprintf("%.2f%%", float64(incorrect)/float64(totalStudents)*100),
			},
			"not_assessed": map[string]interface{}{
				"count":      notAssessed,
				"percentage": fmt.Sprintf("%.2f%%", float64(notAssessed)/float64(totalStudents)*100),
			},
		},
	}
}

// createIndividualAssessment creates individual assessment array
func createIndividualAssessment(snapshots []CodeSnapshot, gradeMap map[int]string) []map[string]interface{} {
	var assessments []map[string]interface{}

	for _, snapshot := range snapshots {
		grade, exists := gradeMap[snapshot.StudentID]
		if !exists {
			grade = "NotAssessed"
		}

		assessments = append(assessments, map[string]interface{}{
			"student_id":        snapshot.StudentID,
			"performance_level": grade,
		})
	}

	return assessments
}

// getLatestSnapshotsPerStudent returns the latest snapshot for each student
func getLatestSnapshotsPerStudent(snapshots []CodeSnapshot) []CodeSnapshot {
	studentLatest := make(map[int]CodeSnapshot)

	for _, snapshot := range snapshots {
		if existing, found := studentLatest[snapshot.StudentID]; !found {
			studentLatest[snapshot.StudentID] = snapshot
		} else {
			// Compare timestamps to keep the latest one
			existingTime, _ := time.Parse("2006-01-02 15:04:05", existing.Timestamp)
			currentTime, _ := time.Parse("2006-01-02 15:04:05", snapshot.Timestamp)
			if currentTime.After(existingTime) {
				studentLatest[snapshot.StudentID] = snapshot
			}
		}
	}

	// Convert map to slice
	var result []CodeSnapshot
	for _, snapshot := range studentLatest {
		result = append(result, snapshot)
	}

	return result
}

func makeRequest(problemDescription string, formattedSnapshots []CodeSnapshot, NumberOfStudents, problemID int, gradeMap map[int]string) (AggregateAnalysis, error) {

	NewInstructions := `# LLM Prompt: Analyze, Assess, and Generate Remediation Ideas for CS1 Student Code Submissions

## Role and Goal

You are an expert AI assistant specializing in analyzing and assessing student code submissions for introductory computer science exercises (CS1/CS2 level). Your goal is to process a batch of student code submissions for a specific programming problem, **evaluate each submission's likely correctness and adherence to requirements based *solely* on static code analysis**, and generate a structured JSON summary. This summary should provide instructors with actionable insights for **Monitoring** student progress (performance levels), **Analyzing** common issues (errors, correlations, misconceptions), and **Responding** with targeted instructional support (explanations, examples, follow-up questions).

## CRITICAL: JSON OUTPUT REQUIREMENTS

Your response MUST be valid JSON only. Do not include any text before or after the JSON. Do not wrap it in markdown code blocks. Do not include comments in the JSON. Ensure all arrays and objects are properly closed with NO trailing commas.

The JSON must have this EXACT structure:

{
  "aggregate_analysis": {
    "top_errors": [...],
    "error_correlations": [...], 
    "potential_misconceptions": [...]
  }
}

## Input Data Provided to You

You will be provided with the following inputs:

1.  **Problem Description:** The full text of the programming problem, including examples and specific requirements/constraints (e.g., functions not to use).
2.  **Student Submissions:** A JSON list where each object represents a single student's submission, containing:
3. **GradeMap:** A map of student Id and Assigned grade. If the map does not contain a students value, assign it to "NotAssessed"
* 'student_id': A unique identifier for the student.
* 'timestamp': The time of submission.
* 'content': A string containing the student's source code.
* **(Note: Assessment results like test pass/fail counts are NOT provided. You must infer correctness and errors from the code.)**

## Analysis Process and Output Structure

Analyze the provided data using the following staged process. You must perform the detailed error/misconception analysis described internally, as it is required for the aggregate stages. Format your final output **exclusively** as a single JSON object adhering to the structure specified at the end.

**Crucial Task:** Your primary challenge is to **simulate an assessment** through static analysis of each student's 'content' against the 'Problem Description'.

### Stage 1: Individual Code Assessment and Classification

For **each** student submission:

1.  **Analyze Code Logic & Requirements:**
* Does the code attempt to solve the correct problem as described?
* Does the core algorithm appear logically sound for typical cases?
* Does the code adhere to all specific requirements mentioned in the 'Problem Description' (e.g., not using forbidden functions like 'min()'/'max()', specific output formats)?
* **Internally identify** potential logical errors, incorrect initializations, mishandled edge cases (e.g., empty lists, single items, negatives, zeros), inefficiencies, requirement violations, or other flaws based on the code structure. This internal analysis is crucial for later stages.
* Estimate the likelihood of runtime errors ('IndexError', 'TypeError', etc.) based on the logic.
2.  **Classify Performance Level (Inferred): Use Grade map to do this

### Stage 2: Error Identification and Categorization (Aggregate)

Focusing primarily on errors *you identified internally* in submissions classified as "correct" or "incorrect":

1.  **Consolidate & Categorize Inferred Errors:** Group the errors identified across failing submissions using these categories:
* **Requirement Violation:** Code ignores explicit problem constraints.
* **Misinterpretation of Problem:** Code solves the wrong problem.
* **Logic Error:** Flawed reasoning in the algorithm.
* **Initialization Error:** Incorrect starting values for variables.
* **Control Flow Error:** Incorrect loops, branching, recursion.
* **Off-by-One Error:** Loop boundaries, indexing issues.
* **Edge Case Handling Error:** Failure on non-standard valid inputs.
* **Data Type Error:** Incorrect use or conversion of types.
* **Data Structure Error:** Incorrect use of lists, dictionaries, etc.
* **Function/Method Error:** Issues with definition, calls, parameters, returns.
* **Variable Scope Error:** Misunderstanding local vs. global scope.
* **Inefficiency/Suboptimal Algorithm:** Correct but slow/resource-intensive solution.
* **Potential Runtime Error:** High likelihood of crash (IndexError, TypeError, etc.).
* *(You may identify additional specific error patterns if frequent and distinct).*
2.  **Frequency Analysis:** Count occurrences for each category among "correct"/"incorrect".
3.  **Select Top Errors:** Identify the top 5 most frequent *inferred* error categories.
4.  **Output:** For each top error, populate an object in the 'top_errors' array containing 'category', 'occurrence_count', 'occurrence_percentage' (of failing students, format "XX.XX%"), 'description', 'example_code' (array of strings), and 'student_ids' (array of integers).

### Stage 3: Correlation and Pattern Analysis (Aggregate)

Analyze which *inferred* error categories (from Stage 2) frequently co-occur within the same "correct" or "incorrect" submissions.

1.  **Identify Strong Correlations:** Find the 3-5 strongest co-occurrence pairs among "correct"/"incorrect".
2.  **Output:** For each pair, populate an object in the 'error_correlations' array containing 'correlated_errors' (array of 2 strings), 'correlation_count', 'correlation_percentage' (of failing students, format "XX.XX%"), 'hypothesis' (string), 'example_code' (array of strings), and 'student_ids' (array of integers).

### Stage 4: Potential Misconception Inference and Remediation Content (Aggregate)

Based on the top *inferred* errors, correlations, and code patterns:

1.  **Infer Misconceptions:** Identify 1-3 high-level *potential* underlying conceptual misunderstandings likely explaining prevalent error patterns among "correct"/"incorrect" students.
2.  **Generate Remediation Content:** For each inferred misconception, *also* generate content suitable for instructor intervention (for the "Respond" dashboard).
3.  **Output:** For each inferred misconception, populate an object in the 'potential_misconceptions' array containing:
* 'misconception': Concise description of the potential misunderstanding.
* 'related_error_categories': Array of strings of inferred error categories strongly associated.
* 'occurrence_count': Approximate number of failing students whose inferred errors align.
* 'occurrence_percentage': Approximate percentage of failing students potentially affected (format "XX.XX%").
* 'explanation_diagnostic': Clear explanation of the likely misunderstanding (for the instructor's analysis).
* 'example_code_error': Array of strings (max 5-7 lines) code snippet vividly illustrating the *result* of this misconception.
* 'student_ids': Array of integers of 'student_id's of failing students whose code strongly suggests this misconception.
* **'suggested_explanation_for_students':** String with brief, clear, student-friendly explanation of the correct concept or why the misconception leads to errors.
* **'correct_code_example':** Array of strings (max 5-7 lines) minimal, correct code snippet demonstrating the *proper* way to handle the specific concept.
* **'follow_up_question':** String with short question designed to check student understanding after the explanation.

## Important Considerations & Limitations

* **Static Analysis Only:** Your assessment is based purely on reading the code. You cannot execute it. Inferences about errors, performance levels, and the generated remediation content require instructor validation.
* **Focus on Clarity:** Provide clear, concise descriptions, examples, explanations, and questions. Ensure generated code examples are minimal and directly relevant.
* **CRITICAL: Valid JSON Only:** Your entire response must be a single, valid JSON object. NO markdown, NO explanatory text, NO trailing commas, NO comments. Just pure JSON.

RESPOND WITH ONLY THE JSON OBJECT - NO OTHER TEXT OR FORMATTING.`

	prompt := fmt.Sprintf(
		"Problem Description:\n%s\n\nInstructions: %s\nTotal Students:\n%d\nStudent Submissions:\n%s",
		problemDescription, NewInstructions, NumberOfStudents, formatSnapshotsForPrompt(formattedSnapshots),
	)

	// Call Gemini API
	jsonText := MakeRequestGeminiAnalyze(prompt)
	log.Printf("Gemini response: %s", jsonText)
	var aggregateAnalysis AggregateAnalysis

	if jsonText == "" {
		log.Printf("Failed to get response from Gemini")
		return aggregateAnalysis, errors.New("could not generate response")
	}

	cleanedJSON, err := CleanAndUnmarshal(jsonText, &aggregateAnalysis)
	if err != nil {
		log.Printf("Failed to clean JSON: %v", err)
		return aggregateAnalysis, err
	}

	// Extract the "aggregate_analysis" field manually
	var raw map[string]json.RawMessage
	if err := json.Unmarshal([]byte(cleanedJSON), &raw); err != nil {
		log.Printf("Unmarshal into RawMessage map failed: %v", err)
		return aggregateAnalysis, err
	}

	inner, ok := raw["aggregate_analysis"]
	if !ok {
		log.Printf("Key 'aggregate_analysis' not found in JSON")
		return aggregateAnalysis, errors.New("missing 'aggregate_analysis' key in JSON")
	}

	if err := json.Unmarshal(inner, &aggregateAnalysis); err != nil {
		log.Printf("Failed to unmarshal inner aggregate_analysis: %v", err)
		return aggregateAnalysis, err
	}

	return aggregateAnalysis, nil
}

// MakeRequestGeminiAnalyze makes a request to Gemini API for code analysis
func MakeRequestGeminiAnalyze(prompt string) string {
	// Get API key from environment variable
	apiKey := os.Getenv("GEMINI_API_KEY")
	if apiKey == "" {
		log.Println("Error: GEMINI_API_KEY environment variable not set")
		return ""
	}

	var parts []map[string]string
	parts = append(parts, map[string]string{
		"text": prompt,
	})

	requestBody := map[string]interface{}{
		"contents": []map[string]interface{}{
			{
				"parts": parts,
			},
		},
	}

	bodyJSON, err := json.Marshal(requestBody)
	if err != nil {
		log.Printf("Failed to marshal request body: %v", err)
		return ""
	}

	req, err := http.NewRequest("POST",
		fmt.Sprintf("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=%s", apiKey),
		bytes.NewBuffer(bodyJSON),
	)
	if err != nil {
		log.Printf("Failed to create request: %v", err)
		return ""
	}
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 120 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		log.Printf("Gemini API request failed: %v", err)
		return ""
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		log.Printf("Failed to read response body: %v", err)
		return ""
	}

	// Log response status for debugging
	if resp.StatusCode != http.StatusOK {
		log.Printf("Gemini API returned status %d: %s", resp.StatusCode, string(body))
		return ""
	}

	// Parse Gemini response
	var responseJSON map[string]interface{}
	if err := json.Unmarshal(body, &responseJSON); err != nil {
		log.Printf("Invalid JSON in Gemini response: %v", err)
		return ""
	}

	// Extract text from: responseJSON["candidates"][0]["content"]["parts"][0]["text"]
	if candidates, ok := responseJSON["candidates"].([]interface{}); ok && len(candidates) > 0 {
		if content, ok := candidates[0].(map[string]interface{})["content"].(map[string]interface{}); ok {
			if parts, ok := content["parts"].([]interface{}); ok && len(parts) > 0 {
				if part, ok := parts[0].(map[string]interface{}); ok {
					if text, ok := part["text"].(string); ok {
						return text
					}
				}
			}
		}
	}

	log.Printf("Could not extract text from Gemini response: %s", string(body))
	return ""
}

// Helper function to format snapshots for the prompt
func formatSnapshotsForPrompt(snapshots []CodeSnapshot) string {
	var result strings.Builder
	result.WriteString("[\n")
	for i, snapshot := range snapshots {
		if i > 0 {
			result.WriteString(",\n")
		}
		result.WriteString(fmt.Sprintf(`  {
    "student_id": %d,
    "timestamp": "%s",
    "content": %s
  }`, snapshot.StudentID, snapshot.Timestamp, jsonEscape(snapshot.Content)))
	}
	result.WriteString("\n]")
	return result.String()
}

// Helper function to escape strings for JSON
func jsonEscape(s string) string {
	b, _ := json.Marshal(s)
	return string(b)
}

// CleanAndUnmarshal cleans JSON response and unmarshals it
func CleanAndUnmarshal(jsonText string, target interface{}) (string, error) {
	// Log the original response for debugging
	log.Printf("Original response length: %d", len(jsonText))

	// Remove markdown code blocks if present - use (?s) for dotall mode to match newlines
	re := regexp.MustCompile("(?s)```(?:json)?\n?(.*?)\n?```")
	matches := re.FindStringSubmatch(jsonText)
	if len(matches) > 1 {
		jsonText = strings.TrimSpace(matches[1])
		log.Printf("Extracted JSON from markdown, new length: %d", len(jsonText))
	}

	// Clean up any extra whitespace and ensure it's valid JSON
	jsonText = strings.TrimSpace(jsonText)

	// Remove any potential BOM or invisible characters at the beginning
	jsonText = strings.TrimPrefix(jsonText, "\ufeff")

	// Fix common JSON issues that AI might generate
	jsonText = fixCommonJSONIssues(jsonText)

	// Try to unmarshal to validate JSON
	if err := json.Unmarshal([]byte(jsonText), target); err != nil {
		log.Printf("JSON that failed to unmarshal (first 1000 chars): %s", jsonText[:min(1000, len(jsonText))])

		// Try to find where the error occurs
		var jsonMap map[string]interface{}
		if jsonErr := json.Unmarshal([]byte(jsonText), &jsonMap); jsonErr != nil {
			log.Printf("JSON syntax error details: %v", jsonErr)
		}

		return "", fmt.Errorf("JSON unmarshal error: %v", err)
	}

	return jsonText, nil
}

// fixCommonJSONIssues attempts to fix common JSON formatting issues
func fixCommonJSONIssues(jsonText string) string {
	// Remove trailing commas before closing brackets/braces
	re1 := regexp.MustCompile(`,\s*}`)
	jsonText = re1.ReplaceAllString(jsonText, "}")

	re2 := regexp.MustCompile(`,\s*]`)
	jsonText = re2.ReplaceAllString(jsonText, "]")

	// Remove any comments (which aren't valid in JSON)
	re3 := regexp.MustCompile(`//.*?\n`)
	jsonText = re3.ReplaceAllString(jsonText, "\n")

	re4 := regexp.MustCompile(`/\*.*?\*/`)
	jsonText = re4.ReplaceAllString(jsonText, "")

	return jsonText
}

// Helper function for min
func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}

// Add the struct definitions that were referenced in the original function
type AggregateAnalysis struct {
	TopErrors               []TopError               `json:"top_errors"`
	ErrorCorrelations       []ErrorCorrelation       `json:"error_correlations"`
	PotentialMisconceptions []PotentialMisconception `json:"potential_misconceptions"`
}

type TopError struct {
	Category             string   `json:"category"`
	OccurrenceCount      int      `json:"occurrence_count"`
	OccurrencePercentage string   `json:"occurrence_percentage"`
	Description          string   `json:"description"`
	ExampleCode          []string `json:"example_code"`
	StudentIDs           []int    `json:"student_ids"`
}

type ErrorCorrelation struct {
	CorrelatedErrors      []string `json:"correlated_errors"`
	CorrelationCount      int      `json:"correlation_count"`
	CorrelationPercentage string   `json:"correlation_percentage"`
	Hypothesis            string   `json:"hypothesis"`
	ExampleCode           []string `json:"example_code"`
	StudentIDs            []int    `json:"student_ids"`
}

type PotentialMisconception struct {
	Misconception                   string   `json:"misconception"`
	RelatedErrorCategories          []string `json:"related_error_categories"`
	OccurrenceCount                 int      `json:"occurrence_count"`
	OccurrencePercentage            string   `json:"occurrence_percentage"`
	ExplanationDiagnostic           string   `json:"explanation_diagnostic"`
	ExampleCodeError                []string `json:"example_code_error"`
	StudentIDs                      []int    `json:"student_ids"`
	SuggestedExplanationForStudents string   `json:"suggested_explanation_for_students"`
	CorrectCodeExample              []string `json:"correct_code_example"`
	FollowUpQuestion                string   `json:"follow_up_question"`
}
