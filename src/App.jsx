import React, { useState } from 'react';
import { DataProvider } from './lib/DataContext.jsx';
import { PoolStrip } from './components/PoolStrip.jsx';
import { HardCommitments } from './components/HardCommitments.jsx';
import { CampaignList } from './components/CampaignList.jsx';
import { Breakdowns } from './components/Breakdowns.jsx';
import { ObjectivesAndPriorities } from './components/ObjectivesAndPriorities.jsx';
import { RegionalAnalysis } from './components/RegionalAnalysis.jsx';
import { ChangeLog } from './components/ChangeLog.jsx';
import { Settings } from './components/Settings.jsx';
import { InfoPanel } from './components/UI.jsx';

const TABS = [
  { id: 'budget', label: 'Budget allocation' },
  { id: 'okrs', label: 'Objectives & priorities' },
  { id: 'regional', label: 'Regional analysis' },
  { id: 'log', label: 'Change log' },
  { id: 'settings', label: 'Settings' },
];

function BudgetAllocation() {
  return (
    <>
      <InfoPanel storageKey="allocator-v2">
        <strong>Budget allocation</strong> applies the envelope model: hard commitments and reserves come
        off the top first, then the discretionary pool is split into regional envelopes (by regional
        weights from Regional Analysis), and each envelope splits into brand and demand pools (by the
        org-level ratio in Settings). Campaigns are normalized within their (region × pool) bucket
        based on objective × priority weights. Money cannot cross regional or pool boundaries — each
        bucket is fixed once strategic inputs are set.
      </InfoPanel>

      <PoolStrip />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px', alignItems: 'flex-start' }}>
        <div>
          <HardCommitments />
          <CampaignList />
        </div>
        <div>
          <Breakdowns />
        </div>
      </div>
    </>
  );
}

export default function App() {
  const [tab, setTab] = useState('budget');

  return (
    <DataProvider>
      <div className="app">
        <header className="app-header">
          <div className="brand">
            <span className="brand-mark">Paid Media Budget Planner</span>
            <span className="brand-sub">FY 2026</span>
          </div>
          <nav className="tabs">
            {TABS.map((t) => (
              <button
                key={t.id}
                className={`tab ${tab === t.id ? 'active' : ''}`}
                onClick={() => setTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </nav>
          <div className="app-header-trailing">Auto-saved</div>
        </header>

        <main className="app-body">
          {tab === 'budget' && <BudgetAllocation />}
          {tab === 'okrs' && <ObjectivesAndPriorities />}
          {tab === 'regional' && <RegionalAnalysis />}
          {tab === 'log' && <ChangeLog />}
          {tab === 'settings' && <Settings />}
        </main>
      </div>
    </DataProvider>
  );
}
