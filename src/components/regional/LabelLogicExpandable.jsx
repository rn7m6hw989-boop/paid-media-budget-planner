import React, { useState } from 'react';
import { Tag } from '../UI.jsx';

/**
 * LabelLogicExpandable — collapsible explainer at the top of the
 * Regional Analysis page. Documents the four rules that map commercial
 * scores to strategic labels (Defend / Grow / Build / Maintain) so
 * senior reviewers can audit any region's classification.
 */
export function LabelLogicExpandable() {
  const [open, setOpen] = useState(false);

  return (
    <div className="section-card" style={{ marginBottom: '16px' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          padding: '12px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'transparent',
          border: 'none',
          textAlign: 'left',
          cursor: 'pointer',
          fontFamily: 'inherit',
          fontSize: 'var(--text-sm)',
        }}
      >
        <span style={{ color: 'var(--ink-3)' }}>How are strategic labels calculated?</span>
        <span
          style={{
            display: 'inline-block',
            transition: 'transform 0.15s',
            transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
            color: 'var(--ink-3)',
          }}
        >
          ›
        </span>
      </button>

      {open && (
        <div
          style={{
            padding: '0 18px 18px 18px',
            borderTop: '1px solid var(--border)',
            paddingTop: '14px',
            fontSize: 'var(--text-sm)',
            color: 'var(--ink-2)',
            lineHeight: 1.7,
          }}
        >
          <p style={{ marginBottom: '12px' }}>
            Each region is evaluated against four rules in order. The first matching rule wins;
            otherwise the region defaults to <strong>Maintain</strong>.
          </p>

          <div className="col gap-md">
            <div>
              <Tag variant="label-defend">Defend</Tag>{' '}
              <span style={{ marginLeft: '8px' }}>
                <code style={{ fontSize: '12px' }}>revenue ≥ 4</code> AND (
                <code style={{ fontSize: '12px' }}>comp_intensity = 5</code> OR{' '}
                <code style={{ fontSize: '12px' }}>comp_intensity = 4 AND whitespace ≤ 2</code>)
              </span>
              <div className="tiny muted" style={{ marginTop: '4px', marginLeft: '4px' }}>
                Protect a meaningful base from active, well-funded competitive threat with limited
                room to outgrow them.
              </div>
            </div>

            <div>
              <Tag variant="label-grow">Grow</Tag>{' '}
              <span style={{ marginLeft: '8px' }}>
                <code style={{ fontSize: '12px' }}>revenue ≥ 3</code> AND{' '}
                <code style={{ fontSize: '12px' }}>whitespace ≥ 3</code> AND{' '}
                <code style={{ fontSize: '12px' }}>mix_fit ≥ 3</code> AND{' '}
                <code style={{ fontSize: '12px' }}>comp_intensity ≤ 3</code> AND at least one of
                those first three is ≥ 4
              </span>
              <div className="tiny muted" style={{ marginTop: '4px', marginLeft: '4px' }}>
                Lean in offensively from an existing position. Requires a launching pad, real
                headroom, manageable competition, and at least one signal of distinction (not just
                "average everywhere").
              </div>
            </div>

            <div>
              <Tag variant="label-build">Build</Tag>{' '}
              <span style={{ marginLeft: '8px' }}>
                <code style={{ fontSize: '12px' }}>tam ≥ 4</code> AND{' '}
                <code style={{ fontSize: '12px' }}>mix_fit ≥ 3</code> AND{' '}
                <code style={{ fontSize: '12px' }}>revenue ≤ 3</code> AND{' '}
                <code style={{ fontSize: '12px' }}>comp_intensity ≤ 3</code>
              </span>
              <div className="tiny muted" style={{ marginTop: '4px', marginLeft: '4px' }}>
                Establish presence in a strategically valuable long-term opportunity with affordable
                competitive landscape.
              </div>
            </div>

            <div>
              <Tag variant="label-maintain">Maintain</Tag>{' '}
              <span style={{ marginLeft: '8px' }}>default — no other rule fired</span>
              <div className="tiny muted" style={{ marginTop: '4px', marginLeft: '4px' }}>
                Stable, lower-priority. No meaningful base to defend, no growth distinction, no
                large opportunity to build into.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
