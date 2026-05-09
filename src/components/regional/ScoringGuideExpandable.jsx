import React, { useState } from 'react';
import { useData } from '../../lib/DataContext.jsx';

/**
 * ScoringGuideExpandable — collapsible reference panel showing every
 * factor's 1–5 anchor definitions. Lives at the top of the Regional
 * Analysis page. One of two affordances for surfacing scoring guidance
 * (the other is the FactorPopover on hover).
 */
export function ScoringGuideExpandable() {
  const { data } = useData();
  const [open, setOpen] = useState(false);

  const renderRubric = (rubricKey, rubricLabel) => {
    const factors = data.rubrics[rubricKey].factors;
    return (
      <div style={{ marginBottom: '20px' }}>
        <h4
          style={{
            fontSize: 'var(--text-md)',
            fontWeight: 500,
            color: 'var(--ink)',
            marginBottom: '12px',
            paddingBottom: '6px',
            borderBottom: '1px solid var(--border)',
          }}
        >
          {rubricLabel} rubric
        </h4>
        {factors.map((f) => (
          <div key={f.id} style={{ marginBottom: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '4px' }}>
              <span style={{ fontSize: 'var(--text-base)', fontWeight: 500, color: 'var(--ink)' }}>
                {f.name}
              </span>
              <span
                style={{
                  fontSize: 'var(--text-xs)',
                  color: 'var(--ink-3)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  fontWeight: 500,
                }}
              >
                {f.weight}% importance
              </span>
            </div>
            <div
              style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--ink-3)',
                marginBottom: '10px',
                lineHeight: 1.6,
              }}
            >
              {f.description}
            </div>
            {f.anchors && f.anchors.length > 0 && (
              <div
                style={{
                  background: 'var(--surface-2)',
                  padding: '10px 14px',
                  borderRadius: 'var(--r-sm)',
                }}
              >
                {[...f.anchors]
                  .sort((a, b) => b.score - a.score)
                  .map((a) => (
                    <div
                      key={a.score}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '24px 1fr',
                        gap: '12px',
                        padding: '6px 0',
                        borderTop: '1px solid var(--border)',
                        fontSize: 'var(--text-xs)',
                      }}
                    >
                      <span
                        style={{
                          fontVariantNumeric: 'tabular-nums',
                          fontSize: 14,
                          fontWeight: 600,
                          color: 'var(--accent)',
                          textAlign: 'center',
                        }}
                      >
                        {a.score}
                      </span>
                      <span style={{ color: 'var(--ink-2)', lineHeight: 1.6 }}>{a.definition}</span>
                    </div>
                  ))}
              </div>
            )}
            {f.note && (
              <div
                style={{
                  fontSize: 'var(--text-xs)',
                  color: 'var(--ink-3)',
                  fontStyle: 'italic',
                  marginTop: '8px',
                  lineHeight: 1.6,
                }}
              >
                {f.note}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

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
        <span style={{ color: 'var(--ink-3)' }}>
          Scoring guide — full 1–5 anchor definitions for every factor
        </span>
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
            padding: '18px',
            borderTop: '1px solid var(--border)',
            fontSize: 'var(--text-sm)',
          }}
        >
          <div className="tiny muted" style={{ marginBottom: '14px', lineHeight: 1.6 }}>
            Use these definitions when scoring regions. You can also hover any factor name in the
            tables below to see the anchors inline. Calibrate to your business — the exact dollar
            thresholds and segment definitions should match how your company already segments
            markets.
          </div>
          {renderRubric('commercial', 'Commercial')}
          {renderRubric('brand', 'Brand')}
        </div>
      )}
    </div>
  );
}
