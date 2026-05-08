import React, { useState, useMemo } from 'react';
import { useData } from '../lib/DataContext.jsx';
import {
  computeRegionalWeights,
  computeAllocations,
  formatCurrencyFull,
} from '../lib/calculations.js';
import { HelpIcon, Modal, Tag } from './UI.jsx';
import { DEFINITIONS } from '../lib/definitions.js';

function CampaignEditModal({ campaign, onClose, onSave, onDelete }) {
  const { data } = useData();
  const [draft, setDraft] = useState({ ...campaign });
  const [rationale, setRationale] = useState('');
  const isNew = !campaign.id;

  return (
    <Modal
      title={isNew ? 'Add campaign' : 'Edit campaign'}
      onClose={onClose}
      footer={
        <>
          {!isNew && (
            <button className="btn danger" onClick={() => onDelete(rationale)}>
              Cancel campaign
            </button>
          )}
          <div style={{ flex: 1 }} />
          <button className="btn ghost" onClick={onClose}>Cancel</button>
          <button className="btn primary" onClick={() => onSave(draft, rationale)}>Save</button>
        </>
      }
    >
      <div className="col gap-md">
        <div>
          <label className="field">Campaign name</label>
          <input
            type="text"
            className="input"
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
          />
        </div>

        <div className="row gap-md">
          <div style={{ flex: 1 }}>
            <label className="field">Objective</label>
            <select
              className="select"
              value={draft.objectiveId || ''}
              onChange={(e) => setDraft({ ...draft, objectiveId: e.target.value })}
            >
              {data.objectives.map((o) => (
                <option key={o.id} value={o.id}>{o.name}</option>
              ))}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label className="field">Business priority</label>
            <select
              className="select"
              value={draft.businessPriorityId || ''}
              onChange={(e) => setDraft({ ...draft, businessPriorityId: e.target.value })}
            >
              {data.businessPriorities.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label className="field">Region</label>
            <select
              className="select"
              value={draft.regionId || ''}
              onChange={(e) => setDraft({ ...draft, regionId: e.target.value })}
            >
              {data.regions.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="field">Rationale for this change</label>
          <input
            type="text"
            className="input"
            value={rationale}
            onChange={(e) => setRationale(e.target.value)}
            placeholder={isNew ? 'Why is this campaign being added?' : 'Why is this changing?'}
          />
        </div>

        {isNew && (
          <div className="info-panel" style={{ margin: 0 }}>
            New campaigns draw their initial allocation from the hold-back reserve. Run a rebalance
            to redistribute across all unlocked campaigns instead.
          </div>
        )}
      </div>
    </Modal>
  );
}

function AdjustModal({ campaign, current, recommended, capPct, onClose, onApply, onClear }) {
  const min = 0;
  const max = Math.round(recommended * (1 + capPct / 100));
  const [draftAmount, setDraftAmount] = useState(current);
  const [rationale, setRationale] = useState('');

  const deltaPct = recommended > 0 ? ((draftAmount - recommended) / recommended) * 100 : 0;
  const overCap = deltaPct > capPct;

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
            onClick={() => onApply(Number(draftAmount), rationale)}
            disabled={overCap}
          >
            Apply adjustment
          </button>
        </>
      }
    >
      <div className="col gap-md">
        <div style={{ background: 'var(--surface-2)', padding: '10px 12px', borderRadius: '6px', fontSize: '12px' }}>
          <div className="row between"><span className="muted">Campaign</span><span>{campaign.name}</span></div>
          <div className="row between"><span className="muted">Model recommends</span><span className="mono">{formatCurrencyFull(recommended)}</span></div>
          <div className="row between"><span className="muted">Adjustment cap</span><span className="mono">±{capPct}% (max {formatCurrencyFull(max)})</span></div>
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
          <div className="tiny" style={{ marginTop: '4px', color: overCap ? 'var(--danger)' : 'var(--ink-3)' }}>
            {deltaPct >= 0 ? '+' : ''}{deltaPct.toFixed(1)}% from model
            {overCap && ' — exceeds cap, please increase cap in Settings or lower amount'}
          </div>
        </div>

        <div>
          <label className="field">Rationale (required)</label>
          <input
            type="text"
            className="input"
            value={rationale}
            onChange={(e) => setRationale(e.target.value)}
            placeholder="e.g., APAC market shift requires additional spend in Q2"
          />
        </div>
      </div>
    </Modal>
  );
}

