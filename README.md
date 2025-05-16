# CodeInsight

CodeInsight is a dashboard that allow instructors monitor student activities and review AI analysis of student work during an in-class exercise session.

This dashboard is created by this prompt.

**Prompt:**

**Goal:** Create the codebase for an interactive, web-based dashboard for Computer Science 1 (CS1) instructors, **using React**.

**Purpose:** This dashboard aims to empower instructors during and after in-class programming exercises by:
1.  **Monitoring** student progress in real-time.
2.  **Analyzing** aggregated, LLM-generated insights about common errors, misconceptions, and performance patterns after code snapshots are collected.
3.  **Responding** by preparing targeted feedback, review materials, and projectable examples for the class.

**Emphasis:** The priority is the **quick delivery of a working prototype**. Focus on a simple, functional React structure using functional components and hooks. Avoid overly complex state management libraries unless necessary; prop drilling or React Context API should suffice for this prototype stage.

**Requirement 1: Setup Instructions**
* **Start your response** with clear, step-by-step instructions on how to set up the development environment. This should include:
    * Prerequisites (Node.js, npm/yarn).
    * Instructions for creating a new React project (recommend using **Vite** for speed: `npm create vite@latest my-dashboard -- --template react`).
    * Commands to navigate into the project directory and install default dependencies (`cd my-dashboard`, `npm install`).
    * Instructions for installing any additional libraries needed (e.g., for charting or syntax highlighting, if you choose to use them).
    * How to run the development server (`npm run dev`).

**Requirement 2: Project Structure and Data Loading**
* **Data File:** Create a file named `src/data.js`.
* **Input Data:** Assume a JSON file named `data-gemini.json` (with the structure previously described and provided in the example file) is placed inside the `src/` directory.
* **Loading Logic:** The `src/data.js` file should import the `data-gemini.json` file and export the parsed data as a JavaScript object (e.g., using a default export or a named export like `analysisData`).
    ```javascript
    // Example content for src/data.js
    import jsonData from './data-gemini.json';
    export const analysisData = jsonData;
    // Or: export default jsonData;
    ```
* **Component Usage:** All React components that need access to the analysis data should import it directly from `src/data.js`. Do **not** use a global variable; use standard ES module imports.
    ```javascript
    // Example in a React component
    import React from 'react';
    import { analysisData } from './data.js'; // Or: import analysisData from './data.js';

    function MyComponent() {
      const title = analysisData.problem_summary.title;
      // ... use other data
      return <div>{title}</div>;
    }
    ```
* **Component Structure:** Organize components logically within the `src/` folder. A potential structure:
    * `src/App.js` (Main application component with routing/view switching)
    * `src/data.js` (As described above)
    * `src/data-gemini.json` (Input data)
    * `src/views/`: Contains main view components (`MonitorView.js`, `AnalyzeView.js`, `RespondView.js`)
    * `src/components/`: Contains reusable components used by views (e.g., `PerformanceChart.js`, `ErrorList.js`, `MisconceptionCard.js`, `CodeBlock.js`, `PresentationMode.js`)

**Input Data Source Reminder:**
The data exported from `src/data.js` will follow the structure of `data-gemini.json`, including keys like `problem_summary`, `overall_assessment`, `individual_assessment`, and `aggregate_analysis` (with `top_errors`, `error_correlations`, `potential_misconceptions`).

**Dashboard Structure & React Components:**

1.  **Overall Layout (`src/App.js`):**
    * Implement as a single-page application.
    * **Header:** Display the exercise title dynamically using `analysisData.problem_summary.title`.
    * **Navigation:** Implement simple navigation (e.g., Tabs, Buttons) to switch between rendering the `MonitorView`, `AnalyzeView`, and `RespondView` components. Manage the currently active view using React state (`useState`).

