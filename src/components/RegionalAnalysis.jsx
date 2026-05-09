import React, { useMemo, useState } from 'react';
import { useData } from '../lib/DataContext.jsx';
import {
  computeRegionalWeights,
  computeStrategicLabel,
  LABEL_META,
} from '../lib/calculations.js';
import { InfoPanel, Tag } from './UI.jsx';

/* ============================================================
   FactorPopover — rich popover showing scoring anchors on hover
   Replaces the simple HelpIcon for factor names in this tab.
   ============================================================ */
function FactorPopover({ factor, children }) {
  const [show, setShow] = useState(false);
  return (
    <span
      className="factor-trigger"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onFocus={() => setShow(true)}
      onBlur={() => setShow(false)}
      tabIndex={0}
    >
      {children || factor.name}
      {show && (
        <span className="anchor-popover" role="tooltip">
          <div className="anchor-popover-title">{factor.name}</div>
          <div className="anchor-popover-desc">{factor.description}</div>
          {factor.anchors && factor.anchors.length > 0 ? (
            <>
              {[...factor.anchors]
                .sort((a, b) => b.score - a.score)
                .map((a) => (
                  <div key={a.score} className="anchor-row">
                    <span className="anchor-score">{a.score}</span>
                    <span className="anchor-def">{a.definition}</span>
                  </div>
                ))}
            </>
          ) : null}
          {factor.note ? (
            <div className="anchor-popover-note">{factor.note}</div>
          ) : null}
        </span>
      )}
    </span>
  );
}

/* ============================================================
   ScoringGuideExpandable — full scoring rubric reference at top
   ============================================================ */
function ScoringGuideExpandable() {
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
            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: '10px',
                marginBottom: '4px',
              }}
            >
              <span
                style={{
                  fontSize: 'var(--text-base)',
                  fontWeight: 500,
                  color: 'var(--ink)',
                }}
              >
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
                      <span style={{ color: 'var(--ink-2)', lineHeight: 1.6 }}>
                        {a.definition}
                      </span>
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
          <div
            className="tiny muted"
            style={{ marginBottom: '14px', lineHeight: 1.6 }}
          >
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

/* ============================================================
   Factor importance row
   ============================================================ */
