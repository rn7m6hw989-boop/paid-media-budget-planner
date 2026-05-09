import React, { useMemo } from 'react';
import { useData } from '../../lib/DataContext.jsx';
import { computeRegionalWeights, computeStrategicLabel, LABEL_META } from '../../lib/calculations.js';
import { Tag } from '../UI.jsx';

/**
 * AllocatorPreview — strip of cards at the bottom of Regional Analysis
 * showing each region's resulting commercial weight + strategic label.
 * Updates live as scoring inputs change so users see the strategic
 * outcome at a glance.
 */
export function AllocatorPreview() {
  const { data } = useData();
  const regionalWeights = useMemo(
    () => computeRegionalWeights(data.regions, data.rubrics),
    [data.regions, data.rubrics]
  );

  if (!data.regions || data.regions.length === 0) return null;

  return (
    <div className="section-card">
      <div className="section-header">
        <div>
          <div className="section-title">Allocator output preview</div>
          <div className="section-subtitle">
            Resulting commercial weight and strategic label per region. These flow into Budget
            Allocation.
          </div>
        </div>
      </div>
      <div className="section-body">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '12px',
          }}
        >
          {data.regions.map((r) => {
            const labelKey = computeStrategicLabel(r.commercial);
            const labelMeta = LABEL_META[labelKey];
            const weight = regionalWeights[r.id]?.commercial ?? 1;
            return (
              <div
                key={r.id}
                style={{
                  background: 'white',
                  border: '1px solid var(--border)',
                  borderLeft: '3px solid var(--accent)',
                  padding: '14px 16px',
                }}
              >
                <div
                  style={{
                    fontSize: 'var(--text-xs)',
                    color: 'var(--ink-3)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    fontWeight: 500,
                    marginBottom: '6px',
                  }}
                >
                  {r.name}
                </div>
                <div
                  style={{
                    fontSize: '24px',
                    fontWeight: 300,
                    color: 'var(--ink)',
                    fontVariantNumeric: 'tabular-nums',
                    letterSpacing: '-0.02em',
                    lineHeight: 1.1,
                    marginBottom: '8px',
                  }}
                >
                  {weight.toFixed(2)}×
                </div>
                <Tag variant={labelMeta.tone}>{labelMeta.label}</Tag>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
