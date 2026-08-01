import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { LandingPage } from './pages/LandingPage';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { PatientDashboard } from './pages/PatientDashboard';
import { AssessmentWizard } from './pages/AssessmentWizard';
import { SoundTherapy } from './pages/SoundTherapy';
import { DailyLogs } from './pages/DailyLogs';
import { AIChat } from './pages/AIChat';
import { DoctorDashboard } from './pages/DoctorDashboard';
import { SoundMasker } from './pages/SoundMasker';
import { KnowledgeHub } from './pages/KnowledgeHub';
import { AssessmentStudio } from './pages/AssessmentStudio';

// Route Guard for Authenticated Users
const PrivateRoute: React.FC<{ allowedRoles?: string[] }> = ({ allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center font-sans">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-650 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If patient hits doctor route, or doctor hits patient route
    return <Navigate to={user.role === 'doctor' ? '/doctor-dashboard' : '/dashboard'} replace />;
  }

  return <Outlet />;
};

// Layout for Auth Pages containing Sidebar and Navbar
const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 dark:bg-slate-950 font-sans print:bg-white print:min-h-0">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-y-auto print:h-auto print:overflow-visible">
        <Navbar />
        <main className="flex-1 overflow-y-auto pb-10 print:overflow-visible print:pb-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export const AppContent: React.FC = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Patient Protected Pages */}
      <Route element={<PrivateRoute allowedRoles={['patient']} />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<PatientDashboard />} />
          <Route path="/assessment" element={<AssessmentWizard />} />
          <Route path="/therapy" element={<SoundTherapy />} />
          <Route path="/logs" element={<DailyLogs />} />
          <Route path="/chat" element={<AIChat />} />
          <Route path="/masker" element={<SoundMasker />} />
          <Route path="/knowledge" element={<KnowledgeHub />} />
          <Route path="/assessment-studio" element={<AssessmentStudio />} />
        </Route>
      </Route>

      {/* Doctor Protected Pages */}
      <Route element={<PrivateRoute allowedRoles={['doctor']} />}>
        <Route element={<AppLayout />}>
          <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
        </Route>
      </Route>

      {/* Catch-all Redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
