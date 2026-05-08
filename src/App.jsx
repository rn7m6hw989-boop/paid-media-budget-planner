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
      <InfoPanel storageKey="allocator">
        <strong>Budget allocation</strong> distributes your annual global budget across campaigns
        based on the weights set in the Objectives &amp; Priorities tab and the Regional Analysis
        tab. Hard commitments come off the top. Test and hold-back reserves are set aside. The
        remaining pool is allocated to campaigns. Manage hard commitments and campaigns below;
        breakdowns on the right update live. Rebalancing is manual — click{' '}
        <em>Rebalance unlocked</em> to apply weight changes.
      </InfoPanel>

      <PoolStrip />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px' }}>
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
        </header>

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
