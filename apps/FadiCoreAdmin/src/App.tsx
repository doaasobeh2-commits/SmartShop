import { Navigate, Route, Routes } from "react-router-dom";
import { AdminLayout } from "./layouts/AdminLayout";
import { AppIntegrationsPage } from "./pages/AppIntegrationsPage";
import { HouseholdIntelligencePage } from "./pages/HouseholdIntelligencePage";
import { IntelligenceEnginesPage } from "./pages/IntelligenceEnginesPage";
import { PlatformOverviewPage } from "./pages/PlatformOverviewPage";
import { RoadmapPage } from "./pages/RoadmapPage";
import { SafetyPrivacyPage } from "./pages/SafetyPrivacyPage";
import { SignalsLogsPage } from "./pages/SignalsLogsPage";

export function App() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route path="/" element={<Navigate to="/platform-overview" replace />} />
        <Route path="/platform-overview" element={<PlatformOverviewPage />} />
        <Route
          path="/household-intelligence"
          element={<HouseholdIntelligencePage />}
        />
        <Route path="/app-integrations" element={<AppIntegrationsPage />} />
        <Route
          path="/intelligence-engines"
          element={<IntelligenceEnginesPage />}
        />
        <Route path="/signals-logs" element={<SignalsLogsPage />} />
        <Route path="/safety-privacy" element={<SafetyPrivacyPage />} />
        <Route path="/roadmap" element={<RoadmapPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/platform-overview" replace />} />
    </Routes>
  );
}
