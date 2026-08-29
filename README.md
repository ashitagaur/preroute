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