function FactorImportanceRow({ rubricKey, rubricLabel }) {
  const { data, dispatch, log } = useData();
  const factors = data.rubrics[rubricKey].factors;
  const total = factors.reduce((s, f) => s + Number(f.weight), 0);

  const updateWeight = (factorId, value) => {
    const old = factors.find((f) => f.id === factorId)?.weight;
    dispatch({ type: 'UPDATE_FACTOR_WEIGHT', rubric: rubricKey, factorId, value: Number(value) });
    if (old !== Number(value)) {
      log({
        type: 'rubric',
        target: factorId,
        targetName: `${rubricLabel} factor: ${factors.find((f) => f.id === factorId)?.name}`,
        summary: `Importance: ${old}% → ${value}%`,
        rationale: '',
      });
    }
  };

  return (
    <div className="section-card">
      <div className="section-header">
        <div>
          <div className="section-title">{rubricLabel} factor importance</div>
          <div className="section-subtitle">
            Must sum to 100%. Currently:{' '}
            <span className="mono" style={{ color: total === 100 ? 'var(--success)' : 'var(--accent)', fontWeight: 500 }}>
              {total}%
            </span>
          </div>
        </div>
      </div>
      <div className="section-body">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
          {factors.map((f) => (
            <div key={f.id}>
              <div className="row between" style={{ marginBottom: '6px' }}>
                <span className="tiny">
                  <FactorPopover factor={f} />
                </span>
                <span className="mono tiny" style={{ fontWeight: 500 }}>{f.weight}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={50}
                step={1}
                value={f.weight}
                onChange={(e) => updateWeight(f.id, e.target.value)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   Scoring matrix — commercial gets the Label column
   ============================================================ */
function ScoringMatrix({ rubricKey, rubricLabel, weightKey, showLabel = false }) {
  const { data, dispatch, log } = useData();
  const factors = data.rubrics[rubricKey].factors;
  const regionalWeights = useMemo(
    () => computeRegionalWeights(data.regions, data.rubrics),
    [data.regions, data.rubrics]
  );

  const updateScore = (regionId, factorId, value) => {
    const v = Math.max(1, Math.min(5, Number(value) || 0));
    const oldRegion = data.regions.find((r) => r.id === regionId);
    const oldVal = oldRegion?.[rubricKey]?.[factorId];
    dispatch({ type: 'UPDATE_REGION_SCORE', id: regionId, rubric: rubricKey, factorId, value: v });
    if (oldVal !== v) {
      log({
        type: 'region-score',
        target: regionId,
        targetName: `${oldRegion?.name} — ${factors.find((f) => f.id === factorId)?.name} (${rubricLabel})`,
        summary: `Score: ${oldVal} → ${v}`,
        rationale: '',
      });
    }
  };

  // Compute composite score for each region
  const totalImportance = factors.reduce((s, f) => s + Number(f.weight), 0) || 1;
  const composites = data.regions.map((r) => {
    let sum = 0;
    for (const f of factors) {
      sum += (r[rubricKey]?.[f.id] ?? 0) * (f.weight / totalImportance);
    }
    return { id: r.id, score: sum };
  });

  return (
    <div className="section-card">
      <div className="section-header">
        <div>
          <div className="section-title">{rubricLabel} region scores</div>
          <div className="section-subtitle">
            1–5 scale per input.
            {showLabel
              ? ' Score column is the weighted average. Label is auto-derived from revenue, whitespace, competitive intensity, TAM, and mix fit.'
              : ' Score column is the weighted average. Weight is normalized so 1.0 = average region.'}
          </div>
        </div>
      </div>
      <div className="section-body dense">
        <table className="t">
          <thead>
              <tr>
                <th>Region</th>
                {factors.map((f) => (
                  <th key={f.id} className="center">
                    <FactorPopover factor={f}>
                      <span style={{ textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '10px' }}>
                        {f.name}
                      </span>
                    </FactorPopover>
                  </th>
                ))}
                <th className="num">Score</th>
                {showLabel && <th className="center">Label</th>}
                <th className="num">Weight</th>
              </tr>
            </thead>
            <tbody>
              {data.regions.map((r) => {
                const composite = composites.find((c) => c.id === r.id)?.score || 0;
                const weight = regionalWeights[r.id]?.[weightKey] ?? 1;
                const labelKey = showLabel ? computeStrategicLabel(r.commercial) : null;
                const labelMeta = labelKey ? LABEL_META[labelKey] : null;

                return (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 500 }}>{r.name}</td>
                    {factors.map((f) => (
                      <td key={f.id} className="center">
                        <input
                          type="number"
                          className="score-input"
                          min={1}
                          max={5}
                          value={r[rubricKey]?.[f.id] ?? 0}
                          onChange={(e) => updateScore(r.id, f.id, e.target.value)}
                        />
                      </td>
                    ))}
                    <td className="num">{composite.toFixed(2)}</td>
                    {showLabel && labelMeta && (
                      <td className="center">
                        <Tag variant={labelMeta.tone}>{labelMeta.label}</Tag>
                      </td>
                    )}
                    <td className="num" style={{ color: 'var(--accent)', fontWeight: 500 }}>
                      {weight.toFixed(2)}×
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
      </div>
    </div>
  );
}

/* ============================================================
   "How is this calculated?" expandable
   ============================================================ */
function LabelLogicExpandable() {
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
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: 'var(--ink-3)' }}>How are strategic labels calculated?</span>
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

/* ============================================================
   Allocator output preview
   ============================================================ */
function AllocatorPreview() {
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
            Resulting commercial weight and strategic label per region. These flow into Budget Allocation.
          </div>
        </div>
      </div>
      <div className="section-body">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
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

/* ============================================================
   Main component
   ============================================================ */
export function RegionalAnalysis() {
  return (
    <>
      <InfoPanel storageKey="regional-v2">
        <strong>Regional analysis</strong> evaluates each region across two rubrics: <em>commercial</em>{' '}
        (TAM, end-market mix fit, revenue contribution, whitespace, competitive intensity) and{' '}
        <em>brand</em> (brand preference, trust, owned-channel engagement). Each region also receives a
        strategic label — Defend, Grow, Build, or Maintain — derived from its commercial scores. The
        commercial weight flows into Budget Allocation. {' '}
        <span className="muted">Note: in v1, only the commercial weight is used in allocator math. The
        brand rubric is captured for future use.</span>
      </InfoPanel>

      <ScoringGuideExpandable />
      <LabelLogicExpandable />

      <h3
        style={{
          fontSize: '20px',
          fontWeight: 500,
          marginBottom: '12px',
          letterSpacing: '-0.01em',
          color: 'var(--ink)',
        }}
      >
        Commercial rubric
      </h3>
      <FactorImportanceRow rubricKey="commercial" rubricLabel="Commercial" />
      <ScoringMatrix
        rubricKey="commercial"
        rubricLabel="Commercial"
        weightKey="commercial"
        showLabel
      />

      <h3
        style={{
          fontSize: '20px',
          fontWeight: 500,
          marginBottom: '12px',
          marginTop: '32px',
          letterSpacing: '-0.01em',
          color: 'var(--ink)',
        }}
      >
        Brand rubric
      </h3>
      <FactorImportanceRow rubricKey="brand" rubricLabel="Brand" />
      <ScoringMatrix rubricKey="brand" rubricLabel="Brand" weightKey="brand" />

      <h3
        style={{
          fontSize: '20px',
          fontWeight: 500,
          marginBottom: '12px',
          marginTop: '32px',
          letterSpacing: '-0.01em',
          color: 'var(--ink)',
        }}
      >
        Output preview
      </h3>
      <AllocatorPreview />
    </>
  );
}
