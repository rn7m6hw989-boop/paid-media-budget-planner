import React, { useState } from 'react';
import { useData } from '../lib/DataContext.jsx';
import { computePoolBreakdown, formatCurrencyFull, formatPercent } from '../lib/calculations.js';
import { HelpIcon, Modal } from './UI.jsx';
import { DEFINITIONS } from '../lib/definitions.js';

export function PoolStrip() {
  const { data, dispatch, log } = useData();
  const pool = computePoolBreakdown(data);

  const [editingBudget, setEditingBudget] = useState(false);
  const [draftBudget, setDraftBudget] = useState(pool.annualGlobalBudget);
  const [draftRationale, setDraftRationale] = useState('');

  const totalAllocated =
    pool.hardCommitmentsTotal +
    pool.testReserve +
    pool.holdBackReserve +
    pool.campaignsPool;

  const allocatedPct = formatPercent(totalAllocated, pool.annualGlobalBudget);

  const onConfirmBudgetChange = () => {
    const oldVal = pool.annualGlobalBudget;
    const newVal = Number(draftBudget) || 0;
    if (newVal === oldVal) {
      setEditingBudget(false);
      return;
    }
    dispatch({ type: 'UPDATE_POOL', changes: { annualGlobalBudget: newVal } });
    log({
      type: 'pool',
      target: 'pool',
      targetName: 'Annual global budget',
      summary: `Annual global budget: ${formatCurrencyFull(oldVal)} → ${formatCurrencyFull(newVal)}`,
      rationale: draftRationale || '(no rationale provided)',
    });
    setEditingBudget(false);
    setDraftRationale('');
  };

  return (
    <>
      <div className="pool-strip">
        <div className="pool-cell editable" onClick={() => { setDraftBudget(pool.annualGlobalBudget); setEditingBudget(true); }}>
          <div className="pool-label">
            Annual global budget
            <HelpIcon definition={DEFINITIONS.annualGlobalBudget.short} />
          </div>
          <div className="pool-value">{formatCurrencyFull(pool.annualGlobalBudget)}</div>
          <div className="pool-meta">Click to edit</div>
        </div>

        <div className="pool-cell">
          <div className="pool-label">
            Hard commitments
            <HelpIcon definition={DEFINITIONS.hardCommitments.short} />
          </div>
          <div className="pool-value small">{formatCurrencyFull(pool.hardCommitmentsTotal)}</div>
          <div className="pool-meta">{formatPercent(pool.hardCommitmentsTotal, pool.annualGlobalBudget)} of budget</div>
        </div>

        <div className="pool-cell">
          <div className="pool-label">
            Test reserve
            <HelpIcon definition={DEFINITIONS.testReserve.short} />
          </div>
          <div className="pool-value small">{formatCurrencyFull(pool.testReserve)}</div>
          <div className="pool-meta">{data.pool.testReservePercent}% of budget</div>
        </div>

        <div className="pool-cell">
          <div className="pool-label">
            Hold-back reserve
            <HelpIcon definition={DEFINITIONS.holdBackReserve.short} />
          </div>
          <div className="pool-value small">{formatCurrencyFull(pool.holdBackReserve)}</div>
          <div className="pool-meta">{data.pool.holdBackPercent}% of budget</div>
        </div>

        <div className="pool-cell">
          <div className="pool-label">
            Campaigns
            <HelpIcon definition={DEFINITIONS.campaigns.short} />
          </div>
          <div className="pool-value small">{formatCurrencyFull(pool.campaignsPool)}</div>
          <div className="pool-meta">{allocatedPct} of budget allocated total</div>
        </div>
      </div>

      {editingBudget && (
        <Modal
          title="Edit annual global budget"
          onClose={() => setEditingBudget(false)}
          footer={
            <>
              <button className="btn ghost" onClick={() => setEditingBudget(false)}>Cancel</button>
              <button className="btn primary" onClick={onConfirmBudgetChange}>
                Confirm change
              </button>
            </>
          }
        >
          <div className="col gap-md">
            <p style={{ fontSize: '13px', color: 'var(--ink-2)' }}>
              Changing the annual global budget will rescale the test reserve and hold-back reserve
              proportionally, and the remaining funds available for campaigns. Existing campaign
              allocations are not changed automatically — run a rebalance afterward to apply the
              new pool size.
            </p>

            <div>
              <label className="field">New annual global budget</label>
              <input
                type="number"
                className="input numeric"
                value={draftBudget}
                onChange={(e) => setDraftBudget(e.target.value)}
                min={0}
                step={100000}
              />
            </div>

            <div>
              <label className="field">Rationale for change (recommended)</label>
              <input
                type="text"
                className="input"
                value={draftRationale}
                onChange={(e) => setDraftRationale(e.target.value)}
                placeholder="e.g., Q2 board approval to add $2M for product launch support"
              />
            </div>

            <div style={{ background: 'var(--surface-2)', padding: '10px 12px', borderRadius: '6px', fontSize: '12px', color: 'var(--ink-2)' }}>
              <div className="row between">
                <span>Current budget</span>
                <span className="mono">{formatCurrencyFull(pool.annualGlobalBudget)}</span>
              </div>
              <div className="row between">
                <span>New budget</span>
                <span className="mono">{formatCurrencyFull(Number(draftBudget) || 0)}</span>
              </div>
              <div className="row between" style={{ marginTop: '4px', borderTop: '1px solid var(--border)', paddingTop: '4px' }}>
                <span>Change</span>
                <span className="mono" style={{ color: (Number(draftBudget) - pool.annualGlobalBudget) >= 0 ? 'var(--accent)' : 'var(--danger)' }}>
                  {(Number(draftBudget) - pool.annualGlobalBudget) >= 0 ? '+' : ''}
                  {formatCurrencyFull(Number(draftBudget) - pool.annualGlobalBudget)}
                </span>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
