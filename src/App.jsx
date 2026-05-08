import React, { useState } from 'react';
import { DataProvider } from './lib/DataContext.jsx';
import { PoolStrip } from './components/PoolStrip.jsx';
import { DimensionWeights } from './components/DimensionWeights.jsx';
import { HardCommitments } from './components/HardCommitments.jsx';
import { CampaignList } from './components/CampaignList.jsx';
import { Breakdowns } from './components/Breakdowns.jsx';
import { RegionalAnalysis } from './components/RegionalAnalysis.jsx';
import { ChangeLog } from './components/ChangeLog.jsx';
import { Settings } from './components/Settings.jsx';
import { InfoPanel } from './components/UI.jsx';

const TABS = [
  { id: 'allocator', label: 'Allocator' },
  { id: 'regional', label: 'Regional analysis' },
  { id: 'log', label: 'Change log' },
  { id: 'settings', label: 'Settings' },
];

function Allocator() {
  return (
    <>
      <InfoPanel storageKey="allocator">
        <strong>The allocator</strong> divides your annual global budget across campaigns based on weighted scoring across
        marketing objectives, business priorities, and regions. Hard commitments come off the top. Test and
        hold-back reserves are set aside. The remaining pool is allocated to campaigns. Adjust weights on
        the left, manage hard commitments and campaigns in the middle, and watch the breakdowns refresh
        on the right. Rebalancing is manual — click <em>Rebalance unlocked</em> to apply weight changes.
      </InfoPanel>

      <PoolStrip />

      <div className="alloc-grid">
        <div>
          <DimensionWeights />
        </div>
        <div>
          <HardCommitments />
          <CampaignList />
        </div>
        <div className="breakdowns-col">
          <Breakdowns />
        </div>
      </div>
    </>
  );
}

export default function App() {
  const [tab, setTab] = useState('allocator');

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
          {tab === 'allocator' && <Allocator />}
          {tab === 'regional' && <RegionalAnalysis />}
          {tab === 'log' && <ChangeLog />}
          {tab === 'settings' && <Settings />}
        </main>
      </div>
    </DataProvider>
  );
}