2.  **Monitor View (`src/views/MonitorView.js`):**
    * **Purpose:** Simple, live overview during the exercise (mock live updates for prototype).
    * **Components:**
        * Display `analysisData.overall_assessment.total_entries`.
        * Use a component like `<PerformanceChart>` (create this in `src/components/`) to visualize `analysisData.overall_assessment.performance_distribution`. (You can use a simple library like `react-chartjs-2` or just display the numbers clearly for the prototype).
    * **Design:** Minimalist.

3.  **Analyze View (`src/views/AnalyzeView.js`):**
    * **Purpose:** Explore LLM analysis post-exercise.
    * **Layout:** Organize sections logically. Prioritize summaries, allow expansion for details.
    * **Components:**
        * **Performance Summary:** Display final `analysisData.overall_assessment.performance_distribution` (reuse `<PerformanceChart>` or similar).
        * **(Optional) Problem Description:** Display content from `max_difference.md` (for simplicity in prototype, you might just link to it or skip this).
        * **Top Errors Section:** Create `<ErrorList>` and `<ErrorItem>` components.
            * Map over `analysisData.aggregate_analysis.top_errors`.
            * `<ErrorItem>` should initially show category, description, percentage. Use `useState` within `<ErrorItem>` to handle expansion on click, revealing `example_code` (use a `<CodeBlock>` component for syntax highlighting - suggest `react-syntax-highlighter`) and `student_ids`.
        * **Error Correlations Section:** Similar structure using list/item components mapping over `analysisData.aggregate_analysis.error_correlations`. Expandable to show hypothesis, `example_code`, `student_ids`.
        * **Potential Misconceptions Section:** Use `<MisconceptionList>` and `<MisconceptionCard>` components.
            * Map over `analysisData.aggregate_analysis.potential_misconceptions`.
            * `<MisconceptionCard>` initially shows title, percentage. Expandable to show `explanation_diagnostic`, `suggested_explanation_for_students`, `example_code_error` (`<CodeBlock>`), `correct_code_example` (`<CodeBlock>`), `follow_up_question`, `student_ids`.
            * **Include the "Add to Screen" button here.**
        * **Student List Section:** Create a simple sortable/filterable table component displaying `analysisData.individual_assessment` data (`student_id`, `performance_level`).

4.  **Respond View (`src/views/RespondView.js`):**
    * **Purpose:** Prepare and present teaching interventions.
    * **Components:**
        * **Misconception Review:** Reuse `<MisconceptionCard>` components, possibly filtered to show only major ones or displayed differently for review. Ensure the "Add to Screen" button is functional here too.
        * **Screen Queue Display:** Maintain a list of items added to the screen queue using React state (`useState` in `App.js` or `RespondView`, potentially using Context API if state needs sharing across views). Display the titles or summaries of queued items. Allow reordering/removal.
        * **Presentation Mode Trigger:** A button ("Start Presentation") that toggles the display of the `<PresentationMode>` component.
    * **State Management:** The "Screen Queue" state needs to persist as the user navigates or adds items. Consider lifting state up to `App.js` or using Context API.

5.  **Presentation Mode Component (`src/components/PresentationMode.js`):**
    * **Purpose:** Display queued items full-screen for projection.
    * **Functionality:** Takes the current "Screen Queue" list as a prop. Displays one item at a time. Includes Next/Previous buttons to navigate the queue. Uses large fonts and clear layout. Renders code using `<CodeBlock>` for syntax highlighting. Closes/exits back to the Respond View.

**Technical Considerations:**
* Use functional components and hooks (`useState`, `useEffect` where needed).
* Use a syntax highlighting library (e.g., `react-syntax-highlighter`) for the `<CodeBlock>` component.
* Ensure CSS is simple and functional; consider basic CSS or a utility library like Tailwind CSS if comfortable, but prioritize speed for the prototype.
* The code should be clearly structured and commented where necessary to facilitate understanding and continuation across multiple sessions.

**Final Request:**
Please generate the React codebase following these instructions, starting with the setup steps. Structure the code logically into components and views as suggested. Ensure data is imported correctly from `src/data.js`. Implement the core functionality for each view, including the state management and rendering logic for the "Add to Screen" queue and the "Presentation Mode".

---