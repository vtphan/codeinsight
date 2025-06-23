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

	// Read the data.json file
	data, err := ioutil.ReadFile("data/data.json")
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
