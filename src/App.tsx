import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { OverviewPage } from './pages/OverviewPage';
import { NewAuditPage } from './pages/NewAuditPage';
import { AuditResultsPage } from './pages/AuditResultsPage';
import { AuditHistoryPage } from './pages/AuditHistoryPage';
import { ReportsPage } from './pages/ReportsPage';

import { AuditRecord, OverviewStats } from './types/audit';
import { fetchOverviewStats, fetchLatestAudit, fetchAuditHistory, fetchSystemHealth } from './services/api';

export function App() {
  const [currentTab, setCurrentTab] = useState('overview');
  const [apiConnected, setApiConnected] = useState(false);
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [latestAudit, setLatestAudit] = useState<AuditRecord | null>(null);
  const [selectedAudit, setSelectedAudit] = useState<AuditRecord | null>(null);
  const [history, setHistory] = useState<AuditRecord[]>([]);

  const loadData = async () => {
    try {
      await fetchSystemHealth();
      setApiConnected(true);

      const statsData = await fetchOverviewStats();
      setStats(statsData);

      const latestData = await fetchLatestAudit();
      setLatestAudit(latestData);

      const historyData = await fetchAuditHistory();
      setHistory(historyData);
    } catch (err) {
      console.warn('API Connection issue:', err);
      setApiConnected(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleAuditComplete = (result: AuditRecord) => {
    setSelectedAudit(result);
    setLatestAudit(result);
    setCurrentTab('results');
    loadData();
  };

  const handleViewDetails = (audit: AuditRecord) => {
    setSelectedAudit(audit);
    setCurrentTab('results');
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans antialiased">
      {/* Sidebar */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        apiConnected={apiConnected}
      />

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl">
        {currentTab === 'overview' && (
          <OverviewPage
            stats={stats}
            latestAudit={latestAudit}
            onViewDetails={handleViewDetails}
            onNavigateNewAudit={() => setCurrentTab('new-audit')}
          />
        )}

        {currentTab === 'new-audit' && (
          <NewAuditPage onAuditComplete={handleAuditComplete} />
        )}

        {currentTab === 'results' && (
          <AuditResultsPage
            audit={selectedAudit || latestAudit}
            onBackToHistory={() => setCurrentTab('history')}
          />
        )}

        {currentTab === 'history' && (
          <AuditHistoryPage onSelectAudit={handleViewDetails} />
        )}

        {currentTab === 'reports' && (
          <ReportsPage stats={stats} history={history} />
        )}
      </main>
    </div>
  );
}

export default App;
