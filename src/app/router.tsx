import { Navigate, Route, Routes } from 'react-router-dom';
import { LoginPage } from '@/features/auth/LoginPage';
import { RegisterCompanyPage } from '@/features/auth/RegisterCompanyPage';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AppLayout } from '@/app/layout/AppLayout';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { EmployeesPage } from '@/features/employees/EmployeesPage';
import { LeavePage } from '@/features/leave/LeavePage';
import { AttendancePage } from '@/features/attendance/AttendancePage';
import { PayrollPage } from '@/features/payroll/PayrollPage';
import { RecruitmentPage } from '@/features/recruitment/RecruitmentPage';
import { PerformancePage } from '@/features/performance/PerformancePage';
import { ExpensePage } from '@/features/expense/ExpensePage';
import { AssetPage } from '@/features/asset/AssetPage';
import { HelpdeskPage } from '@/features/helpdesk/HelpdeskPage';
import { BillingPage } from '@/features/billing/BillingPage';
import { PlatformDashboardPage } from '@/features/platform/PlatformDashboardPage';

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
        <Route path="/attendance" element={<AttendancePage />} />
        <Route path="/leave" element={<LeavePage />} />
        <Route path="/payroll" element={<PayrollPage />} />
        <Route path="/recruitment" element={<RecruitmentPage />} />
        <Route path="/performance" element={<PerformancePage />} />
        <Route path="/expense" element={<ExpensePage />} />
        <Route path="/assets" element={<AssetPage />} />
        <Route path="/helpdesk" element={<HelpdeskPage />} />
        <Route path="/billing" element={<BillingPage />} />
        <Route path="/platform" element={<PlatformDashboardPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
