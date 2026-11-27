import { Navigate, Route, Routes } from 'react-router-dom';
import { LoginPage } from '@/features/auth/LoginPage';
import { RegisterCompanyPage } from '@/features/auth/RegisterCompanyPage';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AppLayout } from '@/app/layout/AppLayout';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { EmployeesPage } from '@/features/employees/EmployeesPage';
import { ComingSoonPage } from '@/components/ComingSoonPage';

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterCompanyPage />} />
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<DashboardPage />} />
        <Route path="/employees" element={<EmployeesPage />} />
        <Route path="/attendance" element={<ComingSoonPage title="Attendance" />} />
        <Route path="/leave" element={<ComingSoonPage title="Leave" />} />
        <Route path="/payroll" element={<ComingSoonPage title="Payroll" />} />
        <Route path="/settings" element={<ComingSoonPage title="Settings" />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
