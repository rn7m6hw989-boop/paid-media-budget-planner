import React from 'react';
import { formatCurrencyFull } from '../../lib/calculations.js';
import { Tag } from '../UI.jsx';

/**
 * CampaignRow — single campaign line item inside a pool group.
 * Shows name, status (locked/manual), current amount, and per-row
 * Adjust / Lock / Edit buttons.
 */
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
            {locked && <Tag>🔒 Locked</Tag>}
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

/**
 * PoolGroup — brand or demand pool inside a region's envelope.
 * Header shows the pool size, campaign count, stranded/over-allocated
 * status, and per-bucket Rebalance + Add buttons. Body lists the
 * campaigns or shows an empty state.
 */
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
  const allocated = campaigns.reduce((s, c) => s + (allocations[c.id]?.current || 0), 0);
  const stranded = poolSize - allocated;
  const overAllocated = stranded < -1; // tolerate $1 rounding
  const empty = totalCampaigns === 0;

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', marginBottom: '12px', overflow: 'hidden' }}>
      <div
        style={{
          padding: '12px 16px',
          background: 'var(--surface-2)',
          borderBottom: empty ? 'none' : '1px solid var(--border)',
        }}
      >
        <div className="row between" style={{ alignItems: 'flex-start' }}>
          <div>
            <div
              style={{
                fontSize: '11px',
                fontWeight: 500,
                color: 'var(--ink-3)',
                textTransform: 'none',
                letterSpacing: '-0.005em',
                marginBottom: '3px',
              }}
            >
              {pool === 'brand' ? 'Brand pool' : 'Demand pool'}
            </div>
            <div className="row gap-md" style={{ alignItems: 'baseline' }}>
              <span
                className="mono"
                style={{
                  fontSize: '18px',
                  fontWeight: 600,
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
                  style={{ color: overAllocated ? 'var(--danger)' : 'var(--ink-3)' }}
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

/**
 * RegionEnvelope — top-level region card. Shows envelope total + share
 * of discretionary, then renders brand and demand PoolGroups inside.
 */
export function RegionEnvelope({
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
