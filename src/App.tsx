
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './shared/context/AuthContext';
import ProtectedRoute from './shared/components/ProtectedRoute';

// Pages
import AdminLogin from './auth/login';
import AdminRegister from './auth/register';
import { ForgotPassword, ResetPassword } from './shared/index';
import AdminDashboard from './pages/Dashboard/AdminDashboard';
import CourseUnits from './pages/Dashboard/CourseUnits';
import TeacherReport from './pages/Dashboard/TeacherReport';
import StudentManagement from './pages/Dashboard/StudentManagement';
import CourseManagement from './pages/Dashboard/CourseManagement';
import Announcements from './pages/Dashboard/Announcements';

function App() { 
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/auth/login" element={<AdminLogin />} />
          <Route path="/auth/register" element={<AdminRegister />} />
          <Route path="/auth/forgot-password" element={<ForgotPassword />} />
          <Route path="/auth/reset-password" element={<ResetPassword />} />

          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route path="/dashboard" element={<AdminDashboard />} />
            <Route path="/dashboard/courses/:id/units" element={<CourseUnits />} />
            <Route path="/reports/teacher/:id" element={<TeacherReport />} />
            <Route path="/reports/student/:id" element={<StudentManagement />} />
            <Route path="/dashboard/courses" element={<CourseManagement />} />  
            <Route path="/dashboard/announcements" element={<Announcements />} />
          </Route>

          <Route path="*" element={<Navigate to="/auth/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );  
}

export default App;