export function CampaignList() {
  const { data, dispatch, log } = useData();
  const [editing, setEditing] = useState(null);
  const [adjusting, setAdjusting] = useState(null);
  const [confirmRebalance, setConfirmRebalance] = useState(false);

  const regionalWeights = useMemo(
    () => computeRegionalWeights(data.regions, data.rubrics),
    [data.regions, data.rubrics]
  );
  const allocations = useMemo(
    () => computeAllocations(data, regionalWeights),
    [data, regionalWeights]
  );

  const totalAllocated = data.campaigns.reduce(
    (s, c) => s + (allocations[c.id]?.current || 0),
    0
  );
  const lockedTotal = data.campaigns
    .filter((c) => c.locked)
    .reduce((s, c) => s + (allocations[c.id]?.current || 0), 0);
  const lockedPctOfPool = totalAllocated > 0 ? (lockedTotal / totalAllocated) * 100 : 0;

  const onAdd = () => setEditing({});
  const onSave = (campaign, rationale) => {
    const isNew = !campaign.id;
    if (isNew) {
      dispatch({ type: 'ADD_CAMPAIGN', changes: campaign });
      log({
        type: 'campaign-add',
        target: 'campaign',
        targetName: campaign.name,
        summary: 'New campaign added — drawing from hold-back reserve',
        rationale,
      });
    } else {
      dispatch({ type: 'UPDATE_CAMPAIGN', id: campaign.id, changes: campaign });
      log({
        type: 'campaign-edit',
        target: campaign.id,
        targetName: campaign.name,
        summary: 'Campaign updated',
        rationale,
      });
    }
    setEditing(null);
  };
  const onDelete = (rationale) => {
    const c = editing;
    dispatch({ type: 'REMOVE_CAMPAIGN', id: c.id });
    log({
      type: 'campaign-delete',
      target: c.id,
      targetName: c.name,
      summary: `Cancelled — released ${formatCurrencyFull(allocations[c.id]?.current || 0)} to hold-back`,
      rationale,
    });
    setEditing(null);
  };

  const onToggleLock = (c) => {
    dispatch({ type: 'TOGGLE_LOCK', id: c.id });
    log({
      type: c.locked ? 'unlock' : 'lock',
      target: c.id,
      targetName: c.name,
      summary: c.locked
        ? 'Unlocked — campaign rejoins rebalancing pool'
        : `Locked at ${formatCurrencyFull(allocations[c.id]?.current || 0)}`,
      rationale: '',
    });
  };

  const onApplyAdjustment = (amount, rationale) => {
    const c = adjusting;
    const old = allocations[c.id]?.current || 0;
    dispatch({ type: 'APPLY_MANUAL_ADJUSTMENT', id: c.id, amount });
    log({
      type: 'adjust',
      target: c.id,
      targetName: c.name,
      summary: `Manual adjustment: ${formatCurrencyFull(old)} → ${formatCurrencyFull(amount)}`,
      rationale,
    });
    setAdjusting(null);
  };

  const onClearAdjustment = (rationale) => {
    const c = adjusting;
    dispatch({ type: 'CLEAR_MANUAL_ADJUSTMENT', id: c.id });
    log({
      type: 'adjust-clear',
      target: c.id,
      targetName: c.name,
      summary: 'Reset to model-calculated allocation',
      rationale,
    });
    setAdjusting(null);
  };

  const onRebalance = () => {
    dispatch({ type: 'REBALANCE_ALL_UNLOCKED' });
    log({
      type: 'rebalance',
      target: 'campaigns',
      targetName: 'All unlocked campaigns',
      summary: 'Rebalanced across all unlocked campaigns based on current weights',
      rationale: '',
    });
    setConfirmRebalance(false);
  };

  return (
    <div className="section-card">
      <div className="section-header">
        <div>
          <div className="row gap-sm" style={{ alignItems: 'baseline' }}>
            <span className="section-title">Campaigns</span>
            <HelpIcon definition={DEFINITIONS.campaigns.short} />
            <span className="section-subtitle">
              {formatCurrencyFull(totalAllocated)} across {data.campaigns.length} campaigns
              {lockedPctOfPool > 50 && (
                <span style={{ color: 'var(--warn)', marginLeft: '8px' }}>
                  · ⚠ {lockedPctOfPool.toFixed(0)}% locked
                </span>
              )}
            </span>
          </div>
        </div>
        <div className="row gap-sm">
          <button className="btn sm" onClick={() => setConfirmRebalance(true)}>
            ⟳ Rebalance unlocked
          </button>
          <button className="btn sm primary" onClick={onAdd}>+ Add campaign</button>
        </div>
      </div>

      <div className="section-body">
        {data.campaigns.length === 0 ? (
          <div className="muted tiny">No campaigns yet. Add one to begin allocating.</div>
        ) : (
          data.campaigns.map((c) => {
            const a = allocations[c.id] || { current: 0, recommended: 0 };
            const obj = data.objectives.find((o) => o.id === c.objectiveId);
            const bp = data.businessPriorities.find((b) => b.id === c.businessPriorityId);
            const reg = data.regions.find((r) => r.id === c.regionId);
            const isAdjusted = c.manualAdjustment != null && !c.locked;
            const adjPct =
              isAdjusted && a.recommended > 0
                ? ((a.current - a.recommended) / a.recommended) * 100
                : 0;
            const cls = c.locked ? 'campaign-row locked' : isAdjusted ? 'campaign-row adjusted' : 'campaign-row';

            return (
              <div key={c.id} className={cls}>
                <div className="row between" style={{ alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>{c.name}</div>
                    <div className="row gap-sm" style={{ marginTop: '4px', flexWrap: 'wrap' }}>
                      {obj && <Tag>{obj.name}</Tag>}
                      {bp && <Tag>{bp.name}</Tag>}
                      {reg && <Tag>{reg.name}</Tag>}
                      {c.locked && <Tag variant="warn">🔒 Locked</Tag>}
                      {isAdjusted && (
                        <Tag variant="info">
                          ✎ Adjusted {adjPct >= 0 ? '+' : ''}{adjPct.toFixed(0)}%
                        </Tag>
                      )}
                    </div>
                  </div>
                  <div className="col" style={{ alignItems: 'flex-end', gap: '4px' }}>
                    <div className="mono" style={{ fontSize: 'var(--text-md)', fontWeight: 500 }}>
                      {formatCurrencyFull(a.current)}
                    </div>
                    <div className="row gap-sm">
                      <button
                        className="btn sm ghost"
                        onClick={() => setAdjusting(c)}
                        disabled={c.locked}
                        title={c.locked ? 'Unlock first to adjust' : 'Manually adjust amount'}
                      >
                        Adjust
                      </button>
                      <button
                        className="btn sm ghost"
                        onClick={() => onToggleLock(c)}
                        title={c.locked ? 'Unlock' : 'Lock'}
                      >
                        {c.locked ? '🔓 Unlock' : '🔒 Lock'}
                      </button>
                      <button
                        className="btn sm ghost"
                        onClick={() => setEditing(c)}
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {editing && (
        <CampaignEditModal
          campaign={editing}
          onClose={() => setEditing(null)}
          onSave={onSave}
          onDelete={onDelete}
        />
      )}

      {adjusting && (
        <AdjustModal
          campaign={adjusting}
          current={allocations[adjusting.id]?.current || 0}
          recommended={allocations[adjusting.id]?.recommended || 0}
          capPct={data.settings.manualAdjustmentCapPct}
          onClose={() => setAdjusting(null)}
          onApply={onApplyAdjustment}
          onClear={onClearAdjustment}
        />
      )}

      {confirmRebalance && (
        <Modal
          title="Rebalance unlocked campaigns?"
          onClose={() => setConfirmRebalance(false)}
          footer={
            <>
              <button className="btn ghost" onClick={() => setConfirmRebalance(false)}>Cancel</button>
              <button className="btn accent" onClick={onRebalance}>Rebalance</button>
            </>
          }
        >
          <p style={{ fontSize: '13px', color: 'var(--ink-2)', lineHeight: 1.6 }}>
            This will clear all manual adjustments on unlocked campaigns and redistribute the
            unlocked pool across them based on current weights. Locked campaigns and hard
            commitments will not be affected.
          </p>
          <p style={{ fontSize: '13px', color: 'var(--ink-2)', marginTop: '12px', lineHeight: 1.6 }}>
            <strong>{data.campaigns.filter(c => !c.locked).length}</strong> unlocked campaigns will be recalculated.
          </p>
        </Modal>
      )}
    </div>
  );
}
