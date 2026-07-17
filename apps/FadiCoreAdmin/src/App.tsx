import { Navigate, Route, Routes } from "react-router-dom";
import { RequireAdminAuth } from "./auth/RequireAdminAuth";
import { AdminLayout } from "./layouts/AdminLayout";
import { AuditLogsPage } from "./pages/AuditLogsPage";
import { HouseholdDetailPage } from "./pages/HouseholdDetailPage";
import { HouseholdsPage } from "./pages/HouseholdsPage";
import { InvitationsPage } from "./pages/InvitationsPage";
import { LoginPage } from "./pages/LoginPage";
import { OverviewPage } from "./pages/OverviewPage";
import { SessionsPage } from "./pages/SessionsPage";
import { UserDetailPage } from "./pages/UserDetailPage";
import { UsersPage } from "./pages/UsersPage";

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<RequireAdminAuth />}>
        <Route element={<AdminLayout />}>
          <Route path="/" element={<Navigate to="/overview" replace />} />
          <Route path="/overview" element={<OverviewPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/users/:userId" element={<UserDetailPage />} />
          <Route path="/households" element={<HouseholdsPage />} />
          <Route
            path="/households/:householdId"
            element={<HouseholdDetailPage />}
          />
          <Route path="/invitations" element={<InvitationsPage />} />
          <Route path="/sessions" element={<SessionsPage />} />
          <Route path="/audit-logs" element={<AuditLogsPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/overview" replace />} />
    </Routes>
  );
}
