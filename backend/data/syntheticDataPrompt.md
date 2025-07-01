You are a Code-Snapshot Simulator.

### **Goal**

Generate a realistic series of code snapshots that emulate how different students work on a programming assignment. Each student works individually, with the simulation capturing a snapshot every 15 seconds, only when the student modifies the code. Each exercise will last exactly 15 minutes, resulting in a range of 30–60 snapshots per student. Students are enrolled in an introductory programming course (CS1) and will not use external libraries or advanced built-in functions beyond basic Python features.
**very strict rule**: generate atleast 30snapshots per student, which means atleast 300 total snapshots in total.

### **Inputs**

1.  **QUESTION**: Write a function that takes a string text and returns a dictionary (or hash map) where the keys are words in the string, and the values are the number of times each word appears.
2.  **STUDENT_DISTRIBUTION**: Total 10 students, 2 for each persona.
    student id range(70-80), 
problem start time should be : "timestamp": "2024-10-26 14:00:00"

### **Student Personas (Behavioral Archetypes)**

*   **`correct_methodical`**: Starts with a basic solution, tests it mentally, then refactors step-by-step to handle all edge cases (e.g., punctuation, case).
*   **`correct_efficient`**: Quickly identifies the optimal tools for the job (e.g., Python's `collections.Counter` or advanced regex) and implements a concise, robust solution.
*   **`partial_happy_path`**: Implements the core logic that works for simple examples but overlooks edge cases like punctuation or case-insensitivity. Submits quickly, assuming the work is done.
*   **`partial_missed_edge_case`**: Attempts to handle some edge cases (e.g., converting to lowercase) but misses others (e.g., punctuation, or empty strings from splitting on multiple spaces).
*   **`incorrect_conceptual_gap`**: Fundamentally misunderstands the requirements or the necessary data structures (e.g., uses a list instead of a dictionary, tries to count characters instead of words).
*   **`incorrect_syntax_error`**: Struggles with the language's syntax, leaving behind unresolved errors like `KeyError`, `TypeError`, or syntax mistakes.

### **Output Format**

Return a single JSON object with two top-level keys: `codeSnapshots` and `submissionTimes`.

*   The final snapshot for each student must contain the final grade in its `grade` field (e.g., `"correct"`, `"partially_correct_60"`, `"incorrect"`). All other snapshots must have `grade: ""`.
*   A student's submission time must exactly match the timestamp of their final snapshot.
*   The 'individual_assessment' must contain the final grade for each student. All incorrect and partially correct students must be marked as "Incorrect".

```jsonc
// Example Structure
{
"codeSnapshots": {
    "entries": [
    { "content": "def func():\n  pass", "grade": "", "snapshot_id": 1, "student_id": 101, "timestamp": "..." },
    { "content": "def func():\n  words = text.split()", "grade": "", "snapshot_id": 2, "student_id": 102, "timestamp": "..." },
    // ... many more snapshots ...
    { "content": "...", "grade": "correct", "snapshot_id": 85, "student_id": 101, "timestamp": "2025-06-10 15:42:10" }
  ]
  },
  "submissionTimes": {
    "submission_times": [
    { "student_id": 101, "timestamp": "2025-06-10 15:42:10" },
    { "student_id": 102, "timestamp": "..." }
  ]
  },
  "problemDescription": {
    "problem_description": "Word Count: Write a function `word_count(text)` that takes a string and returns a dictionary where the keys are words and the values are the number of times each word appears in the string. Ignore punctuation and case sensitivity.",
    "timestamp": "2024-10-26 13:00:00"
  },
  "individual_assessment": [
      {
        "performance_level": "Correct",
        "student_id": 90
      },
      {
        "performance_level": "Incorrect",
        "student_id": 101
      },
    ],
}
```

Additional Constraints and Guidelines

Assignment starts simultaneously for all students; every student's first snapshot will be recorded within the initial 30–120 seconds of the assignment start time.

All students' final submissions will occur between the 9-minute mark (540 seconds) and the end of the 15-minute period (900 seconds).

Students will not use external libraries or advanced Python libraries (e.g., no collections, regex).

Only fundamental Python constructs (basic loops, conditionals, string methods, dictionaries, and lists) should be utilized.

The solution complexity should align with introductory programming skill levels typical of CS1 students.

The timeline of snapshots must realistically represent incremental development, testing, refactoring, struggles, debugging, and final submission.
