import React, { useState } from 'react';
import { formatCurrencyFull } from '../../lib/calculations.js';
import { Modal } from '../UI.jsx';

/**
 * AdjustModal — manual override of a campaign's allocation.
 *
 * Enforces the AND of two rules:
 *   - Deviation cap: |amount − model| ≤ capPct% of model
 *   - Pool fit cap: amount ≤ poolMax (bucket size minus other campaigns)
 *
 * The displayed "Effective maximum" is the tighter of the two. Apply
 * is disabled if either rule is violated. The error message points the
 * user to the rule that's binding.
 */
export function AdjustModal({
  campaign,
  current,
  recommended,
  capPct,
  poolMax,
  onClose,
  onApply,
  onClear,
}) {
  // Upper bounds from each rule
  const capDeviation = Math.round(recommended * (1 + capPct / 100));
  const effectiveMax = Math.max(0, Math.min(capDeviation, poolMax));

  const [draftAmount, setDraftAmount] = useState(current);
  const [rationale, setRationale] = useState('');

  const draft = Number(draftAmount) || 0;
  const deltaPct = recommended > 0 ? ((draft - recommended) / recommended) * 100 : 0;
  const overDeviationCap = Math.abs(deltaPct) > capPct;
  const overPoolCap = draft > poolMax;
  const invalid = overDeviationCap || overPoolCap || draft < 0;

  const limitingRule = overPoolCap ? 'pool' : overDeviationCap ? 'deviation' : null;

  return (
    <Modal
      title="Manual adjustment"
      onClose={onClose}
      footer={
        <>
          {campaign.manualAdjustment != null && (
            <button className="btn ghost" onClick={() => onClear(rationale)}>
              Reset to model
            </button>
          )}
          <div style={{ flex: 1 }} />
          <button className="btn ghost" onClick={onClose}>Cancel</button>
          <button
            className="btn primary"
            onClick={() => onApply(draft, rationale)}
            disabled={invalid}
          >
            Apply adjustment
          </button>
        </>
      }
    >
      <div className="col gap-md">
        <div style={{ background: 'var(--surface-2)', padding: '12px 14px', fontSize: '12px' }}>
          <div className="row between" style={{ marginBottom: '4px' }}>
            <span className="muted">Campaign</span>
            <span>{campaign.name}</span>
          </div>
          <div className="row between" style={{ marginBottom: '4px' }}>
            <span className="muted">Model recommends</span>
            <span className="mono">{formatCurrencyFull(recommended)}</span>
          </div>
          <div className="row between" style={{ marginBottom: '4px' }}>
            <span className="muted">Deviation cap (±{capPct}%)</span>
            <span className="mono">{formatCurrencyFull(capDeviation)}</span>
          </div>
          <div className="row between">
            <span className="muted">Pool fit cap</span>
            <span className="mono">{formatCurrencyFull(poolMax)}</span>
          </div>
          <div
            className="row between"
            style={{
              marginTop: '6px',
              paddingTop: '6px',
              borderTop: '1px solid var(--border)',
            }}
          >
            <strong style={{ color: 'var(--ink)' }}>Effective maximum</strong>
            <strong className="mono" style={{ color: 'var(--ink)' }}>
              {formatCurrencyFull(effectiveMax)}
            </strong>
          </div>
        </div>

        <div>
          <label className="field">New amount</label>
          <input
            type="number"
            className="input numeric"
            value={draftAmount}
            onChange={(e) => setDraftAmount(e.target.value)}
            step={10000}
            min={0}
          />
          <div
            className="tiny"
            style={{
              marginTop: '6px',
              color: invalid ? 'var(--accent)' : 'var(--ink-3)',
              lineHeight: 1.5,
            }}
          >
            {deltaPct >= 0 ? '+' : ''}{deltaPct.toFixed(1)}% from model
            {limitingRule === 'pool' &&
              ' — exceeds pool capacity. Other campaigns in this bucket would have to give up budget; lock or reduce them first.'}
            {limitingRule === 'deviation' &&
              ` — exceeds ±${capPct}% deviation cap. Increase the cap in Settings or lower the amount.`}
            {draft < 0 && ' — must be positive'}
          </div>
        </div>

        <div>
          <label className="field">Rationale (required)</label>
          <input
            type="text"
            className="input"
            value={rationale}
            onChange={(e) => setRationale(e.target.value)}
            placeholder="Why this adjustment?"
          />
        </div>
      </div>
    </Modal>
  );
}
