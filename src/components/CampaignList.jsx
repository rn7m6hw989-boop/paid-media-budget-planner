import React, { useState, useMemo } from 'react';
import { useData } from '../lib/DataContext.jsx';
import {
  computeAllocations,
  computePoolBreakdown,
  formatCurrencyFull,
  formatCurrency,
} from '../lib/calculations.js';
import { Modal, Tag } from './UI.jsx';

/* ============================================================
   Edit campaign modal — pool tag is now a required field
   ============================================================ */
function CampaignEditModal({ campaign, onClose, onSave, onDelete }) {
  const { data } = useData();
  const [draft, setDraft] = useState({ pool: 'demand', ...campaign });
  const [rationale, setRationale] = useState('');
  const isNew = !campaign.id;

  const objectivesEmpty = data.objectives.length === 0;
  const prioritiesEmpty = data.businessPriorities.length === 0;
  const regionsEmpty = data.regions.length === 0;
  const anyEmpty = objectivesEmpty || prioritiesEmpty || regionsEmpty;

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
        {anyEmpty && (
          <div
            className="info-panel"
            style={{ margin: 0, borderLeftColor: 'var(--accent)', background: 'var(--accent-soft)' }}
          >
            <strong>Heads up.</strong>{' '}
            {[
              objectivesEmpty && 'objectives',
              prioritiesEmpty && 'business priorities',
              regionsEmpty && 'regions',
            ]
              .filter(Boolean)
              .join(' / ')}{' '}
            haven't been defined yet. Add them in the Objectives &amp; Priorities and Regional Analysis tabs
            before saving this campaign — the dropdowns below will be empty until you do.
          </div>
        )}

        <div>
          <label className="field">Campaign name</label>
          <input
            type="text"
            className="input"
            value={draft.name || ''}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            placeholder="e.g., Always-on demand-gen — US"
          />
        </div>

        <div className="row gap-md">
          <div style={{ flex: 1 }}>
            <label className="field">Pool</label>
            <select
              className="select"
              value={draft.pool || 'demand'}
              onChange={(e) => setDraft({ ...draft, pool: e.target.value })}
            >
              <option value="brand">Brand</option>
              <option value="demand">Demand</option>
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label className="field">Region</label>
            <select
              className="select"
              value={draft.regionId || ''}
              onChange={(e) => setDraft({ ...draft, regionId: e.target.value })}
            >
              <option value="" disabled>Select region…</option>
              {data.regions.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="row gap-md">
          <div style={{ flex: 1 }}>
            <label className="field">Objective</label>
            <select
              className="select"
              value={draft.objectiveId || ''}
              onChange={(e) => setDraft({ ...draft, objectiveId: e.target.value })}
            >
              <option value="" disabled>Select objective…</option>
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
              <option value="" disabled>Select priority…</option>
              {data.businessPriorities.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
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

        {isNew && !anyEmpty && (
          <div className="info-panel" style={{ margin: 0 }}>
            New campaigns enter their tagged pool and trigger rebalancing within that bucket
            (region × pool). Other campaigns in the same bucket will absorb the change proportionally.
          </div>
        )}
      </div>
    </Modal>
  );
}

/* ============================================================
   Adjust modal — enforces AND of pool fit + ±50% deviation
   ============================================================ */
function AdjustModal({
  campaign,
  current,
  recommended,
  capPct,
  poolMax, // max allowed without breaking the pool sum
  onClose,
  onApply,
  onClear,
}) {
  // Cap from ±50% rule (deviation from recommended)
  const capDeviation = Math.round(recommended * (1 + capPct / 100));
  // Tighter of the two upper limits
  const effectiveMax = Math.max(0, Math.min(capDeviation, poolMax));

  const [draftAmount, setDraftAmount] = useState(current);
  const [rationale, setRationale] = useState('');

  const draft = Number(draftAmount) || 0;
  const deltaPct = recommended > 0 ? ((draft - recommended) / recommended) * 100 : 0;
  const overDeviationCap = Math.abs(deltaPct) > capPct;
  const overPoolCap = draft > poolMax;
  const invalid = overDeviationCap || overPoolCap || draft < 0;

  const limitingRule = overPoolCap
    ? 'pool'
    : overDeviationCap
      ? 'deviation'
      : null;

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
        <div
          style={{
            background: 'var(--surface-2)',
            padding: '12px 14px',
            fontSize: '12px',
          }}
        >
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
            style={{ marginTop: '6px', paddingTop: '6px', borderTop: '1px solid var(--border)' }}
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

/* ============================================================
   Single campaign row — minimal, sits within a pool group
   ============================================================ */
function CampaignRow({ campaign, allocation, onEdit, onAdjust, onToggleLock }) {
  const adjusted = campaign.manualAdjustment != null;
  const locked = campaign.locked;
  const cls = locked ? 'campaign-row locked' : adjusted ? 'campaign-row adjusted' : 'campaign-row';
  return (
    <div className={cls}>
      <div className="row between" style={{ alignItems: 'flex-start' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 'var(--text-sm)',
              fontWeight: 500,
              color: 'var(--ink)',
              marginBottom: '4px',
            }}
          >
            {campaign.name}
          </div>
          <div className="row gap-sm" style={{ flexWrap: 'wrap' }}>
            {locked && <Tag variant="warn">🔒 Locked</Tag>}
            {!locked && adjusted && <Tag variant="danger">Manual</Tag>}
          </div>
        </div>
        <div className="row gap-md" style={{ alignItems: 'center' }}>
          <span
            className="mono"
            style={{
              fontSize: 'var(--text-sm)',
              fontWeight: 500,
              color: 'var(--ink)',
              minWidth: '90px',
              textAlign: 'right',
            }}
          >
            {formatCurrencyFull(allocation.current)}
          </span>
          <div className="row gap-sm">
            <button className="btn sm ghost" onClick={() => onAdjust(campaign)}>
              Adjust
            </button>
            <button className="btn sm ghost" onClick={() => onToggleLock(campaign)}>
              {locked ? 'Unlock' : 'Lock'}
            </button>
            <button className="btn sm ghost" onClick={() => onEdit(campaign)}>
              Edit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   Pool group — brand or demand pool within a region's envelope
   ============================================================ */
function PoolGroup({
  region,
  pool, // 'brand' | 'demand'
  poolSize,
  campaigns,
  allocations,
  onAdd,
  onEdit,
  onAdjust,
  onToggleLock,
  onRebalance,
}) {
  const totalCampaigns = campaigns.length;
  const allocated = campaigns.reduce(
    (s, c) => s + (allocations[c.id]?.current || 0),
    0
  );
  const stranded = poolSize - allocated;
  const overAllocated = stranded < -1; // tolerate $1 rounding
  const empty = totalCampaigns === 0;

  return (
    <div
      style={{
        background: 'white',
        border: '1px solid var(--border)',
        marginBottom: '12px',
      }}
    >
      <div
        style={{
          padding: '12px 16px',
          background: 'var(--surface-2)',
          borderBottom: empty ? 'none' : '1px solid var(--border)',
          borderLeft: `3px solid ${pool === 'brand' ? 'var(--accent)' : '#666'}`,
        }}
      >
        <div className="row between" style={{ alignItems: 'flex-start' }}>
          <div>
            <div
              style={{
                fontSize: '10px',
                fontWeight: 500,
                color: pool === 'brand' ? 'var(--accent)' : 'var(--ink-3)',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginBottom: '2px',
              }}
            >
              {pool} pool
            </div>
            <div className="row gap-md" style={{ alignItems: 'baseline' }}>
              <span
                className="mono"
                style={{
                  fontSize: '20px',
                  fontWeight: 300,
                  color: 'var(--ink)',
                  letterSpacing: '-0.02em',
                }}
              >
                {formatCurrencyFull(poolSize)}
              </span>
              <span className="tiny muted">
                {totalCampaigns} campaign{totalCampaigns === 1 ? '' : 's'}
              </span>
              {!empty && Math.abs(stranded) > 1 && (
                <span
                  className="tiny"
                  style={{ color: overAllocated ? 'var(--accent)' : 'var(--ink-3)' }}
                >
                  {overAllocated
                    ? `${formatCurrencyFull(Math.abs(stranded))} OVER-ALLOCATED`
                    : `${formatCurrencyFull(stranded)} unallocated`}
                </span>
              )}
            </div>
          </div>
          <div className="row gap-sm">
            {!empty && (
              <button
                className="btn sm"
                onClick={() => onRebalance(region.id, pool)}
                title="Rebalance unlocked campaigns in this pool"
              >
                ⟲ Rebalance
              </button>
            )}
            <button
              className="btn sm primary"
              onClick={() => onAdd(region.id, pool)}
              title="Add campaign to this pool"
            >
              + Add
            </button>
          </div>
        </div>
      </div>

      {empty ? (
        <div
          style={{
            padding: '14px 16px',
            fontSize: 'var(--text-xs)',
            color: 'var(--ink-3)',
            fontStyle: 'italic',
          }}
        >
          No campaigns. {formatCurrencyFull(poolSize)} unallocated in this pool.
        </div>
      ) : (
        <div style={{ padding: '8px' }}>
          {campaigns.map((c) => (
            <CampaignRow
              key={c.id}
              campaign={c}
              allocation={allocations[c.id] || { current: 0 }}
              onEdit={onEdit}
              onAdjust={onAdjust}
              onToggleLock={onToggleLock}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   Region envelope — wraps brand pool + demand pool
   ============================================================ */
function RegionEnvelope({
  region,
  envelope,
  campaigns,
  allocations,
  onAdd,
  onEdit,
  onAdjust,
  onToggleLock,
  onRebalance,
}) {
  const brandCampaigns = campaigns.filter((c) => c.pool === 'brand');
  const demandCampaigns = campaigns.filter((c) => c.pool === 'demand');

  return (
    <div className="section-card">
      <div className="section-header">
        <div>
          <div className="section-title">{region.name}</div>
          <div className="section-subtitle">
            Envelope:{' '}
            <span className="mono" style={{ color: 'var(--ink)' }}>
              {formatCurrencyFull(envelope.envelope)}
            </span>{' '}
            <span className="muted">({(envelope.share * 100).toFixed(1)}% of discretionary)</span>
          </div>
        </div>
      </div>
      <div className="section-body">
        <PoolGroup
          region={region}
          pool="brand"
          poolSize={envelope.brandPool}
          campaigns={brandCampaigns}
          allocations={allocations}
          onAdd={onAdd}
          onEdit={onEdit}
          onAdjust={onAdjust}
          onToggleLock={onToggleLock}
          onRebalance={onRebalance}
        />
        <PoolGroup
          region={region}
          pool="demand"
          poolSize={envelope.demandPool}
          campaigns={demandCampaigns}
          allocations={allocations}
          onAdd={onAdd}
          onEdit={onEdit}
          onAdjust={onAdjust}
          onToggleLock={onToggleLock}
          onRebalance={onRebalance}
        />
      </div>
    </div>
  );
}

/* ============================================================
   Main CampaignList — replaces the flat list with bucket layout
   ============================================================ */
export function CampaignList() {
  const { data, dispatch, log } = useData();
  const [editing, setEditing] = useState(null);
  const [adjusting, setAdjusting] = useState(null);

  const allocations = useMemo(() => computeAllocations(data), [data]);
  const pool = useMemo(() => computePoolBreakdown(data), [data]);

  // Empty state warnings
  const objectivesEmpty = data.objectives.length === 0;
  const prioritiesEmpty = data.businessPriorities.length === 0;
  const regionsEmpty = data.regions.length === 0;
  const anyEmpty = objectivesEmpty || prioritiesEmpty || regionsEmpty;

  const onAdd = (regionId, poolTag) => {
    setEditing({ regionId, pool: poolTag });
  };

  const onSave = (campaign, rationale) => {
    const isNew = !campaign.id;
    if (isNew) {
      dispatch({ type: 'ADD_CAMPAIGN', changes: campaign });
      log({
        type: 'campaign-add',
        target: 'campaign',
        targetName: campaign.name,
        summary: `New ${campaign.pool} campaign added in ${data.regions.find((r) => r.id === campaign.regionId)?.name || 'region'}`,
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
      summary: `Cancelled — ${formatCurrencyFull(allocations[c.id]?.current || 0)} returned to pool`,
      rationale,
    });
    setEditing(null);
  };

  const [lockAlert, setLockAlert] = useState(null);

  const onToggleLock = (c) => {
    if (!c.locked) {
      // Locking — verify the lock amount fits the pool with other already-locked campaigns
      const env = pool.envelopes[c.regionId];
      const poolTag = c.pool || 'demand';
      const bucketSize = env ? env[`${poolTag}Pool`] : 0;
      const lockAmount = allocations[c.id]?.current || 0;

      // Sum of OTHER locked amounts in this bucket (excluding the campaign being locked)
      const otherLocked = data.campaigns
        .filter(
          (other) =>
            other.id !== c.id &&
            other.regionId === c.regionId &&
            (other.pool || 'demand') === poolTag &&
            other.locked
        )
        .reduce((s, other) => s + (allocations[other.id]?.current || 0), 0);

      if (lockAmount + otherLocked > bucketSize + 1) {
        // Would over-lock the pool — refuse
        setLockAlert({
          campaignName: c.name,
          attempted: lockAmount,
          available: Math.max(0, bucketSize - otherLocked),
          regionName: data.regions.find((r) => r.id === c.regionId)?.name || 'this region',
          poolTag,
        });
        // Auto-dismiss after 8 seconds
        setTimeout(() => setLockAlert(null), 8000);
        return;
      }
    }
    dispatch({ type: 'TOGGLE_LOCK', id: c.id });
    log({
      type: c.locked ? 'unlock' : 'lock',
      target: c.id,
      targetName: c.name,
      summary: c.locked
        ? 'Unlocked — campaign rejoins pool rebalancing'
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

  const onRebalanceBucket = (regionId, poolTag) => {
    // Per-bucket rebalance: clear manual adjustments for unlocked campaigns in this bucket
    const bucketCampaigns = data.campaigns.filter(
      (c) => c.regionId === regionId && (c.pool || 'demand') === poolTag && !c.locked
    );
    let cleared = 0;
    for (const c of bucketCampaigns) {
      if (c.manualAdjustment != null) {
        dispatch({ type: 'CLEAR_MANUAL_ADJUSTMENT', id: c.id });
        cleared++;
      }
    }
    const region = data.regions.find((r) => r.id === regionId);
    log({
      type: 'rebalance',
      target: `${regionId}-${poolTag}`,
      targetName: `${region?.name || regionId} — ${poolTag} pool`,
      summary:
        cleared === 0
          ? `Rebalance triggered (no adjustments to clear)`
          : `Cleared ${cleared} manual adjustment${cleared === 1 ? '' : 's'}; bucket reverts to model normalization`,
      rationale: '',
    });
  };

  // Compute the pool fit cap for the campaign currently being adjusted.
  // Pool fit max = bucket total - other LOCKED campaigns' amounts - other UNLOCKED campaigns' minimums.
  // For simplicity: pool fit max = bucket total - all other campaigns' current amounts.
  const computePoolFitMax = (campaign) => {
    if (!campaign) return 0;
    const env = pool.envelopes[campaign.regionId];
    if (!env) return 0;
    const bucketSize = env[`${campaign.pool || 'demand'}Pool`];
    const others = data.campaigns.filter(
      (c) =>
        c.id !== campaign.id &&
        c.regionId === campaign.regionId &&
        (c.pool || 'demand') === (campaign.pool || 'demand')
    );
    const otherTotal = others.reduce((s, c) => s + (allocations[c.id]?.current || 0), 0);
    return Math.max(0, bucketSize - otherTotal);
  };

  // Empty-data warning at top
  return (
    <>
      {lockAlert && (
        <div
          className="info-panel"
          style={{
            background: 'var(--accent-soft)',
            borderLeftColor: 'var(--accent)',
            color: 'var(--accent-ink)',
            marginBottom: '20px',
            position: 'relative',
          }}
        >
          <strong>Lock refused.</strong> Cannot lock <em>{lockAlert.campaignName}</em> at{' '}
          {formatCurrencyFull(lockAlert.attempted)} — only{' '}
          {formatCurrencyFull(lockAlert.available)} is available in {lockAlert.regionName}'s{' '}
          {lockAlert.poolTag} pool. Reduce the campaign amount or unlock other campaigns in this
          bucket first.
          <button
            onClick={() => setLockAlert(null)}
            style={{
              position: 'absolute',
              top: 8,
              right: 10,
              background: 'transparent',
              border: 'none',
              fontSize: 16,
              color: 'var(--accent-ink)',
              cursor: 'pointer',
            }}
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      )}

      {anyEmpty && (
        <div
          className="info-panel"
          style={{
            background: 'var(--accent-soft)',
            borderLeftColor: 'var(--accent)',
            color: 'var(--accent-ink)',
            marginBottom: '20px',
          }}
        >
          <strong>Setup needed.</strong> Before campaigns can be allocated meaningfully, you need to define{' '}
          {[
            objectivesEmpty && 'objectives',
            prioritiesEmpty && 'business priorities',
            regionsEmpty && 'regions',
          ]
            .filter(Boolean)
            .join(', ')}
          . Visit the{' '}
          {[
            (objectivesEmpty || prioritiesEmpty) && 'Objectives & Priorities',
            regionsEmpty && 'Regional Analysis',
          ]
            .filter(Boolean)
            .join(' and ')}{' '}
          tab{[objectivesEmpty || prioritiesEmpty, regionsEmpty].filter(Boolean).length > 1 ? 's' : ''} to get
          started. You can also load sample data from Settings to see a populated example.
        </div>
      )}

      {data.regions.length === 0 ? (
        <div
          className="muted tiny"
          style={{
            padding: '32px',
            textAlign: 'center',
            border: '1px dashed var(--border)',
            background: 'white',
          }}
        >
          No regions defined yet. Add regions in the Regional Analysis tab to begin allocating campaigns.
        </div>
      ) : (
        data.regions.map((region) => {
          const envelope = pool.envelopes[region.id];
          if (!envelope) return null;
          const regionCampaigns = data.campaigns.filter((c) => c.regionId === region.id);
          return (
            <RegionEnvelope
              key={region.id}
              region={region}
              envelope={envelope}
              campaigns={regionCampaigns}
              allocations={allocations}
              onAdd={onAdd}
              onEdit={(c) => setEditing(c)}
              onAdjust={(c) => setAdjusting(c)}
              onToggleLock={onToggleLock}
              onRebalance={onRebalanceBucket}
            />
          );
        })
      )}

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
          current={allocations[adjusting.id]?.current ?? 0}
          recommended={allocations[adjusting.id]?.recommended ?? 0}
          capPct={data.settings?.manualAdjustmentCapPct ?? 50}
          poolMax={computePoolFitMax(adjusting)}
          onClose={() => setAdjusting(null)}
          onApply={onApplyAdjustment}
          onClear={onClearAdjustment}
        />
      )}
    </>
  );
}
