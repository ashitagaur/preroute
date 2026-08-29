# Preproute Test Management Application

A complete frontend architecture for a robust Test Management Application built with modern React, TypeScript, and Vite.

## 🚀 Tech Stack & Library Choices

The frontend is built using a carefully selected stack designed for performance, developer experience, and scalability.

### Core Framework
* **React 18 + TypeScript:** The backbone of the application. TypeScript provides strict typing, which is critical for a complex form-heavy application to catch bugs at compile-time rather than run-time.
* **Vite:** Chosen over Create React App (CRA) for significantly faster Hot Module Replacement (HMR), optimized production builds, and native ES module support.

### State Management
* **Zustand:** Used for global state management (specifically managing the Test Creation "Draft" workflow). 
  * *Why?* Zustand is incredibly lightweight, requires zero boilerplate compared to Redux, and offers a built-in `persist` middleware that allows us to save draft states to `localStorage`. This ensures users don't lose their progress if they refresh the page while adding 50+ questions.

### Forms & Validation
* **React Hook Form:** Powers all complex forms (Login, Create Test, Add Questions).
  * *Why?* It minimizes re-renders by managing form state internally rather than relying on controlled React state, making it highly performant for large questionnaires.
* **Zod:** Used in tandem with React Hook Form for schema validation.
  * *Why?* Zod allows us to define strict business rules (e.g. `correct_marks <= total_questions`) declaratively. It also automatically infers TypeScript types from the schema, ensuring our forms and data types always remain perfectly in sync.

### Networking & Routing
* **Axios:** Handles API communication via a centralized service layer. Interceptors are configured to automatically attach JWT authorization headers to secure endpoints.
* **React Router v7:** Manages client-side routing and page navigation for the SPA (Single Page Application).

### UI & Styling
* **CSS Modules:** Used for component-scoped styling (e.g., `CreateTest.module.css`).
  * *Why?* It prevents global CSS namespace collisions while allowing developers to write pure, standard CSS without the learning curve of CSS-in-JS libraries.
* **React Hot Toast:** Provides clean, animated push notifications for success/error feedback.
* **React Icons:** Standardized icon pack used throughout the UI.

---

## 🏗️ Folder Structure & Architecture

The application follows a modular, feature-based architecture to maintain clean separation of concerns.

```text
frontend/
├── src/
│   ├── components/      # Reusable UI building blocks
│   │   ├── layout/      # Shell components (Header, Sidebar)
│   │   └── ui/          # Primitive components (Button, Input, Select, Cards)
│   │
│   ├── pages/           # Route-level feature components
│   │   ├── Login/       
│   │   ├── Dashboard/   
│   │   ├── CreateTest/  
│   │   ├── AddQuestions/
│   │   └── PreviewPublish/
│   │
│   ├── services/        # API communication layer
│   │   ├── api.ts       # Axios instance & interceptors
│   │   ├── auth.service.ts
│   │   ├── test.service.ts
│   │   └── question.service.ts
│   │
│   ├── store/           # Zustand global state
│   │   └── useTestStore.ts
│   │
│   └── types/           # Global TypeScript interfaces
│       └── index.ts
```

### Architectural Approach

1. **Service Layer Abstraction:** UI components never make direct Axios calls. Instead, they call asynchronous methods from the `services/` directory. This decouples the UI from the network logic, making it easier to mock APIs or swap endpoints in the future.
2. **Component-Driven UI:** Primitive elements like standard Inputs and Select dropdowns are extracted into reusable components. This guarantees a consistent design language across the application and makes global styling changes trivial.
3. **Data Flow & Draft Recovery:** The test creation process is a multi-step wizard (`CreateTest` -> `AddQuestions` -> `PreviewPublish`). To manage this, data is continuously synced to a global Zustand store (`useTestStore`). If the user leaves the page or refreshes, the app seamlessly recovers the draft ID and question arrays from local storage.
4. **Vercel Production Ready:** The repository includes a `vercel.json` configuration file at the root of the frontend folder to enforce SPA rewrites. This ensures that direct deep links (e.g., `/tests/create`) are properly routed to `index.html` by the Vercel edge network instead of throwing 404 errors.

---

## ✅ Implemented Features (Completed Flow)

The application currently supports the complete core end-to-end flow for test creation:

1. **Secure Login:** JWT-authenticated login screen that redirects successfully authenticated users to the dashboard.
2. **Dashboard Management:** A central hub to view all previously created tests, displaying vital metadata (status, created date, subject).
3. **Test Configuration (Create Test):** A robust wizard to define the test's Subject, Topic, Sub-topic, and mathematical Marking Scheme. Includes strict validation (e.g. `Correct Marks <= Total Questions`).
4. **Manual Question Editor:** A fully functional UI to manually add MCQ questions. Features a dynamic sidebar that tracks exactly how many questions are left to complete.
5. **Granular Categorization:** The ability to assign a specific difficulty level, topic, and subtopic to *individual* questions via dynamic dropdowns.
6. **Preview Mode:** A read-only verification screen that allows administrators to review all drafted questions before committing them.
7. **Publishing Workflow:** The ability to set a "Live Until" schedule and successfully convert a Draft into a Live test, returning the user to the updated dashboard.

---

## 🚀 Future Enhancements

The UI architecture has been laid out for the following advanced features, which are scheduled for upcoming development sprints:

1. **CSV Bulk Upload:** The "Upload CSV" button is present in the UI. Future integration with a parser (like `PapaParse`) will allow educators to upload hundreds of questions instantly, mapping them directly to the draft store.
2. **Rich Text Formatting Bar:** The visual editor toolbar (Bold, Italics, Links) is designed but not yet wired to output raw HTML. Integration with libraries like `React-Quill` or `TipTap` will enable complex text formatting.
3. **Image Upload Support:** The architecture is prepared for a drag-and-drop zone to attach images (e.g., mathematical graphs). This will require integration with a cloud storage bucket (AWS S3 / Cloudinary) to upload the file and store the resulting URL in the question payload.
