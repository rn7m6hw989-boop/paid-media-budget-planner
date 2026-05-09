import React, { useState, useMemo } from 'react';
import { useData } from '../lib/DataContext.jsx';
import {
  computeAllocations,
  computePoolBreakdown,
  formatCurrencyFull,
} from '../lib/calculations.js';
import { CampaignEditModal } from './budget/CampaignEditModal.jsx';
import { AdjustModal } from './budget/AdjustModal.jsx';
import { RegionEnvelope } from './budget/RegionEnvelope.jsx';

/**
 * CampaignList — main orchestrator for the Budget Allocation page's
 * envelope/pool layout.
 *
 * Responsibilities (the only ones that should remain here):
 *   - Compute pool breakdown and allocations
 *   - Render a RegionEnvelope per region
 *   - Wire up edit/adjust modals
 *   - Validate lock and adjust actions against pool capacity
 *   - Surface empty-data and lock-refused alerts
 *   - Per-bucket rebalance dispatch
 *
 * Display logic lives in budget/RegionEnvelope, budget/CampaignEditModal,
 * budget/AdjustModal.
 */
export function CampaignList() {
  const { data, dispatch, log } = useData();
  const [editing, setEditing] = useState(null);
  const [adjusting, setAdjusting] = useState(null);
  const [lockAlert, setLockAlert] = useState(null);

  const allocations = useMemo(() => computeAllocations(data), [data]);
  const pool = useMemo(() => computePoolBreakdown(data), [data]);

  // Empty-state warnings
  const objectivesEmpty = data.objectives.length === 0;
  const prioritiesEmpty = data.businessPriorities.length === 0;
  const regionsEmpty = data.regions.length === 0;
  const anyEmpty = objectivesEmpty || prioritiesEmpty || regionsEmpty;

  /* ---------- Campaign create / edit / delete ---------- */

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
        summary: `New ${campaign.pool} campaign added in ${
          data.regions.find((r) => r.id === campaign.regionId)?.name || 'region'
        }`,
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

  /* ---------- Lock with pool-fit guard ---------- */

  const onToggleLock = (c) => {
    if (!c.locked) {
      // Locking — verify the lock amount fits with other already-locked campaigns in the bucket
      const env = pool.envelopes[c.regionId];
      const poolTag = c.pool || 'demand';
      const bucketSize = env ? env[`${poolTag}Pool`] : 0;
      const lockAmount = allocations[c.id]?.current || 0;

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
        setLockAlert({
          campaignName: c.name,
          attempted: lockAmount,
          available: Math.max(0, bucketSize - otherLocked),
          regionName: data.regions.find((r) => r.id === c.regionId)?.name || 'this region',
          poolTag,
        });
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

  /* ---------- Manual adjustment apply / clear ---------- */

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

  /* ---------- Per-bucket rebalance ---------- */

  const onRebalanceBucket = (regionId, poolTag) => {
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

  /* ---------- Pool fit max for AdjustModal ---------- */

  // Pool fit max for a campaign = bucket size − (sum of other campaigns' current amounts in same bucket).
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

  /* ---------- Render ---------- */

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
          <strong>Setup needed.</strong> Before campaigns can be allocated meaningfully, you need to
          define{' '}
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
          tab
          {[objectivesEmpty || prioritiesEmpty, regionsEmpty].filter(Boolean).length > 1 ? 's' : ''}{' '}
          to get started. You can also load sample data from Settings to see a populated example.
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
          No regions defined yet. Add regions in the Regional Analysis tab to begin allocating
          campaigns.
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
