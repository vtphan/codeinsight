package main

import (
	"encoding/json"
	"io/ioutil"
	"log"
	"net/http"
	"os"
)

func main() {
	// API route
	http.HandleFunc("/api/data", handleMergedData)

	// Static frontend under /dashboard
	http.Handle("/dashboard/", http.StripPrefix("/dashboard", http.HandlerFunc(dashboardHandler)))

	log.Println("🚀 Server running at http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
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

	files := map[string]string{
		"analysisData":      "data/data-gemini.json",
		"problemDescription": "data/problem-description.json",
		"codeSnapshots":     "data/codesnapshots.json",
		"submissionTimes":   "data/submission-times.json",
		"taInterventions":   "data/TA-Interventions.json",
	}

	merged := make(map[string]interface{})
	for key, filename := range files {
		data, err := ioutil.ReadFile(filename)
		if err != nil {
			http.Error(w, "Failed to read "+filename, http.StatusInternalServerError)
			return
		}
		var parsed interface{}
		if err := json.Unmarshal(data, &parsed); err != nil {
			http.Error(w, "Invalid JSON in "+filename, http.StatusInternalServerError)
			return
		}
		merged[key] = parsed
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(merged)
}
