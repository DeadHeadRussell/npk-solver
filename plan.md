### Project Plan: NPK Solver Web Application

#### 1. Project Overview

This project is to build a client-side single-page web application that helps gardeners create custom fertilizer blends. Users will be able to manage a library of their available fertilizers, specify a target N-P-K (Nitrogen-Phosphorus-Potassium) value and a total blend weight, and the application will calculate the simplest mix of ingredients to achieve that target. All data will be stored locally in the user's browser.

#### 2. Technology Stack

*   **Framework:** React
*   **Language:** TypeScript
*   **UI Library:** Material-UI (MUI)
*   **Build Tool:** Vite
*   **Package Manager:** Yarn
*   **Solver:** glpk.js (for Mixed-Integer Linear Programming)
*   **Persistence:** Browser Local Storage

#### 3. Core Features

*   **Fertilizer Library:** A default library of common fertilizers and the ability for users to add, edit, and delete their own.
*   **Mix Calculator:** A tool to input a target NPK ratio, total weight, tolerance, and ingredient increment.
*   **Optimal Recipe Generation:** The app will use a solver to find a recipe that meets the NPK target using the minimum number of ingredients.
*   **Past Blends:** A history of previously calculated blends for future reference.
*   **Persistent State:** The user's fertilizer library and past blends will be saved in the browser.

#### 4. Development Plan

I will build the application in several phases:

**Phase 1: Project Setup & UI Scaffolding**
*   **Task 1.1:** Initialize a new Vite + React (TypeScript) project using Yarn.
*   **Task 1.2:** Install all necessary dependencies, including `@mui/material`, `@emotion/react`, `@emotion/styled`, and `glpk.js`.
*   **Task 1.3:** Set up the main application shell using MUI components for layout (e.g., `Container`, `AppBar`, `Tabs`) and create placeholder files for the main UI sections: `FertilizerLibrary.tsx`, `Mixer.tsx`, and `PastBlends.tsx`.

**Phase 2: Fertilizer Library**
*   **Task 2.1:** Define the TypeScript interfaces for `Fertilizer`, `Blend`, etc.
*   **Task 2.2:** Create a generic `useLocalStorage` custom hook to easily manage persistent state.
*   **Task 2.3:** Populate a default list of common fertilizers (e.g., Blood Meal, Bone Meal, Kelp Meal) to be used as the initial library.
*   **Task 2.4:** Implement the `FertilizerLibrary` component to allow users to perform full CRUD (Create, Read, Update, Delete) operations on their personal fertilizer list.

**Phase 3: Mixer UI**
*   **Task 3.1:** Build the user interface for the `Mixer` component. This will include MUI inputs for the target N, P, and K values, total desired weight, tolerance (e.g., `Slider`), and ingredient increment.
*   **Task 3.2:** Add a mechanism for users to select which fertilizers from their library are available for the current mix (e.g., a multi-select list).
*   **Task 3.3:** Add a "Calculate Mix" button and a dedicated area to display the resulting recipe or any error messages.

**Phase 4: Solver Implementation**
*   **Task 4.1:** Create a dedicated module, `services/solver.ts`, to encapsulate the calculation logic.
*   **Task 4.2:** In this module, implement a `calculateMix` function that formulates a Mixed-Integer Linear Programming (MILP) problem based on the user's inputs.
*   **Task 4.3:** The objective of the MILP problem will be to minimize the number of fertilizers used. Constraints will include:
    *   The final blend must match the total weight.
    *   The N, P, and K content must be within the specified tolerance of the target.
    *   Ingredient amounts must be in multiples of the specified increment.
*   **Task 4.4:** Use the `glpk.js` library to solve the MILP problem and determine the optimal quantities for each ingredient.

**Phase 5: Integration & Persistence**
*   **Task 5.1:** Connect the `Mixer` UI to the `solver.ts` service. Clicking the "Calculate Mix" button will trigger the solver with the current inputs.
*   **Task 5.2:** When a calculation is successful, save the entire blend configuration (inputs and resulting recipe) to a `pastBlends` list in local storage.
*   **Task 5.3:** Implement the `PastBlends` component to display a history of saved blends, allowing users to review or reuse them.

**Phase 6: Finalization**
*   **Task 6.1:** Polish the user interface and experience. Add helpful tooltips and clear instructions to guide the user.
*   **Task 6.2:** Review and refactor the code, adding comments where necessary, especially for the complex solver logic.
*   **Task 6.3:** Conduct thorough testing to ensure calculations are accurate and the application is robust.
