import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import { Layout } from './components/layout/Layout';
import { Login } from './pages/Login/Login';
import './App.css';

import { Dashboard } from './pages/Dashboard/Dashboard';
import { CreateTest } from './pages/CreateTest/CreateTest';
import { AddQuestions } from './pages/AddQuestions/AddQuestions';
import { PreviewPublish } from './pages/PreviewPublish/PreviewPublish';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = useAuthStore((state) => state.token);
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Protected Routes */}
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="tests/create" element={<CreateTest />} />
          <Route path="tests/:id/questions" element={<AddQuestions />} />
          <Route path="tests/:id/preview" element={<PreviewPublish />} />
          <Route path="tracking" element={<div>Test Tracking</div>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
