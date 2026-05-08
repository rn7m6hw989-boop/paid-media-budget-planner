import React, { useRef, useState } from 'react';
import { useData } from '../lib/DataContext.jsx';
import { DEFINITIONS } from '../lib/definitions.js';
import { Modal, InfoPanel } from './UI.jsx';

export function Settings() {
  const { data, dispatch, resetToSeed, resetToEmpty, replaceAll } = useData();
  const fileRef = useRef(null);
  const [confirmReset, setConfirmReset] = useState(null);

  const exportData = () => {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `budget-plan-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsed = JSON.parse(evt.target.result);
        replaceAll(parsed);
        alert('Imported successfully.');
      } catch (err) {
        alert('Invalid JSON file.');
      }
    };
    reader.readAsText(file);
  };

  const updateSetting = (key, value) => {
    dispatch({ type: 'UPDATE_SETTINGS', changes: { [key]: value } });
  };

  const updatePool = (key, value) => {
    dispatch({ type: 'UPDATE_POOL', changes: { [key]: Number(value) } });
  };

  return (
    <>
      <InfoPanel storageKey="settings">
        <strong>Settings</strong> controls the parameters that govern how the tool behaves: pool reserves,
        adjustment caps, and rationale requirements. The data management section lets you import, export,
        or reset your plan. The definitions section is the canonical reference for all terms.
      </InfoPanel>

      <div className="section-card">
        <div className="section-header">
          <div className="section-title">Pool reserves</div>
        </div>
        <div className="section-body">
          <div className="row gap-md">
            <div style={{ flex: 1 }}>
              <label className="field">Hold-back reserve (%)</label>
              <input
                type="number"
                className="input numeric"
                value={data.pool.holdBackPercent}
                onChange={(e) => updatePool('holdBackPercent', e.target.value)}
                min={0}
                max={50}
                step={0.5}
              />
              <div className="tiny muted" style={{ marginTop: '4px' }}>
                Budget reserved for mid-cycle campaigns and cancellation absorption.
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <label className="field">Test reserve (%)</label>
              <input
                type="number"
                className="input numeric"
                value={data.pool.testReservePercent}
                onChange={(e) => updatePool('testReservePercent', e.target.value)}
                min={0}
                max={20}
                step={0.5}
              />
              <div className="tiny muted" style={{ marginTop: '4px' }}>
                Budget reserved for experiments and learning agendas.
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="section-card">
        <div className="section-header">
          <div className="section-title">Adjustment rules</div>
        </div>
        <div className="section-body">
          <div className="row gap-md">
            <div style={{ flex: 1 }}>
              <label className="field">Manual adjustment cap (%)</label>
              <input
                type="number"
                className="input numeric"
                value={data.settings.manualAdjustmentCapPct}
                onChange={(e) => updateSetting('manualAdjustmentCapPct', Number(e.target.value))}
                min={0}
                max={200}
                step={5}
              />
              <div className="tiny muted" style={{ marginTop: '4px' }}>
                Maximum % a manual adjustment can exceed the model recommendation.
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <label className="field">Require rationale on changes?</label>
              <select
                className="select"
                value={data.settings.requireRationale ? 'yes' : 'no'}
                onChange={(e) => updateSetting('requireRationale', e.target.value === 'yes')}
              >
                <option value="yes">Yes — prompt for rationale</option>
                <option value="no">No — rationale optional</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="section-card">
        <div className="section-header">
          <div className="section-title">Data management</div>
        </div>
        <div className="section-body">
          <div className="row gap-sm wrap">
            <button className="btn" onClick={exportData}>↓ Export plan as JSON</button>
            <button className="btn" onClick={() => fileRef.current?.click()}>↑ Import plan from JSON</button>
            <input
              type="file"
              ref={fileRef}
              accept=".json"
              style={{ display: 'none' }}
              onChange={importData}
            />
            <button className="btn" onClick={() => setConfirmReset('seed')}>↻ Reset to sample data</button>
            <button className="btn danger" onClick={() => setConfirmReset('empty')}>⌫ Clear all data</button>
          </div>
          <div className="tiny muted" style={{ marginTop: '10px', lineHeight: 1.6 }}>
            Your data is stored locally in this browser. Use export/import to share plans across users
            or back up your work. Resetting cannot be undone — export first if you want to keep a copy.
          </div>
        </div>
      </div>

      <div className="section-card">
        <div className="section-header">
          <div className="section-title">Definitions & governance</div>
          <div className="section-subtitle">Canonical reference for every term used in this tool.</div>
        </div>
        <div className="section-body">
          {Object.values(DEFINITIONS).map((d) => (
            <div key={d.term} style={{ marginBottom: '18px', paddingBottom: '14px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontWeight: 500, marginBottom: '4px', fontSize: 'var(--text-md)' }}>{d.term}</div>
              <div style={{ fontSize: 'var(--text-sm)', marginBottom: '6px' }}>{d.short}</div>
              <div className="tiny muted" style={{ lineHeight: 1.6 }}>
                <strong>Governance:</strong> {d.governance}
              </div>
            </div>
          ))}
        </div>
      </div>

      {confirmReset && (
        <Modal
          title={confirmReset === 'seed' ? 'Reset to sample data?' : 'Clear all data?'}
          onClose={() => setConfirmReset(null)}
          footer={
            <>
              <button className="btn ghost" onClick={() => setConfirmReset(null)}>Cancel</button>
              <button
                className="btn danger"
                onClick={() => {
                  if (confirmReset === 'seed') resetToSeed();
                  else resetToEmpty();
                  setConfirmReset(null);
                }}
              >
                {confirmReset === 'seed' ? 'Reset to sample' : 'Clear everything'}
              </button>
            </>
          }
        >
          <p style={{ fontSize: '13px', color: 'var(--ink-2)', lineHeight: 1.6 }}>
            {confirmReset === 'seed'
              ? 'This will replace your current plan with the sample dataset. Your existing changes will be lost.'
              : 'This will permanently remove all campaigns, commitments, regions, objectives, and change log entries.'}
            {' '}This cannot be undone. Export first if you want to keep a copy.
          </p>
        </Modal>
      )}
    </>
  );
}
