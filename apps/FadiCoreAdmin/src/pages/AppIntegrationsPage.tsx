import { useMemo, useState } from "react";
import {
  AdminTopBar,
  ApiEndpointTable,
  IntegrationCard,
  SignalFlowArchitecture,
} from "../components";
import {
  apiEndpoints,
  integrationApps,
  type IntegrationAppId,
} from "../data/appIntegrations";

export function AppIntegrationsPage() {
  const [selectedAppId, setSelectedAppId] = useState<IntegrationAppId | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState("");

  const filteredEndpoints = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return apiEndpoints.filter((endpoint) => {
      const matchesApp =
        selectedAppId === null || endpoint.appId === selectedAppId;
      if (!matchesApp) return false;
      if (!q) return true;
      return (
        endpoint.endpoint.toLowerCase().includes(q) ||
        endpoint.appLabel.toLowerCase().includes(q) ||
        endpoint.method.toLowerCase().includes(q) ||
        endpoint.status.toLowerCase().includes(q)
      );
    });
  }, [searchQuery, selectedAppId]);

  function handleSelectApp(appId: IntegrationAppId) {
    setSelectedAppId((current) => (current === appId ? null : appId));
  }

  return (
    <main className="flex-1 overflow-y-auto px-4 py-5 sm:px-6 lg:px-8 lg:py-6">
      <AdminTopBar
        crumb="Fadi Core Admin"
        section="App Integrations"
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search endpoints, apps, methods..."
        searchMode="filter"
      />

      <section className="mt-6">
        <h1 className="text-[26px] font-semibold leading-tight tracking-[-0.025em] text-navy-ink sm:text-[28px]">
          App Integrations
        </h1>
        <p className="mt-1.5 max-w-3xl text-[13.5px] leading-relaxed text-slate-body">
          API connections, bidirectional signal flows, sync status, and error
          states for all connected apps.
        </p>
        {selectedAppId ? (
          <p className="mt-2 text-[12px] text-navy">
            Filtering endpoints for{" "}
            <span className="font-semibold">
              {integrationApps.find((app) => app.id === selectedAppId)?.name}
            </span>
            . Click the card again to clear.
          </p>
        ) : null}
      </section>

      <section className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {integrationApps.map((app) => (
          <IntegrationCard
            key={app.id}
            app={app}
            selected={selectedAppId === app.id}
            onSelect={handleSelectApp}
          />
        ))}
      </section>

      <section className="mt-5">
        <SignalFlowArchitecture />
      </section>

      <section className="mt-5">
        <ApiEndpointTable endpoints={filteredEndpoints} />
      </section>
    </main>
  );
}
